# app.py (robust with fallbacks)
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

# IMPORTANT: runtime models (make them match what you used to build your index/embeddings)
EMBEDDING_MODEL   = os.getenv("EMBEDDING_MODEL", "models/embedding-001")
GEMINI_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-1.5-flash")  # e.g. gemini-1.5-flash, gemini-1.5-pro
SAFE_MODE         = os.getenv("SAFE_MODE", "0") == "1"  # bypass Gemini for quick checks

# ===============================
# App & globals
# ===============================
app = Flask(__name__)

flat_articles = None
article_vectors = None
index = None
files_ready = False
gemini_ready = False
diag_notes = []

# ===============================
# CORS
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
# Init
# ===============================
def init_gemini():
    global gemini_ready
    if gemini_ready or SAFE_MODE:
        return
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            diag_notes.append("GOOGLE_API_KEY missing.")
            return
        genai.configure(api_key=api_key)
        gemini_ready = True
        diag_notes.append(f"Gemini initialized with text model '{GEMINI_TEXT_MODEL}'.")
    except Exception as e:
        diag_notes.append(f"Gemini init failed: {e}")

def init_files():
    global flat_articles, article_vectors, index, files_ready
    if files_ready:
        return
    try:
        missing = [p for p in ["articles.pkl", "embeddings.npy", "faiss_index.index"] if not os.path.exists(p)]
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
    init_files()
    init_gemini()

# ===============================
# Helpers
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

def ready_or_200_with_fallback():
    """
    If SAFE_MODE or Gemini not ready, we still allow answering with fallbacks (no 500).
    If files missing, we must fail (we can't retrieve context).
    """
    if not files_ready:
        return False, jsonify({
            "error": "Server files not initialized",
            "hint": "Ensure articles.pkl, embeddings.npy, faiss_index.index exist in the working directory."
        }), 500
    # Gemini may be false if SAFE_MODE or key issues; we won't block here.
    return True, None, None

def get_embedding_from_gemini(text: str) -> np.ndarray:
    # In SAFE_MODE, we cannot call Gemini; raise to be caught by fallback below.
    if SAFE_MODE:
        raise RuntimeError("SAFE_MODE enabled (embedding skipped)")
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

def generate_gemini_response(prompt: str) -> str:
    if SAFE_MODE:
        raise RuntimeError("SAFE_MODE enabled (generation skipped)")
    if not gemini_ready:
        raise RuntimeError("Gemini not initialized")
    try:
        model = genai.GenerativeModel(GEMINI_TEXT_MODEL)
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

def format_fallback_answer(question, articles, lang="ar", short=False):
    """
    Build a simple, deterministic fallback using retrieved articles (no Gemini).
    """
    lines = []
    if short:
        # One-liner style
        if lang == "en":
            lines.append("Preliminary guidance based on retrieved Lebanese legal articles; consult a licensed attorney for a definitive opinion.")
        else:
            lines.append("خلاصة أولية استنادًا إلى المواد القانونية المسترجعة؛ يُنصح باستشارة محامٍ مختص للحصول على رأي نهائي.")
    else:
        # A concise structured answer
        if lang == "en":
            lines.append("Preliminary legal analysis (fallback):")
            lines.append(f"- Question: {question}")
            if articles:
                lines.append("- Potentially relevant articles:")
                for a in articles[:3]:
                    lines.append(f"  • {a.get('law','(unknown)')} – Article {a.get('article_number','?')}: {a.get('text','')[:240]}...")
            lines.append("Note: This is a heuristic summary. Please consult a licensed attorney for an authoritative opinion.")
        else:
            lines.append("تحليل قانوني أولي (مؤقت):")
            lines.append(f"- السؤال: {question}")
            if articles:
                lines.append("- مواد قانونية محتملة الصلة:")
                for a in articles[:3]:
                    lines.append(f"  • {a.get('law','(غير معروف)')} – المادة {a.get('article_number','?')}: {a.get('text','')[:240]}...")
            lines.append("ملاحظة: هذه خلاصة تقريبية. يُنصح بمراجعة محامٍ مختص للحصول على رأي موثوق.")
    return "\n".join(lines)

