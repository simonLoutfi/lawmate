from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import numpy as np
import faiss
import pickle
import os

# === Setup Gemini API ===
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# === Load precomputed files ===
with open("articles.pkl", "rb") as f:
    flat_articles = pickle.load(f)

article_vectors = np.load("embeddings.npy")
index = faiss.read_index("faiss_index.index")

# === Gemini Helper Functions ===
def get_embedding_from_gemini(text):
    """Get text embedding using Gemini's embedding model"""
    try:
        model = genai.GenerativeModel("models/embedding-001")
        result = model.embed_content(
            content=text,
            task_type="retrieval_document"
        )
        return np.array(result["embedding"], dtype=np.float32)
    except Exception as e:
        print(f"Embedding generation error: {str(e)}")
        raise

def generate_gemini_response(prompt, model_name="gemini-1.5-flash"):
    """Generate response from Gemini with proper error handling"""
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini generation error: {str(e)}")
        raise

def answer_like_lawyer_gemini(question, retrieved_articles):
    """Generate detailed legal answer using Gemini"""
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
    return generate_gemini_response(prompt)

def translate_text(text, source_lang, target_lang):
    """Translate text using Gemini"""
    prompt = f"""ترجم النص التالي من {source_lang} إلى {target_lang} بدون أي إضافات:

النص:
{text}

الترجمة:"""
    return generate_gemini_response(prompt)

def short_conclusion_gemini(question, retrieved_articles):
    """Generate short legal conclusion using Gemini"""
    context = "\n\n".join([
        f"📄 {a['law']} - المادة {a['article_number']}:\n{a['text']}"
        for a in retrieved_articles
    ])
    prompt = f"""
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بجملة واحدة قصيرة جداً (10-30 كلمة كحد أقصى) مستنداً إلى هذه القوانين، وبأسلوب واضح وسهل الفهم:

🟠 السؤال:
{question}

📘 المواد القانونية:
{context}

🔵 الخلاصة:
"""
    response = generate_gemini_response(prompt)
    print("Gemini raw response:", response)
    return response

# === Flask API Setup ===
app = Flask(__name__)
# Configure CORS with specific allowed origins and methods
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://lawmate-lb.netlify.app", "http://localhost:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

@app.route('/api/askai/short', methods=['POST', 'OPTIONS'])
def askai_short():
    """Endpoint for short legal answers"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        question = data.get('question', '')
        lang = data.get('lang', 'ar')

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Translate question if needed
        translated_question = translate_text(question, "الإنجليزية", "العربية") if lang == 'en' else question
        
        # Get relevant articles
        query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
        D, I = index.search(query_vec, 3)
        retrieved_articles = [flat_articles[i] for i in I[0]]

        # Generate answer
        short_answer_ar = short_conclusion_gemini(translated_question, retrieved_articles)
        
        # Prepare response
        response_data = {
            'short_answer': short_answer_ar,
            'articles': retrieved_articles
        }
        
        # Translate answer if needed
        if lang == 'en':
            response_data['short_answer_en'] = translate_text(short_answer_ar, "العربية", "الإنجليزية")
            response_data['short_answer_ar'] = short_answer_ar

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in askai_short: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/askai', methods=['POST', 'OPTIONS'])
def askai():
    """Endpoint for detailed legal answers"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        question = data.get('question', '')
        lang = data.get('lang', 'ar')

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Translate question if needed
        translated_question = translate_text(question, "الإنجليزية", "العربية") if lang == 'en' else question
        
        # Get relevant articles
        query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
        D, I = index.search(query_vec, 3)
        retrieved_articles = [flat_articles[i] for i in I[0]]

        # Generate answer
        answer_arabic = answer_like_lawyer_gemini(translated_question, retrieved_articles)
        
        # Prepare response
        response_data = {
            'answer': answer_arabic,
            'articles': retrieved_articles
        }
        
        # Translate answer if needed
        if lang == 'en':
            response_data['answer_en'] = translate_text(answer_arabic, "العربية", "الإنجليزية")
            response_data['answer_ar'] = answer_arabic

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in askai: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)), debug=False)
