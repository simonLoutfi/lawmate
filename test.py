from pathlib import Path
import json
from sentence_transformers import SentenceTransformer
import pickle
import numpy as np
import faiss
import google.generativeai as genai
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# drive.mount('/content/drive')
model = SentenceTransformer("acayir64/arabic-embedding-model-pair-class2")

json_folder = Path("json_articles")
law_articles = {}

for file in json_folder.glob("*.json"):
    try:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            law_articles[file.stem] = data
    except json.JSONDecodeError as e:
        print(f"❌ JSONDecodeError in file: {file.name}")
        print(f"   → {e}")

print(f"✅ Loaded {sum(len(v) for v in law_articles.values())} articles from {len(law_articles)} laws")

flat_articles = []
for law_name, articles in law_articles.items():
    for art in articles:
        flat_articles.append({
            "law": law_name,
            "article_number": art.get("article_number", ""),
            "text": art["text"]
        })

texts = [a["text"] for a in flat_articles]
#article_embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)


# Load article data
with open("articles.pkl", "rb") as f:
    flat_articles = pickle.load(f)

# Load embeddings
article_vectors = np.load("embeddings.npy")

# Load FAISS index
index = faiss.read_index("faiss_index.index")

# Set your API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# genai.configure(api_key="AIzaSyDkvSL8COT7e-C7Wk_ClYnVOm5QLkNXieE")

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


def retrieve_articles_from_law(query, law_name, top_k=3):
    filtered = [a for a in flat_articles if a['law'] == law_name]
    texts = [a["text"] for a in filtered]

    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)

    temp_index = faiss.IndexFlatL2(embeddings.shape[1])
    temp_index.add(np.array(embeddings))

    D, I = temp_index.search(np.array(query_vec), top_k)
    return [filtered[i] for i in I[0]]

def ask_model_for_law_name(question, law_list):
    prompt = f"""
السؤال التالي متعلق بقانون لبناني. لديك قائمة بأسماء القوانين التالية:
- {', '.join(law_list)}

استخرج اسم القانون الأكثر علاقة بالسؤال التالي:
"{question}"

واكتب فقط اسم القانون المطابق تمامًا من القائمة أعلاه.
"""
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

app = Flask(__name__)
CORS(app)

@app.route('/api/askai/short', methods=['POST'])
def askai_short():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')  # Expecting 'ar' or 'en'

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Translate question if needed
    if lang == 'en':
        translated_question = translate_text(question, "الإنجليزية", "العربية")
    else:
        translated_question = question

    # Retrieve relevant articles using FAISS
    query_vec = model.encode([translated_question], convert_to_numpy=True, normalize_embeddings=True)
    D, I = index.search(np.array(query_vec), 3)
    retrieved_articles = [flat_articles[i] for i in I[0]]

    # Generate short Arabic answer
    short_answer_ar = short_conclusion_gemini(translated_question, retrieved_articles)

    if lang == 'en':
        # Translate short answer back to English
        short_answer_en = translate_text(short_answer_ar, "العربية", "الإنجليزية")
        return jsonify({
            'short_answer': short_answer_en,
            'short_answer_ar': short_answer_ar,
            'articles': retrieved_articles
        })
    else:
        return jsonify({
            'short_answer': short_answer_ar,
            'articles': retrieved_articles
        })


@app.route('/api/askai', methods=['POST'])
def askai():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')  # 'ar' or 'en'

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    if lang == 'en':
        # Translate English question to Arabic for processing
        translated_question = translate_text(question, "الإنجليزية", "العربية")
    else:
        translated_question = question

    # Semantic search using Arabic version of question
    query_vec = model.encode([translated_question], convert_to_numpy=True, normalize_embeddings=True)
    D, I = index.search(np.array(query_vec), 3)
    retrieved_articles = [flat_articles[i] for i in I[0]]

    # Generate answer in Arabic
    answer_arabic = answer_like_lawyer_gemini(translated_question, retrieved_articles)

    if lang == 'en':
        # Translate the Arabic answer back to English
        answer_english = translate_text(answer_arabic, "العربية", "الإنجليزية")
        return jsonify({
            'answer': answer_english,
            'answer_ar': answer_arabic,
            'articles': retrieved_articles
        })
    else:
        return jsonify({
            'answer': answer_arabic,
            'articles': retrieved_articles
        })


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))

