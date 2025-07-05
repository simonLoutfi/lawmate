from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import numpy as np
import faiss
import pickle
import os

# === Setup Gemini API ===
print("=== STARTUP: Configuring Gemini API ===")
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GOOGLE_API_KEY environment variable not set")
    raise ValueError("GOOGLE_API_KEY environment variable is required")

genai.configure(api_key=api_key)
print("SUCCESS: Gemini API configured")

# === Load precomputed files ===
print("=== STARTUP: Loading precomputed files ===")
try:
    with open("articles.pkl", "rb") as f:
        flat_articles = pickle.load(f)
    print(f"SUCCESS: Loaded {len(flat_articles)} articles")
except FileNotFoundError:
    print("ERROR: articles.pkl not found")
    raise
except Exception as e:
    print(f"ERROR loading articles.pkl: {e}")
    raise

try:
    article_vectors = np.load("embeddings.npy")
    print(f"SUCCESS: Loaded embeddings with shape {article_vectors.shape}")
except FileNotFoundError:
    print("ERROR: embeddings.npy not found")
    raise
except Exception as e:
    print(f"ERROR loading embeddings.npy: {e}")
    raise

try:
    index = faiss.read_index("faiss_index.index")
    print(f"SUCCESS: Loaded FAISS index with {index.ntotal} vectors")
except FileNotFoundError:
    print("ERROR: faiss_index.index not found")
    raise
except Exception as e:
    print(f"ERROR loading faiss_index.index: {e}")
    raise

print("=== STARTUP: All files loaded successfully ===")

# Test Gemini API connection
print("=== STARTUP: Testing Gemini API connection ===")
try:
    test_embedding = get_embedding_from_gemini("test")
    print(f"SUCCESS: Gemini API working, embedding shape: {test_embedding.shape}")
except Exception as e:
    print(f"ERROR: Gemini API test failed: {e}")
    raise

print("=== STARTUP: All systems ready ===")


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

# Configure CORS with more explicit settings
CORS(app, 
     origins=["https://lawmate-lb.netlify.app", "http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True,
     max_age=3600)

# Remove the after_request handler to avoid duplicate headers
# The CORS extension will handle all the headers automatically

@app.route('/api/askai/short', methods=['POST', 'OPTIONS'])
def askai_short():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        print("=== DEBUG: Starting askai_short ===")
        
        # Check if request has JSON data
        if not request.is_json:
            print("ERROR: Request is not JSON")
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        
        if not data:
            print("ERROR: No data provided")
            return jsonify({'error': 'No data provided'}), 400
            
        question = data.get('question', '')
        lang = data.get('lang', 'ar')
        
        print(f"DEBUG: Question: {question}")
        print(f"DEBUG: Language: {lang}")

        if not question:
            print("ERROR: No question provided")
            return jsonify({'error': 'No question provided'}), 400

        # Translate question if needed
        print("DEBUG: Starting translation...")
        try:
            translated_question = translate_text(question, "الإنجليزية", "العربية") if lang == 'en' else question
            print(f"DEBUG: Translated question: {translated_question}")
        except Exception as e:
            print(f"ERROR in translation: {str(e)}")
            return jsonify({'error': f'Translation failed: {str(e)}'}), 500
        
        # Get relevant articles
        print("DEBUG: Getting embedding...")
        try:
            query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
            print(f"DEBUG: Query vector shape: {query_vec.shape}")
        except Exception as e:
            print(f"ERROR in embedding: {str(e)}")
            return jsonify({'error': f'Embedding failed: {str(e)}'}), 500
            
        print("DEBUG: Searching index...")
        try:
            D, I = index.search(query_vec, 3)
            retrieved_articles = [flat_articles[i] for i in I[0]]
            print(f"DEBUG: Retrieved {len(retrieved_articles)} articles")
        except Exception as e:
            print(f"ERROR in search: {str(e)}")
            return jsonify({'error': f'Search failed: {str(e)}'}), 500

        # Generate answer
        print("DEBUG: Generating short answer...")
        try:
            short_answer_ar = short_conclusion_gemini(translated_question, retrieved_articles)
            print(f"DEBUG: Generated answer: {short_answer_ar}")
        except Exception as e:
            print(f"ERROR in answer generation: {str(e)}")
            return jsonify({'error': f'Answer generation failed: {str(e)}'}), 500
        
        # Prepare response
        response_data = {
            'short_answer': short_answer_ar,
            'articles': retrieved_articles
        }
        
        # Translate answer if needed
        if lang == 'en':
            print("DEBUG: Translating answer to English...")
            try:
                response_data['short_answer_en'] = translate_text(short_answer_ar, "العربية", "الإنجليزية")
                response_data['short_answer_ar'] = short_answer_ar
                print(f"DEBUG: English translation: {response_data['short_answer_en']}")
            except Exception as e:
                print(f"ERROR in answer translation: {str(e)}")
                return jsonify({'error': f'Answer translation failed: {str(e)}'}), 500

        print("DEBUG: Returning successful response")
        return jsonify(response_data)

    except Exception as e:
        print(f"ERROR in askai_short (unexpected): {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/askai', methods=['POST', 'OPTIONS'])
def askai():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
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
