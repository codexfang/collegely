from dotenv import load_dotenv
load_dotenv()  # loads .env variables into os.environ

import os
import json
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")
print("Gemini API key:", GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

# -----------------------
# Gemini chat endpoint
# -----------------------
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
            "X-Goog-Api-Key": GEMINI_API_KEY
        }
        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        resp = requests.post(url, headers=headers, json=body, timeout=15)

        if resp.status_code != 200:
            app.logger.error("Gemini API non-200: %s - %s", resp.status_code, resp.text)
            return jsonify({"error": "Gemini API error", "status": resp.status_code, "details": resp.text}), 500

        data = resp.json()
        try:
            result_text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            app.logger.warning("Unexpected Gemini JSON structure: %s", json.dumps(data)[:1000])
            return jsonify({"result_raw": data}), 200

        return jsonify({"result": result_text}), 200

    except requests.exceptions.Timeout:
        app.logger.exception("Request to Gemini timed out")
        return jsonify({"error": "Gemini request timed out"}), 504
    except Exception as e:
        tb = traceback.format_exc()
        app.logger.error("Unhandled exception in /api/chat: %s\n%s", str(e), tb)
        return jsonify({"error": "Internal server error", "details": str(e), "trace": tb}), 500

# -----------------------
# Scholarships endpoint
# -----------------------
@app.route('/api/scholarships', methods=['GET'])
def get_scholarships():
    try:
        # Load the full scholarships JSON
        with open("scholarships.json", "r") as f:
            all_scholarships = json.load(f)

        # Filter based on query parameters
        low_income = request.args.get("lowIncome") == "true"
        first_gen = request.args.get("firstGen") == "true"
        volunteer = request.args.get("volunteer") == "true"
        veteran = request.args.get("veteran") == "true"
        disability = request.args.get("disability") == "true"
        min_gpa = request.args.get("minGPA")
        state = request.args.get("state")
        major = request.args.get("major")

        filtered = []
        for s in all_scholarships:
            reqs = s.get("requirements", "").lower()
            if low_income and "low income" not in reqs:
                continue
            if first_gen and "first generation" not in reqs:
                continue
            if volunteer and "volunteer" not in reqs:
                continue
            if veteran and "veteran" not in reqs:
                continue
            if disability and "disability" not in reqs:
                continue
            if min_gpa:
                try:
                    gpa_val = float(min_gpa)
                    # Assuming your JSON has a "minGPA" field
                    if float(s.get("minGPA", 0)) > gpa_val:
                        continue
                except ValueError:
                    pass
            if state and state.lower() not in s.get("requirements", "").lower():
                continue
            if major and major.lower() not in s.get("requirements", "").lower():
                continue
            filtered.append(s)

        # Limit to 15 scholarships max
        return jsonify(filtered[:15])

    except Exception as e:
        tb = traceback.format_exc()
        app.logger.error("Unhandled exception in /api/scholarships: %s\n%s", str(e), tb)
        return jsonify({"error": "Failed to load scholarships", "details": str(e), "trace": tb}), 500

# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)