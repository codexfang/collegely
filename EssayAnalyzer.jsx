import React, { useState } from 'react';
import { analyzeEssay } from './geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const translations = {
  zh: {
    'Essay Analyzer': '作文分析器',
    'Paste your essay here...': '请粘贴你的作文...',
    'Analyze Essay': '分析作文',
    'Analyzing...': '分析中...',
    'Essay Score': '作文评分',
    'Detailed Feedback:': '详细反馈：',
    'Error': '错误',
    'Error analyzing essay. Please try again later.': '分析作文时出错，请稍后再试。',
  },
};

export default function EssayAnalyzer({ language = 'en' }) {
  const t = (text) => translations[language]?.[text] || text;

  const [essay, setEssay] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!essay.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzeEssay(essay);
      setResult(analysisResult);
    } catch (error) {
      setResult({
        score: null,
        feedback: t('Error analyzing essay. Please try again later.')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">{t('Essay Analyzer')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <textarea
            value={essay}
            onChange={e => setEssay(e.target.value)}
            placeholder={t('Paste your essay here...')}
            rows={18}
            className="form-textarea"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !essay.trim()}
          className="button button-primary button-block"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('Analyzing...')}
            </>
          ) : (
            t('Analyze Essay')
          )}
        </button>
      </form>

      {result && (
        <div className="result-card mt-6">
          {result.score !== null && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="result-title">{t('Essay Score')}</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {result.score}/10
                </div>
              </div>
            </div>
          )}

          <h4 className="text-primary-light font-semibold mb-4">{t('Detailed Feedback:')}</h4>
          <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
            <MarkdownRenderer content={result.feedback} />
          </div>
        </div>
      )}

      {result && result.score === null && (
        <div className="result-card mt-6 border border-danger/30">
          <h3 className="text-danger font-semibold">{t('Error')}</h3>
          <div className="mt-3">
            <MarkdownRenderer content={result.feedback} />
          </div>
        </div>
      )}
    </div>
  );
}