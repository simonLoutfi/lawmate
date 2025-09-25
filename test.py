from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import numpy as np
import faiss
import pickle
import os

# === Setup Gemini API ===
print("=== STARTUP: Configuring Gemini API ===")
try:
    # Use environment variable for security
    api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyD2LhiJ5Lhe2QxMejpL_A_msbzs_Gf5BJc")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found")
    
    genai.configure(api_key=api_key)
    print("SUCCESS: Gemini API configured")
except Exception as e:
    print(f"ERROR configuring Gemini: {e}")
    raise

# === Load precomputed files ===
print("=== STARTUP: Loading precomputed files ===")
flat_articles = None
article_vectors = None
index = None

try:
    # Check if files exist
    if not os.path.exists("articles.pkl"):
        raise FileNotFoundError("articles.pkl not found")
    if not os.path.exists("embeddings.npy"):
        raise FileNotFoundError("embeddings.npy not found")
    if not os.path.exists("faiss_index.index"):
        raise FileNotFoundError("faiss_index.index not found")
    
    with open("articles.pkl", "rb") as f:
        flat_articles = pickle.load(f)
    print(f"SUCCESS: Loaded {len(flat_articles)} articles")
    
    article_vectors = np.load("embeddings.npy")
    print(f"SUCCESS: Loaded embeddings with shape {article_vectors.shape}")
    
    index = faiss.read_index("faiss_index.index")
    print(f"SUCCESS: Loaded FAISS index with {index.ntotal} vectors")
    
except Exception as e:
    print(f"ERROR loading files: {e}")
    raise

print("=== STARTUP: All files loaded successfully ===")

# === Gemini Helper Functions ===
def get_embedding_from_gemini(text):
    """Get text embedding using Gemini's embedding model"""
    try:
        print(f"DEBUG: Generating embedding for text: {text[:100]}...")
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        embedding = np.array(result["embedding"], dtype=np.float32)
        print(f"DEBUG: Embedding generated, shape: {embedding.shape}")
        return embedding
    except Exception as e:
        print(f"Embedding generation error: {str(e)}")
        raise

def generate_gemini_response(prompt, model_name="gemini-1.5-flash"):
    """Generate response from Gemini with proper error handling"""
    try:
        print(f"DEBUG: Generating response with model: {model_name}")
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
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بصيغة قانونية رسمية ومقنعة:

🟠 السؤال:
{question}

📘 المواد القانونية المتاحة:
{context if context else 'لا توجد مواد قانونية متاحة مباشرة'}

🔵 الجواب:
1. ابدأ بتحليل السؤال القانوني المطروح
2. اذكر أي مواد قانونية ذات صلة من المواد المتاحة مع تفسير موجز لكيفية تطبيقها
3. إذا كانت المواد غير كافية، قدم إرشادات عامة حول:
   - القوانين اللبنانية ذات الصلة التي يجب الرجوع إليها
   - الإجراءات القانونية المتبعة في مثل هذه الحالات
   - النصائح العامة للتعامل مع المسألة قانونياً
4. أكد على أهمية استشارة محامٍ متخصص للحصول على مشورة قانونية دقيقة

تجنب القول بأن المواد غير ذات صلة. بدلاً من ذلك، قدم إرشادات مفيدة بناءً على خبرتك القانونية.
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
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بجملة واحدة قصيرة جداً (10-30 كلمة كحد أقصى) مستنداً إلى هذه القوانين إذا كانت ذات صلة، وبأسلوب واضح وسهل الفهم. إذا لم تكن المواد كافية، قدم إجابة عامة مختصرة:

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

# Simple CORS configuration
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "articles_loaded": len(flat_articles) if flat_articles else 0,
        "index_loaded": index.ntotal if index else 0
    })

@app.route('/api/test', methods=['GET', 'POST'])
def test_endpoint():
    """Test endpoint to verify CORS is working"""
    return jsonify({
        "status": "success",
        "method": request.method,
        "origin": request.headers.get('Origin', 'No origin'),
        "message": "CORS is working"
    })

@app.route('/api/askai/short', methods=['POST'])
def askai_short():
    try:
        print("=== DEBUG: Starting askai_short ===")
        print(f"Request headers: {dict(request.headers)}")
        
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

        # Check if required components are loaded
        if not all([flat_articles, article_vectors is not None, index]):
            print("ERROR: Required components not loaded")
            return jsonify({'error': 'Server not properly initialized'}), 500

        # Translate question if needed
        print("DEBUG: Starting translation...")
        try:
            if lang == 'en':
                translated_question = translate_text(question, "English", "Arabic")
                print(f"DEBUG: Translated question (EN->AR): {translated_question}")
            else:
                translated_question = question
                print(f"DEBUG: Question already in Arabic: {translated_question}")
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
            retrieved_articles = [flat_articles[i] for i in I[0] if i < len(flat_articles)]
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
            'articles': retrieved_articles,
            'short_answer_ar': short_answer_ar
        }
        
        # Return answer in the same language as the question
        if lang == 'en':
            print("DEBUG: Translating answer to English...")
            try:
                short_answer_en = translate_text(short_answer_ar, "Arabic", "English")
                response_data['short_answer'] = short_answer_en
                response_data['short_answer_en'] = short_answer_en
                print(f"DEBUG: English translation: {short_answer_en}")
            except Exception as e:
                print(f"ERROR in answer translation: {str(e)}")
                # Still return the Arabic answer even if translation fails
                response_data['short_answer'] = short_answer_ar
        else:
            response_data['short_answer'] = short_answer_ar

        print("DEBUG: Returning successful response")
        return jsonify(response_data)

    except Exception as e:
        print(f"ERROR in askai_short (unexpected): {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/askai', methods=['POST'])
def askai():
    try:
        print("=== DEBUG: Starting askai ===")
        print(f"Request headers: {dict(request.headers)}")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        question = data.get('question', '')
        lang = data.get('lang', 'ar')

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Check if required components are loaded
        if not all([flat_articles, article_vectors is not None, index]):
            return jsonify({'error': 'Server not properly initialized'}), 500

        # Translate question if needed
        print("DEBUG: Starting translation...")
        try:
            if lang == 'en':
                translated_question = translate_text(question, "English", "Arabic")
                print(f"DEBUG: Translated question (EN->AR): {translated_question}")
            else:
                translated_question = question
                print(f"DEBUG: Question already in Arabic: {translated_question}")
        except Exception as e:
            print(f"ERROR in translation: {str(e)}")
            return jsonify({'error': f'Translation failed: {str(e)}'}), 500
        
        # Get relevant articles
        query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
        D, I = index.search(query_vec, 3)
        retrieved_articles = [flat_articles[i] for i in I[0] if i < len(flat_articles)]

        # Generate answer
        answer_arabic = answer_like_lawyer_gemini(translated_question, retrieved_articles)
        
        # Prepare response
        response_data = {
            'articles': retrieved_articles,
            'answer_ar': answer_arabic
        }
        
        # Return answer in the same language as the question
        if lang == 'en':
            print("DEBUG: Translating answer to English...")
            try:
                answer_en = translate_text(answer_arabic, "Arabic", "English")
                response_data['answer'] = answer_en
                response_data['answer_en'] = answer_en
                print(f"DEBUG: English translation: {answer_en}")
            except Exception as e:
                print(f"ERROR in answer translation: {str(e)}")
                response_data['answer'] = answer_arabic
        else:
            response_data['answer'] = answer_arabic

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in askai: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)), debug=False)
