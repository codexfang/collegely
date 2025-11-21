from dotenv import load_dotenv
load_dotenv()  # <-- loads .env variables into os.environ

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")
print("Gemini API key:", GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        payload = request.get_json(force=True)
        prompt = payload.get('prompt') if payload else None
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            "Content-Type": "application/json",
            # both header forms are equivalent but use this canonical form
            "X-Goog-Api-Key": GEMINI_API_KEY
        }
        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        # set a short timeout so the request fails fast if something's wrong
        resp = requests.post(url, headers=headers, json=body, timeout=15)

        # If non-200, return the response text and status so frontend can show it
        if resp.status_code != 200:
            app.logger.error("Gemini API non-200: %s - %s", resp.status_code, resp.text)
            return jsonify({"error": "Gemini API error", "status": resp.status_code, "details": resp.text}), 500

        data = resp.json()
        # safe parsing with fallbacks
        try:
            result_text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            app.logger.warning("Unexpected Gemini JSON structure: %s", json.dumps(data)[:1000])
            # return full JSON for debugging
            return jsonify({"result_raw": data}), 200

        return jsonify({"result": result_text}), 200

    except requests.exceptions.Timeout:
        app.logger.exception("Request to Gemini timed out")
        return jsonify({"error": "Gemini request timed out"}), 504
    except Exception as e:
        tb = traceback.format_exc()
        app.logger.error("Unhandled exception in /api/chat: %s\n%s", str(e), tb)
        return jsonify({"error": "Internal server error", "details": str(e), "trace": tb}), 500

if __name__ == "__main__":
    # local dev only
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)