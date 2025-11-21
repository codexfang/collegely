import React, { useState } from 'react';
import { findScholarships } from './geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const translations = {
  zh: {
    'Scholarship Finder': '奖学金搜索器',
    'Low Income': '低收入',
    'First Generation College Student': '第一代大学生',
    'Ethnicity': '族裔',
    'Gender': '性别',
    'Intended Major': '目标专业',
    'State of Residence': '居住州',
    'Minimum GPA': '最低 GPA',
    'Volunteer Experience Required': '需要志愿者经历',
    'Veteran or Military Family': '退伍军人或军人家庭',
    'Disability': '残疾',
    'Searching...': '搜索中...',
    'Find Scholarships': '查找奖学金',
    'Select': '选择',
    'No scholarships found matching your criteria.': '没有符合您条件的奖学金。',
    'Found': '已找到',
    'Scholarship': '个奖学金',
    'Scholarships': '个奖学金',
    'Unnamed Scholarship': '未命名奖学金',
    'Description:': '描述：',
    'Amount:': '金额：',
    'Requirements:': '要求：',
    'Apply Now': '立即申请',
  }
};

export default function ScholarshipFinder({ language = 'en' }) {
  const t = (text) => translations[language]?.[text] || text;

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
      const scholarshipResults = await findScholarships(criteria);
      // Map overview → description, eligibility → requirements
      const mappedResults = scholarshipResults.map(sch => ({
        ...sch,
        description: sch.overview,
        requirements: sch.eligibility
      }));
      setResults(mappedResults);
    } catch {
      setResults([{
        name: 'Error fetching scholarships',
        description: 'Please try again later.',
        amount: 'N/A',
        requirements: 'N/A'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">{t('Scholarship Finder')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'lowIncome', label: t('Low Income') },
          { name: 'firstGen', label: t('First Generation College Student') },
          { name: 'volunteer', label: t('Volunteer Experience Required') },
          { name: 'veteran', label: t('Veteran or Military Family') },
          { name: 'disability', label: t('Disability') },
        ].map(({ name, label }) => (
          <div className="checkbox-container" key={name}>
            <input
              type="checkbox"
              name={name}
              checked={criteria[name]}
              onChange={handleChange}
              className="checkbox-input"
              id={name}
            />
            <label htmlFor={name} className="checkbox-label">{label}</label>
          </div>
        ))}

        {[
          { name: 'ethnicity', label: t('Ethnicity'), options: ['', 'Hispanic', 'Black/African American', 'Asian', 'Native American', 'Other'] },
          { name: 'gender', label: t('Gender'), options: ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say'] }
        ].map(({ name, label, options }) => (
          <div className="form-group" key={name}>
            <label className="form-label">{label}</label>
            <select
              name={name}
              value={criteria[name]}
              onChange={handleChange}
              className="form-select"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt || t('Select')}</option>
              ))}
            </select>
          </div>
        ))}

        {[
          { name: 'major', label: t('Intended Major'), placeholder: 'e.g., Engineering, Biology' },
          { name: 'state', label: t('State of Residence'), placeholder: 'e.g., California' },
          { name: 'minGPA', label: t('Minimum GPA'), placeholder: 'e.g., 3.5', type: 'number' },
        ].map(({ name, label, placeholder, type = 'text' }) => (
          <div className="form-group" key={name}>
            <label className="form-label">{label}</label>
            <input
              type={type}
              name={name}
              value={criteria[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="form-input"
              step={type === 'number' ? '0.01' : undefined}
              min={type === 'number' ? '0' : undefined}
              max={type === 'number' ? '4' : undefined}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="button button-primary button-block"
        >
          {loading ? t('Searching...') : t('Find Scholarships')}
        </button>
      </form>

      {results && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="result-card">
              <p className="text-center">{t('No scholarships found matching your criteria.')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-primary-light mb-4">
                {t('Found')} {results.length} {t(results.length === 1 ? 'Scholarship' : 'Scholarships')}
              </h3>
              {results.map((scholarship, idx) => (
                <div key={idx} className="result-card">
                  <h4 className="text-lg font-semibold text-primary-light mb-3">
                    {scholarship.name || t('Unnamed Scholarship')}
                  </h4>

                  <div className="space-y-4">
                    {scholarship.description && (
                      <div>
                        <span className="font-semibold text-green-400">{t('Description:')}</span>
                        <div className="mt-1 ml-4">
                          <MarkdownRenderer content={scholarship.description} />
                        </div>
                      </div>
                    )}

                    {scholarship.amount && (
                      <div>
                        <span className="font-semibold text-blue-400">{t('Amount:')}</span>
                        <span className="ml-2 text-gray-300">{scholarship.amount}</span>
                      </div>
                    )}

                    {scholarship.requirements && (
                      <div>
                        <span className="font-semibold text-purple-400">{t('Requirements:')}</span>
                        <div className="mt-1 ml-4">
                          <MarkdownRenderer content={scholarship.requirements} />
                        </div>
                      </div>
                    )}

                    {scholarship.link && (
                      <div>
                        <a
                          href={scholarship.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-light hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {t('Apply Now')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}