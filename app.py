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

if __name__ == '__main__':
    app.run(debug=True)