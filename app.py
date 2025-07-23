import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from essay_review import review_essay
from predictor import predict_admission
from scholarships import find_scholarships

app = Flask(__name__)
CORS(app)

@app.route('/api/essay', methods=['POST'])
def essay():
    essay_text = request.json.get('text')
    return jsonify(review_essay(essay_text))

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    return jsonify(predict_admission(data))

@app.route('/api/scholarships', methods=['POST'])
def scholarships():
    preferences = request.json
    return jsonify(find_scholarships(preferences))

# ✅ New route to serve CSV as JSON
@app.route('/api/admissions', methods=['GET'])
def admissions_data():
    df = pd.read_csv('college-admissions.csv')  # make sure this file is in the same folder as app.py
    return jsonify(df.head(100).to_dict(orient='records'))  # send top 100 entries

if __name__ == '__main__':
    app.run(debug=True)