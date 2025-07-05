from pathlib import Path
import json
import pickle
import numpy as np
import faiss
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# === Setup Gemini API ===
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_embedding_from_gemini(text):
    model = genai.GenerativeModel(model_name="models/embedding-001")
    result = model.embed_content(
        content=text,
        task_type="retrieval_document"
    )
    return np.array(result["embedding"], dtype=np.float32)



# === Load precomputed files ===
with open("articles.pkl", "rb") as f:
    flat_articles = pickle.load(f)

article_vectors = np.load("embeddings.npy")
index = faiss.read_index("faiss_index.index")

# === Gemini-based answering ===
def answer_like_lawyer_gemini(question, retrieved_articles):
    context = "\n\n".join([
        f"📄 {a['law']} - المادة {a['article_number']}:\n{a['text']}"
        for a in retrieved_articles
    ])
    prompt = f"""
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بصيغة قانونية رسمية ومقنعة، واستند إلى المواد القانونية الواردة أدناه:

🟠 السؤال:
{question}

📘 المواد القانونية:
{context}

🔵 الجواب:
"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

def translate_text(text, source_lang, target_lang):
    prompt = f"""ترجم النص التالي من {source_lang} إلى {target_lang} بدون أي إضافات:

النص:
{text}

الترجمة:"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

def short_conclusion_gemini(question, retrieved_articles):
    context = "\n\n".join([
        f"📄 {a['law']} - المادة {a['article_number']}:\n{a['text']}"
        for a in retrieved_articles
    ])
    prompt = f"""
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي  بجملة واحدة قصيرة جداً (10-30 كلمة كحد أقصى) مستنداً إلى هذه القوانين، وبأسلوب واضح وسهل الفهم:

🟠 السؤال:
{question}

📘 المواد القانونية:
{context}

🔵 الخلاصة:
"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    print("Gemini raw response:", response.text)
    return response.text.strip()

# === Flask API Setup ===
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

@app.route('/api/askai/short', methods=['POST', 'OPTIONS'])
def askai_short():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    translated_question = translate_text(question, "الإنجليزية", "العربية") if lang == 'en' else question
    query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
    D, I = index.search(query_vec, 3)
    retrieved_articles = [flat_articles[i] for i in I[0]]

    short_answer_ar = short_conclusion_gemini(translated_question, retrieved_articles)
    if lang == 'en':
        short_answer_en = translate_text(short_answer_ar, "العربية", "الإنجليزية")
        return jsonify({
            'short_answer': short_answer_en,
            'short_answer_ar': short_answer_ar,
            'articles': retrieved_articles
        })
    return jsonify({
        'short_answer': short_answer_ar,
        'articles': retrieved_articles
    })

@app.route('/api/askai', methods=['POST', 'OPTIONS'])
def askai():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    translated_question = translate_text(question, "الإنجليزية", "العربية") if lang == 'en' else question
    query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
    D, I = index.search(query_vec, 3)
    retrieved_articles = [flat_articles[i] for i in I[0]]

    answer_arabic = answer_like_lawyer_gemini(translated_question, retrieved_articles)
    if lang == 'en':
        answer_english = translate_text(answer_arabic, "العربية", "الإنجليزية")
        return jsonify({
            'answer': answer_english,
            'answer_ar': answer_arabic,
            'articles': retrieved_articles
        })
    return jsonify({
        'answer': answer_arabic,
        'articles': retrieved_articles
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)), debug=False)
