# app.py (with diagnostics & dim check)
import os
import pickle
import numpy as np
import faiss
from flask import Flask, request, jsonify
import google.generativeai as genai

# ===============================
# Config
# ===============================
ALLOWED_ORIGINS = {
    o.strip() for o in os.getenv(
        "ALLOWED_ORIGINS",
        "https://lawmate-lb.netlify.app,http://localhost:5173"
    ).split(",") if o.strip()
}
PORT = int(os.environ.get("PORT", 8080))

# IMPORTANT: set this to the SAME model you used to build embeddings.npy/faiss_index.index
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "models/embedding-001")

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
diag_notes = []  # collect debug notes visible via /api/diag

# ===============================
# CORS helper
# ===============================
@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Credentials"] = "false"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp

def _preflight_ok():
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
            # TEMP fallback so you can test; remove once env var is set
            api_key = "AIzaSyD2LhiJ5Lhe2QxMejpL_A_msbzs_Gf5BJc"
            diag_notes.append("GOOGLE_API_KEY missing; using TEMP fallback key. (Set GOOGLE_API_KEY in env!)")
        genai.configure(api_key=api_key)
        gemini_ready = True
        diag_notes.append("Gemini initialized OK.")
    except Exception as e:
        diag_notes.append(f"Gemini init failed: {e}")

def init_files():
    global flat_articles, article_vectors, index, files_ready
    if files_ready:
        return
    try:
        missing = []
        for f in ["articles.pkl", "embeddings.npy", "faiss_index.index"]:
            if not os.path.exists(f):
                missing.append(f)
        if missing:
            diag_notes.append(f"Missing files: {missing}")
            return

        with open("articles.pkl", "rb") as f:
            flat_articles = pickle.load(f)
        article_vectors = np.load("embeddings.npy")
        index = faiss.read_index("faiss_index.index")
        files_ready = True
        diag_notes.append(
            f"Files OK: articles={len(flat_articles)}, "
            f"embeddings_shape={tuple(article_vectors.shape)}, "
            f"faiss_ntotal={index.ntotal}, faiss_d={index.d}"
        )
    except Exception as e:
        diag_notes.append(f"File init failed: {e}")

@app.before_request
def ensure_inited():
    init_gemini()
    init_files()

# ===============================
# Gemini helpers
# ===============================
def get_embedding_from_gemini(text: str) -> np.ndarray:
    if not gemini_ready:
        raise RuntimeError("Gemini not initialized")
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
        )
        emb = np.array(result["embedding"], dtype=np.float32)
        return emb
    except Exception as e:
        raise RuntimeError(f"Embedding generation error: {e}")

def generate_gemini_response(prompt: str, model_name: str = "gemini-1.5-flash") -> str:
    if not gemini_ready:
        raise RuntimeError("Gemini not initialized")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return (response.text or "").strip()
    except Exception as e:
        raise RuntimeError(f"Gemini generation error: {e}")

def answer_like_lawyer_gemini(question, retrieved_articles):
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
    prompt = f"""ترجم النص التالي من {source_lang} إلى {target_lang} بدون أي إضافات:

النص:
{text}

الترجمة:"""
    return generate_gemini_response(prompt)

def short_conclusion_gemini(question, retrieved_articles):
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
# Utilities
# ===============================
def require_json():
    if not request.is_json:
        return False, jsonify({"error": "Request must be JSON"}), 400
    try:
        data = request.get_json(silent=False)
        if data is None:
            return False, jsonify({"error": "Empty JSON body"}), 400
        return True, data, None
    except Exception as e:
        raw = request.get_data(as_text=True)
        return False, jsonify({"error": "Invalid JSON", "detail": str(e), "body": raw}), 400

def ready_or_500():
    if not files_ready:
        return False, jsonify({
            "error": "Server files not initialized",
            "hint": "Ensure articles.pkl, embeddings.npy, faiss_index.index exist in the working directory."
        }), 500
    if not gemini_ready:
        return False, jsonify({
            "error": "Gemini not initialized",
            "hint": "Set GOOGLE_API_KEY in environment (or remove TEMP fallback)."
        }), 500
    return True, None, None

