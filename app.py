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
# -----------------------
# Scholarships endpoint (structured tag/field matching)
# -----------------------
@app.route('/api/scholarships', methods=['GET'])
def get_scholarships():
    try:
        # Load the full scholarships JSON
        with open("scholarships.json", "r", encoding="utf-8") as f:
            all_scholarships = json.load(f)

        # Query params from frontend
        low_income = request.args.get("lowIncome") == "true"
        first_gen = request.args.get("firstGen") == "true"
        volunteer = request.args.get("volunteer") == "true"
        veteran = request.args.get("veteran") == "true"
        disability = request.args.get("disability") == "true"
        min_gpa = request.args.get("minGPA")
        state = (request.args.get("state") or "").strip().lower()
        major = (request.args.get("major") or "").strip().lower()
        ethnicity = (request.args.get("ethnicity") or "").strip().lower()
        gender = (request.args.get("gender") or "").strip().lower()

        def scholarship_matches(s):
            # Normalize fields
            tags = [t.lower() for t in (s.get("tags") or [])]
            majors = [m.lower() for m in (s.get("majors") or [])]
            states = [st.lower() for st in (s.get("states") or [])]
            minGPA_field = s.get("minGPA", s.get("minimumGPA", None))

            # Check boolean flags by tag
            if low_income and "low-income" not in tags and "financial-need" not in tags:
                return False
            if first_gen and "first-gen" not in tags and "first-generation" not in tags:
                return False
            if volunteer and "volunteer" not in tags and "community-service" not in tags:
                return False
            if veteran and "veteran" not in tags and "military" not in tags:
                return False
            if disability and "disability" not in tags:
                return False

            # GPA check (scholarship minGPA <= requested min_gpa)
            if min_gpa:
                try:
                    user_gpa = float(min_gpa)
                    if minGPA_field is not None:
                        try:
                            sch_gpa = float(minGPA_field)
                            # If scholarship requires higher GPA than user has, exclude it
                            if sch_gpa > user_gpa:
                                return False
                        except (TypeError, ValueError):
                            # can't parse scholarship minGPA, ignore
                            pass
                except ValueError:
                    pass

            # State check: if scholarship is state-limited, require match
            if states:
                if state and state not in states:
                    return False
                # if user didn't specify a state, we still allow national scholarships (so do not exclude when state absent)
            # Major check: if scholarship specifies majors, user major must match at least one
            if majors:
                if major:
                    # allow partial match: e.g., "engineering" matches "mechanical engineering"
                    if not any(major in m or m in major for m in majors):
                        return False
                else:
                    # scholarship is major-specific but user didn't select one -> include it (frontend can filter further)
                    pass

            # Ethnicity / gender checks (if scholarship has tags for them)
            if ethnicity:
                # scholarship must include the ethnicity tag OR "underrepresented" tag
                if not (ethnicity in tags or f"{ethnicity}" in tags or "underrepresented" in tags):
                    return False
            if gender:
                if not (gender in tags or f"{gender}" in tags):
                    return False

            return True

        filtered = [s for s in all_scholarships if scholarship_matches(s)]

        # If no filters provided, return the first 15 as a default discovery list
        if not any([low_income, first_gen, volunteer, veteran, disability, min_gpa, state, major, ethnicity, gender]):
            return jsonify(all_scholarships[:15])

        # Return up to 15 results
        return jsonify(filtered[:15])

    except Exception as e:
        tb = traceback.format_exc()
        app.logger.error("Unhandled exception in /api/scholarships: %s\n%s", str(e), tb)
        return jsonify({"error": "Failed to load scholarships", "details": str(e), "trace": tb}), 500

# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    # Use the port Render provides or default to 5001
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)