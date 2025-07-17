def predict_admission(data):
    gpa = float(data.get('gpa', 0))
    sat = int(data.get('sat', 0))
    school = data.get('schoolType', '')

    score = gpa * 100 + sat / 16
    if school == 'Ivy':
        threshold = 850
    elif school == 'UC':
        threshold = 750
    else:
        threshold = 650

    chance = 'High' if score >= threshold else 'Low'
    return { 'chance': chance }