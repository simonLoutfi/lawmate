from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from pathlib import Path
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# 1. Load Law Data Only
def load_law_data():
    law_articles = {}
    json_folder = Path("json_articles")
    
    for file in json_folder.glob("*.json"):
        try:
            with open(file, "r", encoding="utf-8") as f:
                law_articles[file.stem] = json.load(f)
        except Exception as e:
            print(f"Error loading {file}: {str(e)}")
    
    print(f"Loaded {sum(len(v) for v in law_articles.values())} articles from {len(law_articles)} laws")
    return law_articles

# Load data at startup
law_articles = load_law_data()

# 2. Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

def find_relevant_articles(question):
    """Use Gemini to find relevant articles from loaded law data"""
    articles_text = "\n".join(
        f"{law_name} Article {art['article_number']}: {art['text']}"
        for law_name, articles in law_articles.items()
        for art in articles
    )
    
    prompt = f"""
    Analyze this legal question and identify the 3 most relevant articles from the context below.
    Return ONLY a JSON array in this format: 
    [{{"law": "law_name", "article_number": "123"}}, ...]

    Question: {question}

    Available Articles:
    {articles_text}
    """
    
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini error: {str(e)}")
        return []

@app.route('/api/askai', methods=['POST'])
def askai():
    data = request.json
    question = data.get('question', '')
    lang = data.get('lang', 'ar')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Get relevant articles using Gemini
    relevant_articles = find_relevant_articles(question)
    
    # Generate answer
    context = "\n".join(
        f"{art['law']} Article {art['article_number']}: "
        f"{next(a['text'] for a in law_articles[art['law']] if a['article_number'] == art['article_number'])}"
        for art in relevant_articles
    )

    answer_prompt = f"""
    As a legal expert, answer this question in {"Arabic" if lang == "ar" else "English"} 
    using ONLY the provided context:

    Question: {question}

    Context:
    {context}
    """

    answer = model.generate_content(answer_prompt).text

    return jsonify({
        'answer': answer,
        'articles': relevant_articles
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)