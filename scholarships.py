def find_scholarships(data):
    results = []
    if data.get('lowIncome'):
        results.append({ 'name': 'Low-Income Student Grant', 'amount': '$1,000' })
    if data.get('firstGen'):
        results.append({ 'name': 'First Generation Scholar Award', 'amount': '$2,000' })
    if data.get('ethnicity'):
        results.append({ 'name': f"{data['ethnicity']} Heritage Fund", 'amount': '$1,500' })
    return results