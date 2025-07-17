import React, { useState } from 'react';
import AdmissionsPredictor from './AdmissionsPredictor';
import EssayAnalyzer from './EssayAnalyzer';
import ScholarshipFinder from './ScholarshipFinder';
import ResumeBuilder from './ResumeBuilder';
import './App.css';

const tabs = [
  { id: 'admissions', label: 'Admissions Predictor' },
  { id: 'essay', label: 'Essay Analyzer' },
  { id: 'scholarship', label: 'Scholarship Finder' },
  { id: 'resume', label: 'Resume Builder' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'zh', label: 'Chinese' },
  { code: 'hi', label: 'Hindi' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('admissions');
  const [language, setLanguage] = useState('en');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="language-selector">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'admissions' && <AdmissionsPredictor language={language} />}
        {activeTab === 'essay' && <EssayAnalyzer language={language} />}
        {activeTab === 'scholarship' && <ScholarshipFinder language={language} />}
        {activeTab === 'resume' && <ResumeBuilder language={language} />}
      </main>

      <footer className="app-footer">
        © 2025 Collegely | Frontend: Vite + React Jason Fang | Backend: Flask Samuel Meseret & Jonathan Riggins | Contributors: Vinh Khang Diep & Matthew Nguyen
 

      </footer>
    </div>
  );
}