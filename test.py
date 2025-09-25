# app.py
import os
import json
import pickle
import numpy as np
import faiss
from flask import Flask, request, jsonify

# Optional: pip install google-generativeai
import google.generativeai as genai

# ===============================
# Config
# ===============================
# Comma-separated list of allowed origins, e.g.:
# ALLOWED_ORIGINS="https://lawmate-lb.netlify.app,http://localhost:5173"
ALLOWED_ORIGINS = {
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "https://lawmate-lb.netlify.app,http://localhost:5173").split(",")
    if o.strip()
}

PORT = int(os.environ.get("PORT", 8080))

# ===============================
# App
# ===============================
app = Flask(__name__)

# ===============================
# Global state (lazy init)
# ===============================
flat_articles = None
article_vectors = None
index = None
files_ready = False
gemini_ready = False


# ===============================
# CORS helper
# ===============================
@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        # Only set to true if you actually use cookies/auth; here we don't
        resp.headers["Access-Control-Allow-Credentials"] = "false"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


def _preflight_ok():
    """Return a minimal successful preflight response."""
    return ("", 204)


# ===============================
# Lazy initialization
# ===============================
def init_gemini():
    global gemini_ready
    if gemini_ready:
        return
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("[WARN] GOOGLE_API_KEY is not set. Gemini will not be available.")
            return
        genai.configure(api_key=api_key)
        gemini_ready = True
        print("[OK] Gemini configured")
    except Exception as e:
        print("[ERROR] Gemini init failed:", e)


def init_files():
    global flat_articles, article_vectors, index, files_ready
    if files_ready:
        return
    try:
        if not os.path.exists("articles.pkl"):
            raise FileNotFoundError("articles.pkl not found")
        if not os.path.exists("embeddings.npy"):
            raise FileNotFoundError("embeddings.npy not found")
        if not os.path.exists("faiss_index.index"):
            raise FileNotFoundError("faiss_index.index not found")

        with open("articles.pkl", "rb") as f:
            flat_articles = pickle.load(f)
        article_vectors = np.load("embeddings.npy")
        index = faiss.read_index("faiss_index.index")
        files_ready = True
        print(f"[OK] Loaded {len(flat_articles)} articles, embeddings {article_vectors.shape}, FAISS {index.ntotal}")
    except Exception as e:
        print("[ERROR] File init failed:", e)


@app.before_request
def ensure_inited():
    # Make sure we always try to init, but don't crash the process
    init_gemini()
    init_files()


# ===============================
# Gemini helpers
# ===============================
def get_embedding_from_gemini(text):
    """Get text embedding using Gemini's embedding model."""
    if not gemini_ready:
        raise RuntimeError("Gemini not initialized")
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
        )
        return np.array(result["embedding"], dtype=np.float32)
    except Exception as e:
        raise RuntimeError(f"Embedding generation error: {e}")


def generate_gemini_response(prompt, model_name="gemini-1.5-flash"):
    """Generate response from Gemini with proper error handling."""
    if not gemini_ready:
        raise RuntimeError("Gemini not initialized")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return (response.text or "").strip()
    except Exception as e:
        raise RuntimeError(f"Gemini generation error: {e}")


