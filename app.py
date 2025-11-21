import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY
    }
    body = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(url, headers=headers, json=body)
    if response.status_code != 200:
        return jsonify({"error": f"Gemini API error {response.status_code}", "details": response.text}), 500

    data = response.json()
    try:
        # Adjust parsing if Gemini response format changes
        result_text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        result_text = str(data)

    return jsonify({"result": result_text})

if __name__ == "__main__":
    app.run(debug=True)