import React, { useState } from 'react';
import { predictAdmissions } from './geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import Select from 'react-select';

const colleges = [
  { label: 'University of California, Berkeley', value: 'uc_berkeley' },
  { label: 'University of California, Los Angeles', value: 'uc_losangeles' },
  { label: 'University of California, San Diego', value: 'uc_sandiego' },
  { label: 'University of California, Davis', value: 'uc_davis' },
  { label: 'University of California, Irvine', value: 'uc_irvine' },
  { label: 'University of California, Santa Barbara', value: 'uc_santabarbara' },
  { label: 'University of California, Santa Cruz', value: 'uc_santacruz' },
  { label: 'University of California, Riverside', value: 'uc_riverside' },
  { label: 'University of California, Merced', value: 'uc_merced' },
  { label: 'California State University, Long Beach', value: 'csu_longbeach' },
  { label: 'California State University, Fullerton', value: 'csu_fullerton' },
  { label: 'San Diego State University', value: 'csu_sandiego' },
  { label: 'San Jose State University', value: 'csu_sanjose' },
  { label: 'California Polytechnic State University, San Luis Obispo', value: 'csu_calpoly_slo' },
  { label: 'California State University, Northridge', value: 'csu_northridge' },
  { label: 'California State University, Los Angeles', value: 'csu_losangeles' },
  { label: 'California State University, East Bay', value: 'csu_eastbay' },
  { label: 'California State University, Sacramento', value: 'csu_sacramento' },
  { label: 'Harvard University', value: 'harvard' },
  { label: 'Yale University', value: 'yale' },
  { label: 'Princeton University', value: 'princeton' },
  { label: 'Columbia University', value: 'columbia' },
  { label: 'Brown University', value: 'brown' },
  { label: 'Dartmouth College', value: 'dartmouth' },
  { label: 'University of Pennsylvania', value: 'upenn' },
  { label: 'Cornell University', value: 'cornell' },
  { label: 'Stanford University', value: 'stanford' },
  { label: 'Massachusetts Institute of Technology (MIT)', value: 'mit' },
  { label: 'University of Southern California (USC)', value: 'usc' },
  { label: 'California Institute of Technology (Caltech)', value: 'caltech' },
  { label: 'Northwestern University', value: 'northwestern' },
  { label: 'University of Chicago', value: 'uchicago' },
  { label: 'Duke University', value: 'duke' },
  { label: 'Johns Hopkins University', value: 'jhu' },
  { label: 'Rice University', value: 'rice' },
  { label: 'Vanderbilt University', value: 'vanderbilt' },
  { label: 'Washington University in St. Louis', value: 'wustl' },
  { label: 'Emory University', value: 'emory' },
  { label: 'Carnegie Mellon University', value: 'cmu' },
  { label: 'University of Notre Dame', value: 'notredame' },
  { label: 'Boston College', value: 'bc' },
  { label: 'Boston University', value: 'bu' },
  { label: 'New York University (NYU)', value: 'nyu' },
  { label: 'Georgetown University', value: 'georgetown' },
  { label: 'Tufts University', value: 'tufts' },
  { label: 'Wake Forest University', value: 'wakeforest' },
  { label: 'University of Miami', value: 'miami' },
  { label: 'University of Michigan, Ann Arbor', value: 'umich' },
  { label: 'University of Virginia', value: 'uva' },
  { label: 'University of North Carolina at Chapel Hill', value: 'unc' },
  { label: 'University of Florida', value: 'uf' },
  { label: 'University of Texas at Austin', value: 'utexas' },
  { label: 'University of Wisconsin–Madison', value: 'uwmadison' },
  { label: 'University of Washington', value: 'uw' },
  { label: 'Purdue University', value: 'purdue' },
  { label: 'Georgia Institute of Technology', value: 'gatech' },
  { label: 'Pennsylvania State University', value: 'pennstate' },
  { label: 'University of Illinois Urbana-Champaign', value: 'uiuc' },
  { label: 'Ohio State University', value: 'osu' },
];

const translations = {
  zh: {
    'Admissions Predictor': '录取预测器',
    'GPA (e.g., 3.8)': 'GPA（例如，3.8）',
    'SAT Score (e.g., 1400)': 'SAT成绩（例如，1400）',
    'Extracurriculars (optional)': '课外活动（可选）',
    'Predict Admission Chance': '预测录取机会',
    'Predicting...': '预测中...',
    'Admission Chance': '录取机会',
    'Analysis:': '分析：',
    'Recommendations:': '建议：',
    'Selected College': '选择的学校',
    'Prediction for': '预测结果 -',
  }
};

export default function AdmissionsPredictor({ language = 'en' }) {
  const t = (text) => translations[language]?.[text] || text;

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
      const collegeName = colleges.find(c => c.value === formData.college)?.label || formData.college;
      const predictionResult = await predictAdmissions({
        ...formData,
        college: collegeName
      });
      setResult(predictionResult);
    } catch (err) {
      setResult({
        chance: t('Error occurred. Try again.'),
        explanation: t('Unable to analyze admission chances at this time.'),
        recommendations: t('Please check your information and try again.')
      });
    } finally {
      setLoading(false);
    }
  };

  const getCollegeName = () => {
    return colleges.find(c => c.value === formData.college)?.label || t('Selected College');
  };

  return (
    <div className="component-container">
      <h2 className="component-title">{t('Admissions Predictor')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <input
            type="text"
            name="gpa"
            placeholder={t('GPA (e.g., 3.8)')}
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
            placeholder={t('SAT Score (e.g., 1400)')}
            value={formData.sat}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <textarea
            name="extracurriculars"
            placeholder={t('Extracurriculars (optional)')}
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
          {loading ? t('Predicting...') : t('Predict Admission Chance')}
        </button>
      </form>

      {result && (
        <div className="result-card mt-6">
          {/* Fixed: added space after translation */}
          <h3 className="result-title">{t('Prediction for')} {getCollegeName()}</h3>

          <div className="mb-6 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {result.chance}
            </div>
            <p className="text-gray-400">{t('Admission Chance')}</p>
          </div>

          {result.explanation && (
            <div className="mb-6">
              <h4 className="text-primary-light font-semibold mb-3">{t('Analysis:')}</h4>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <MarkdownRenderer content={result.explanation} />
              </div>
            </div>
          )}

          {result.recommendations && (
            <div>
              <h4 className="text-primary-light font-semibold mb-3">{t('Recommendations:')}</h4>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <MarkdownRenderer content={result.recommendations} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}