def _search_and_check_dim(query_text):
    """
    Try to embed & search; if embedding fails (SAFE_MODE or Gemini issue),
    fall back to a naive keyword similarity using numpy (optional) or just return top-N by index order.
    """
    try:
        q = get_embedding_from_gemini(query_text).reshape(1, -1)
        if index.d != q.shape[1]:
            return None, jsonify({
                "error": "Embedding dimension mismatch",
                "detail": f"FAISS index expects d={index.d}, but query has d={q.shape[1]}",
                "hint": "Rebuild embeddings/index with the SAME embedding model or set EMBEDDING_MODEL to match."
            }), 500
        D, I = index.search(q, 3)
        articles = [flat_articles[i] for i in I[0] if 0 <= i < len(flat_articles)]
        return articles, None, None
    except Exception as e:
        # Embedding failed; minimal fallback: return first 3 articles as a placeholder context
        diag_notes.append(f"Embedding/search failed, using fallback: {e}")
        articles = (flat_articles or [])[:3]
        return articles, None, None

# ===============================
# Routes
# ===============================
@app.route("/api/diag", methods=["GET", "OPTIONS"])
def diag():
    if request.method == "OPTIONS":
        return _preflight_ok()
    info = {
        "files_ready": files_ready,
        "gemini_ready": gemini_ready and not SAFE_MODE,
        "safe_mode": SAFE_MODE,
        "allowed_origins": list(ALLOWED_ORIGINS),
        "embedding_model": EMBEDDING_MODEL,
        "text_model": GEMINI_TEXT_MODEL,
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
        "gemini_ready": gemini_ready and not SAFE_MODE,
        "safe_mode": SAFE_MODE,
        "allowed_origins": list(ALLOWED_ORIGINS),
        "embedding_model": EMBEDDING_MODEL,
        "text_model": GEMINI_TEXT_MODEL,
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
        return data_or_resp, err

    question = (data_or_resp or {}).get("question", "")
    lang = (data_or_resp or {}).get("lang", "ar")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    ok_ready, resp_ready, code_ready = ready_or_200_with_fallback()
    if not ok_ready:
        return resp_ready, code_ready

    # Translate (best-effort)
    try:
        translated_question = translate_text(question, "English", "Arabic") if (lang == "en" and not SAFE_MODE) else question
    except Exception as e:
        diag_notes.append(f"Translation error, using original: {e}")
        translated_question = question

    # Retrieve
    articles, err_resp, err_code = _search_and_check_dim(translated_question)
    if err_resp:
        return err_resp, err_code

    # Generate short answer (best-effort)
    try:
        short_answer_ar = short_conclusion_gemini(translated_question, articles)
        resp = {
            "articles": articles,
            "short_answer_ar": short_answer_ar,
            "fallback_used": False
        }
    except Exception as e:
        # Fallback one-liner
        fallback = format_fallback_answer(question, articles, lang="ar", short=True)
        resp = {
            "articles": articles,
            "short_answer_ar": fallback,
            "fallback_used": True,
            "error_detail": f"short generation failed: {e}"
        }

    # Return in requested language
    try:
        if lang == "en" and not SAFE_MODE:
            ans_en = translate_text(resp["short_answer_ar"], "Arabic", "English")
            resp["short_answer"] = ans_en
            resp["short_answer_en"] = ans_en
        else:
            resp["short_answer"] = resp["short_answer_ar"]
    except Exception as e:
        resp["short_answer"] = resp["short_answer_ar"]
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

    ok_ready, resp_ready, code_ready = ready_or_200_with_fallback()
    if not ok_ready:
        return resp_ready, code_ready

    # Translate (best-effort)
    try:
        translated_question = translate_text(question, "English", "Arabic") if (lang == "en" and not SAFE_MODE) else question
    except Exception as e:
        diag_notes.append(f"Translation error, using original: {e}")
        translated_question = question

    # Retrieve
    articles, err_resp, err_code = _search_and_check_dim(translated_question)
    if err_resp:
        return err_resp, err_code

    # Generate full answer (best-effort)
    try:
        answer_ar = answer_like_lawyer_gemini(translated_question, articles)
        resp = {
            "articles": articles,
            "answer_ar": answer_ar,
            "fallback_used": False
        }
    except Exception as e:
        # Fallback structured answer
        fallback = format_fallback_answer(question, articles, lang="ar", short=False)
        resp = {
            "articles": articles,
            "answer_ar": fallback,
            "fallback_used": True,
            "error_detail": f"answer generation failed: {e}"
        }

    # Return in requested language
    try:
        if lang == "en" and not SAFE_MODE:
            ans_en = translate_text(resp["answer_ar"], "Arabic", "English")
            resp["answer"] = ans_en
            resp["answer_en"] = ans_en
        else:
            resp["answer"] = resp["answer_ar"]
    except Exception as e:
        resp["answer"] = resp["answer_ar"]
        resp["translation_error"] = str(e)

    return jsonify(resp)

# ===============================
# Entrypoint
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
