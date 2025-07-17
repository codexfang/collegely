import React, { useState } from 'react';
import axios from 'axios';

export default function ScholarshipFinder() {
  const [criteria, setCriteria] = useState({
    lowIncome: false,
    firstGen: false,
    ethnicity: '',
    gender: '',
    major: '',
    state: '',
    minGPA: '',
    volunteer: false,
    veteran: false,
    disability: false,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await axios.post('/api/scholarships', criteria);
      setResults(res.data);
    } catch {
      setResults([{ name: 'Error fetching scholarships. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">Scholarship Finder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="checkbox-container">
          <input
            type="checkbox"
            name="lowIncome"
            checked={criteria.lowIncome}
            onChange={handleChange}
            className="checkbox-input"
            id="lowIncome"
          />
          <label htmlFor="lowIncome" className="checkbox-label">Low Income</label>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="firstGen"
            checked={criteria.firstGen}
            onChange={handleChange}
            className="checkbox-input"
            id="firstGen"
          />
          <label htmlFor="firstGen" className="checkbox-label">First Generation College Student</label>
        </div>

        <div className="form-group">
          <label className="form-label">Ethnicity</label>
          <select
            name="ethnicity"
            value={criteria.ethnicity}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select</option>
            <option value="Hispanic">Hispanic</option>
            <option value="Black/African American">Black/African American</option>
            <option value="Asian">Asian</option>
            <option value="Native American">Native American</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            value={criteria.gender}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Intended Major</label>
          <input
            type="text"
            name="major"
            value={criteria.major}
            onChange={handleChange}
            placeholder="e.g., Engineering, Biology"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">State of Residence</label>
          <input
            type="text"
            name="state"
            value={criteria.state}
            onChange={handleChange}
            placeholder="e.g., California"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Minimum GPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4"
            name="minGPA"
            value={criteria.minGPA}
            onChange={handleChange}
            placeholder="e.g., 3.5"
            className="form-input"
          />
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="volunteer"
            checked={criteria.volunteer}
            onChange={handleChange}
            className="checkbox-input"
            id="volunteer"
          />
          <label htmlFor="volunteer" className="checkbox-label">Volunteer Experience Required</label>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="veteran"
            checked={criteria.veteran}
            onChange={handleChange}
            className="checkbox-input"
            id="veteran"
          />
          <label htmlFor="veteran" className="checkbox-label">Veteran or Military Family</label>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="disability"
            checked={criteria.disability}
            onChange={handleChange}
            className="checkbox-input"
            id="disability"
          />
          <label htmlFor="disability" className="checkbox-label">Disability</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button button-primary button-block"
        >
          {loading ? 'Searching...' : 'Find Scholarships'}
        </button>
      </form>

      {results && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="result-card">
              <p className="text-center">No scholarships found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((scholarship, idx) => (
                <div key={idx} className="result-card">
                  <h3 className="result-title">{scholarship.name || 'Unnamed Scholarship'}</h3>
                  {scholarship.description && (
                    <p className="result-content">{scholarship.description}</p>
                  )}
                  {scholarship.link && (
                    <a
                      href={scholarship.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:underline mt-2 inline-block"
                    >
                      More Info
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}