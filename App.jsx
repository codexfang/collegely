import React, { useState } from 'react';
import AdmissionsPredictor from './AdmissionsPredictor';
import EssayAnalyzer from './EssayAnalyzer';
import ScholarshipFinder from './ScholarshipFinder';
import ResumeBuilder from './ResumeBuilder';
import CollegeChatbot from './CollegeChatbot';
import AdmissionsDataViewer from './AdmissionsDataViewer';
import './App.css';

const tabs = [
  { id: 'admissions', label: 'Admissions Predictor' },
  { id: 'essay', label: 'Essay Analyzer' },
  { id: 'scholarship', label: 'Scholarship Finder' },
  { id: 'resume', label: 'Resume Builder' },
  { id: 'dataset', label: 'Dataset Viewer' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('admissions');
  const [language, setLanguage] = useState('en');

  return (
    <div className="app-container">
      <header className="app-header flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <img
            src="CollegelyLogo.png"
            alt="Collegely Logo"
            className="logo h-10 w-auto"
          />
        </div>

        <nav className="nav-tabs flex-grow flex justify-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {translations[language]?.[tab.label] || tab.label}
            </button>
          ))}
        </nav>

        <div className="language-selector">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'admissions' && <AdmissionsPredictor language={language} />}
        {activeTab === 'essay' && <EssayAnalyzer language={language} />}
        {activeTab === 'scholarship' && <ScholarshipFinder language={language} />}
        {activeTab === 'resume' && <ResumeBuilder language={language} />}
        {activeTab === 'dataset' && <AdmissionsDataViewer language={language} />}
      </main>

      <footer className="app-footer">
        @ 2025 Collegely
      </footer>

      <CollegeChatbot />
    </div>
  );
}

const translations = {
  zh: {
    'Admissions Predictor': '录取预测器',
    'Essay Analyzer': '作文分析器',
    'Scholarship Finder': '奖学金搜索器',
    'Resume Builder': '简历生成器',
    'Dataset Viewer': '数据预览器',
  },
};