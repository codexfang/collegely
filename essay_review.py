def review_essay(text):
    score = max(1, 10 - len(text) // 500)
    feedback = "Great structure." if score > 7 else "Needs stronger organization and clarity."
    return { 'score': score, 'feedback': feedback }