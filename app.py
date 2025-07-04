from pathlib import Path
import json
from sentence_transformers import SentenceTransformer
import pickle
import numpy as np
import faiss
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import cached_property
from threading import Thread

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class ResourceLoader:
    """Lazy-load heavy resources only when needed"""
    
    @cached_property
    def sentence_model(self):
        print("Loading SentenceTransformer model (this happens only once)...")
        model = SentenceTransformer("acayir64/arabic-embedding-model-pair-class2", device='cpu')
        return model.half()  # 50% memory reduction

    @cached_property
    def faiss_index(self):
        print("Loading FAISS index (this happens only once)...")
        # Load pre-processed data
        with open("articles.pkl", "rb") as f:
            self.flat_articles = pickle.load(f)
        vectors = np.load("embeddings.npy")
        index = faiss.read_index("faiss_index_quantized.index")
        return index

    @cached_property
    def gemini_model(self):
        print("Initializing Gemini (this happens only once)...")
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        return genai.GenerativeModel("gemini-2.0-flash")

# Global lazy loader
loader = ResourceLoader()

# Warm-up in background (optional)
def warm_up_resources():
    print("Background pre-loading of resources...")
    _ = loader.sentence_model
    _ = loader.faiss_index

@app.before_first_request
def startup():
    Thread(target=warm_up_resources).start()

# Helper functions
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
    response = loader.gemini_model.generate_content(prompt)
    return response.text.strip()

def translate_text(text, source_lang, target_lang):
    prompt = f"""ترجم النص التالي من {source_lang} إلى {target_lang} بدون أي إضافات:

النص:
{text}

الترجمة:"""
    response = loader.gemini_model.generate_content(prompt)
    return response.text.strip()

# Routes
@app.route('/health')
def health_check():
    """Critical for Render - must respond quickly without loading resources"""
    return jsonify({"status": "healthy"}), 200

@app.route('/api/askai', methods=['POST'])
def askai():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Translation handling
    if lang == 'en':
        translated_question = translate_text(question, "الإنجليزية", "العربية")
    else:
        translated_question = question

    # Semantic search (lazy-loads sentence_model and faiss_index)
    query_vec = loader.sentence_model.encode(
        [translated_question],
        convert_to_numpy=True,
        normalize_embeddings=True,
        precision='half'
    ).astype(np.float32)
    
    D, I = loader.faiss_index.search(query_vec, 3)
    retrieved_articles = [loader.flat_articles[i] for i in I[0]]

    # Generate answer (lazy-loads gemini_model)
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

@app.route('/api/askai/short', methods=['POST'])
def askai_short():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Translation handling (lazy-loads Gemini if needed)
    if lang == 'en':
        translated_question = translate_text(question, "الإنجليزية", "العربية")
    else:
        translated_question = question

    # Semantic search (lazy-loads sentence_model and faiss_index)
    query_vec = loader.sentence_model.encode(
        [translated_question],
        convert_to_numpy=True,
        normalize_embeddings=True,
        precision='half'
    ).astype(np.float32)
    
    D, I = loader.faiss_index.search(query_vec, 3)
    retrieved_articles = [loader.flat_articles[i] for i in I[0]]

    # Generate short answer (lazy-loads Gemini)
    context = "\n\n".join([
        f"📄 {a['law']} - المادة {a['article_number']}:\n{a['text']}"
        for a in retrieved_articles
    ])
    
    prompt = f"""
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بجملة واحدة قصيرة جداً (10-30 كلمة كحد أقصى) مستنداً إلى هذه القوانين، وبأسلوب واضح وسهل الفهم:

🟠 السؤال:
{translated_question}

📘 المواد القانونية:
{context}

🔵 الخلاصة:
"""
    try:
        short_answer_ar = loader.gemini_model.generate_content(prompt).text.strip()
        
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
        
    except Exception as e:
        print(f"Gemini error: {str(e)}")
        fallback_answer = "إجابة مختصرة: ينص القانون على ذلك" if lang == 'ar' else "Short answer: The law states this"
        return jsonify({
            'short_answer': fallback_answer,
            'articles': retrieved_articles
        })
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)