# ===============================
# Routes
# ===============================
@app.route("/api/diag", methods=["GET", "OPTIONS"])
def diag():
    if request.method == "OPTIONS":
        return _preflight_ok()
    info = {
        "files_ready": files_ready,
        "gemini_ready": gemini_ready,
        "allowed_origins": list(ALLOWED_ORIGINS),
        "embedding_model": EMBEDDING_MODEL,
        "notes": diag_notes[-20:],
    }
    if files_ready and index is not None and article_vectors is not None:
        info.update({
            "faiss_ntotal": int(index.ntotal),
            "faiss_d": int(index.d),
            "embeddings_shape": tuple(article_vectors.shape),
        })
    return jsonify(info)

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
        "embedding_model": EMBEDDING_MODEL,
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

def _search_and_check_dim(query_text):
    """Embed, check dimension vs FAISS, then search."""
    q = get_embedding_from_gemini(query_text).reshape(1, -1)
    if index.d != q.shape[1]:
        # Clear, actionable error (very common)
        return None, jsonify({
            "error": "Embedding dimension mismatch",
            "detail": f"FAISS index expects d={index.d}, but query has d={q.shape[1]}",
            "hint": "Rebuild embeddings.npy & faiss_index.index with the SAME embedding model "
                    f"('{EMBEDDING_MODEL}') that the server is using now; or set EMBEDDING_MODEL to your original."
        }), 500
    D, I = index.search(q, 3)
    articles = [flat_articles[i] for i in I[0] if 0 <= i < len(flat_articles)]
    return articles, None, None

@app.route("/api/askai/short", methods=["POST", "OPTIONS"])
def askai_short():
    if request.method == "OPTIONS":
        return _preflight_ok()

    ok, data_or_resp, err = require_json()
    if not ok:
        return data_or_resp, err

    question = (data_or_resp or {}).get("question", "")
    lang = (data_or_resp or {}).get("lang", "ar")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    ok_ready, resp_ready, code_ready = ready_or_500()
    if not ok_ready:
        return resp_ready, code_ready

    try:
        translated_question = translate_text(question, "English", "Arabic") if lang == "en" else question
    except Exception as e:
        return jsonify({"error": "Translation failed", "detail": str(e)}), 500

    try:
        articles, err_resp, err_code = _search_and_check_dim(translated_question)
        if err_resp:
            return err_resp, err_code
    except Exception as e:
        return jsonify({"error": "Search failed", "detail": str(e)}), 500

    try:
        short_answer_ar = short_conclusion_gemini(translated_question, articles)
    except Exception as e:
        return jsonify({"error": "Answer generation failed", "detail": str(e)}), 500

    resp = {"articles": articles, "short_answer_ar": short_answer_ar}
    try:
        if lang == "en":
            ans_en = translate_text(short_answer_ar, "Arabic", "English")
            resp["short_answer"] = ans_en
            resp["short_answer_en"] = ans_en
        else:
            resp["short_answer"] = short_answer_ar
    except Exception as e:
        resp["short_answer"] = short_answer_ar
        resp["translation_error"] = str(e)
    return jsonify(resp)

@app.route("/api/askai", methods=["POST", "OPTIONS"])
def askai():
    if request.method == "OPTIONS":
        return _preflight_ok()

    ok, data_or_resp, err = require_json()
    if not ok:
        return data_or_resp, err

    question = (data_or_resp or {}).get("question", "")
    lang = (data_or_resp or {}).get("lang", "ar")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    ok_ready, resp_ready, code_ready = ready_or_500()
    if not ok_ready:
        return resp_ready, code_ready

    try:
        translated_question = translate_text(question, "English", "Arabic") if lang == "en" else question
    except Exception as e:
        return jsonify({"error": "Translation failed", "detail": str(e)}), 500

    try:
        articles, err_resp, err_code = _search_and_check_dim(translated_question)
        if err_resp:
            return err_resp, err_code
    except Exception as e:
        return jsonify({"error": "Search failed", "detail": str(e)}), 500

    try:
        answer_ar = answer_like_lawyer_gemini(translated_question, articles)
    except Exception as e:
        return jsonify({"error": "Answer generation failed", "detail": str(e)}), 500

    resp = {"articles": articles, "answer_ar": answer_ar}
    try:
        if lang == "en":
            ans_en = translate_text(answer_ar, "Arabic", "English")
            resp["answer"] = ans_en
            resp["answer_en"] = ans_en
        else:
            resp["answer"] = answer_ar
    except Exception as e:
        resp["answer"] = answer_ar
        resp["translation_error"] = str(e)
    return jsonify(resp)

# ===============================
# Entrypoint
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