def answer_like_lawyer_gemini(question, retrieved_articles):
    """Generate detailed legal answer using Gemini."""
    context = "\n\n".join([
        f"📄 {a.get('law','(غير معروف)')} - المادة {a.get('article_number','?')}:\n{a.get('text','')}"
        for a in (retrieved_articles or [])
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
""".strip()
    return generate_gemini_response(prompt)


def translate_text(text, source_lang, target_lang):
    """Translate text using Gemini."""
    prompt = f"""ترجم النص التالي من {source_lang} إلى {target_lang} بدون أي إضافات:

النص:
{text}

الترجمة:"""
    return generate_gemini_response(prompt)


def short_conclusion_gemini(question, retrieved_articles):
    """Generate short legal conclusion using Gemini."""
    context = "\n\n".join([
        f"📄 {a.get('law','(غير معروف)')} - المادة {a.get('article_number','?')}:\n{a.get('text','')}"
        for a in (retrieved_articles or [])
    ])

    prompt = f"""
أنت محامٍ قانوني محترف ومتخصص في القوانين اللبنانية. أجب على السؤال التالي بجملة واحدة قصيرة جداً (10-30 كلمة كحد أقصى) مستنداً إلى هذه القوانين إذا كانت ذات صلة، وبأسلوب واضح وسهل الفهم. إذا لم تكن المواد كافية، قدم إجابة عامة مختصرة:

🟠 السؤال:
{question}

📘 المواد القانونية:
{context}

🔵 الخلاصة:
""".strip()
    return generate_gemini_response(prompt)


# ===============================
# Utility
# ===============================
def require_json():
    if not request.is_json:
        return False, jsonify({"error": "Request must be JSON"}), 400
    try:
        data = request.get_json(silent=False)
        return True, data, None
    except Exception:
        # If body is invalid JSON, still return CORS-wrapped error
        raw = request.get_data(as_text=True)
        return False, jsonify({"error": "Invalid JSON", "body": raw}), 400


def ready_or_500():
    if not files_ready:
        return False, jsonify({"error": "Server files not initialized"}), 500
    if not gemini_ready:
        return False, jsonify({"error": "Gemini not initialized (check GOOGLE_API_KEY)"}), 500
    return True, None, None


# ===============================
# Routes
# ===============================
@app.route("/api/health", methods=["GET", "OPTIONS"])
def health_check():
    if request.method == "OPTIONS":
        return _preflight_ok()
    return jsonify({
        "status": "healthy",
        "articles_loaded": len(flat_articles) if flat_articles else 0,
        "index_loaded": int(index.ntotal) if index else 0,
        "files_ready": files_ready,
        "gemini_ready": gemini_ready,
        "allowed_origins": list(ALLOWED_ORIGINS),
    })


@app.route("/api/test", methods=["GET", "POST", "OPTIONS"])
def test_endpoint():
    if request.method == "OPTIONS":
        return _preflight_ok()
    return jsonify({
        "status": "success",
        "method": request.method,
        "origin": request.headers.get("Origin", "No origin"),
        "message": "CORS is working",
    })


@app.route("/api/askai/short", methods=["POST", "OPTIONS"])
def askai_short():
    if request.method == "OPTIONS":
        return _preflight_ok()

    ok, data_or_resp, err = require_json()
    if not ok:
        return data_or_resp, err  # CORS-wrapped 400

    question = (data_or_resp or {}).get("question", "")
    lang = (data_or_resp or {}).get("lang", "ar")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    ok_ready, resp_ready, code_ready = ready_or_500()
    if not ok_ready:
        return resp_ready, code_ready

    # Translate if needed
    try:
        translated_question = translate_text(question, "English", "Arabic") if lang == "en" else question
    except Exception as e:
        return jsonify({"error": f"Translation failed: {e}"}), 500

    # Retrieve
    try:
        query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
        D, I = index.search(query_vec, 3)
        articles = [flat_articles[i] for i in I[0] if 0 <= i < len(flat_articles)]
    except Exception as e:
        return jsonify({"error": f"Search failed: {e}"}), 500

    # Generate short answer
    try:
        short_answer_ar = short_conclusion_gemini(translated_question, articles)
    except Exception as e:
        return jsonify({"error": f"Answer generation failed: {e}"}), 500

    response_data = {
        "articles": articles,
        "short_answer_ar": short_answer_ar,
    }

    # Return in question language
    try:
        if lang == "en":
            short_answer_en = translate_text(short_answer_ar, "Arabic", "English")
            response_data["short_answer"] = short_answer_en
            response_data["short_answer_en"] = short_answer_en
        else:
            response_data["short_answer"] = short_answer_ar
    except Exception as e:
        # Fall back to Arabic
        response_data["short_answer"] = short_answer_ar
        response_data["translation_error"] = str(e)

    return jsonify(response_data)


@app.route("/api/askai", methods=["POST", "OPTIONS"])
def askai():
    if request.method == "OPTIONS":
        return _preflight_ok()

    ok, data_or_resp, err = require_json()
    if not ok:
        return data_or_resp, err  # CORS-wrapped 400

    question = (data_or_resp or {}).get("question", "")
    lang = (data_or_resp or {}).get("lang", "ar")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    ok_ready, resp_ready, code_ready = ready_or_500()
    if not ok_ready:
        return resp_ready, code_ready

    # Translate if needed
    try:
        translated_question = translate_text(question, "English", "Arabic") if lang == "en" else question
    except Exception as e:
        return jsonify({"error": f"Translation failed: {e}"}), 500

    # Retrieve
    try:
        query_vec = get_embedding_from_gemini(translated_question).reshape(1, -1)
        D, I = index.search(query_vec, 3)
        articles = [flat_articles[i] for i in I[0] if 0 <= i < len(flat_articles)]
    except Exception as e:
        return jsonify({"error": f"Search failed: {e}"}), 500

    # Generate full answer
    try:
        answer_ar = answer_like_lawyer_gemini(translated_question, articles)
    except Exception as e:
        return jsonify({"error": f"Answer generation failed: {e}"}), 500

    response_data = {
        "articles": articles,
        "answer_ar": answer_ar,
    }

    # Return in question language
    try:
        if lang == "en":
            answer_en = translate_text(answer_ar, "Arabic", "English")
            response_data["answer"] = answer_en
            response_data["answer_en"] = answer_en
        else:
            response_data["answer"] = answer_ar
    except Exception as e:
        response_data["answer"] = answer_ar
        response_data["translation_error"] = str(e)

    return jsonify(response_data)


# ===============================
# Entrypoint
# ===============================
if __name__ == "__main__":
    # Do not eager-init here; let requests succeed with CORS even if init fails
    app.run(host="0.0.0.0", port=PORT, debug=False)
