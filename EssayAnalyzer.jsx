import React, { useState } from 'react';
import axios from 'axios';

export default function EssayAnalyzer() {
  const [essay, setEssay] = useState('');
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!essay.trim()) return;

    setLoading(true);
    setScore(null);
    setFeedback('');

    try {
      const res = await axios.post('/api/analyze-essay', { essay });
      setScore(res.data.score);
      setFeedback(res.data.feedback);
    } catch {
      setFeedback('Error analyzing essay. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">Essay Analyzer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <textarea
            value={essay}
            onChange={e => setEssay(e.target.value)}
            placeholder="Paste your essay here..."
            rows={10}
            className="form-textarea"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="button button-primary button-block"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : 'Analyze Essay'}
        </button>
      </form>

      {score !== null && (
        <div className="result-card mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="result-title">Essay Score</h3>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {score}/10
            </div>
          </div>
          
          <h4 className="text-primary-light font-semibold mb-2">Detailed Feedback:</h4>
          <div className="result-content whitespace-pre-wrap">
            {feedback.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {feedback && score === null && (
        <div className="result-card mt-6 border border-danger/30">
          <h3 className="text-danger font-semibold">Error</h3>
          <p className="text-light mt-1">{feedback}</p>
        </div>
      )}
    </div>
  );
}