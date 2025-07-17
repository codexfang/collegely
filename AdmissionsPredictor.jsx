import React, { useState } from 'react';
import axios from 'axios';

const colleges = [
  { label: 'University of California, Berkeley', value: 'uc_berkeley' },
  { label: 'University of California, Los Angeles', value: 'uc_losangeles' },
  { label: 'University of California, San Diego', value: 'uc_sandiego' },
  { label: 'California State University, Long Beach', value: 'csu_longbeach' },
  { label: 'California State University, Fullerton', value: 'csu_fullerton' },
  { label: 'Harvard University', value: 'harvard' },
  { label: 'Yale University', value: 'yale' },
  { label: 'Princeton University', value: 'princeton' },
  { label: 'Stanford University', value: 'stanford' },
  { label: 'Massachusetts Institute of Technology (MIT)', value: 'mit' },
];

export default function AdmissionsPredictor() {
  const [formData, setFormData] = useState({
    gpa: '',
    sat: '',
    extracurriculars: '',
    college: colleges[0].value,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/predict', formData);
      setResult(res.data);
    } catch (err) {
      setResult({ chance: 'Error occurred. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">Admissions Predictor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <input
            type="text"
            name="gpa"
            placeholder="GPA (e.g., 3.8)"
            value={formData.gpa}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="sat"
            placeholder="SAT Score (e.g., 1400)"
            value={formData.sat}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <textarea
            name="extracurriculars"
            placeholder="Extracurriculars (optional)"
            value={formData.extracurriculars}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
          />
        </div>
        
        <div className="form-group">
          <select
            name="college"
            value={formData.college}
            onChange={handleChange}
            className="form-select"
            required
          >
            {colleges.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="button button-primary button-block"
        >
          {loading ? 'Predicting...' : 'Predict Admission Chance'}
        </button>
      </form>

      {result && (
        <div className="result-card mt-6">
          <h3 className="result-title">Prediction Result</h3>
          <div className="result-content">
            Chance: {result.chance}
          </div>
        </div>
      )}
    </div>
  );
}