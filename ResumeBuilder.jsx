import React, { useState } from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { generateResumeContent } from './geminiService';

// Translation dictionary
const translations = {
  zh: {
    'AI Resume Builder': '简历生成器',
    'Full Name': '全名',
    'Email': '电子邮件',
    'Phone Number': '电话号码',
    'Education (school, degree, graduation year, etc.)': '教育背景（学校、学位、毕业年份等）',
    'Activities / Experience': '活动 / 经历',
    'Add activity, job, volunteer work, club, etc.': '添加活动、工作、志愿者、社团等',
    'Add': '添加',
    'Remove': '删除',
    'Additional Information': '附加信息',
    'Awards, certifications, special skills, or other relevant information...': '奖项、证书、技能或其他相关信息...',
    'Enhance with AI': '使用增强',
    'AI Enhancing Resume...': '正在生成简历...',
    'Download Resume': '下载简历',
    'Generating PDF...': '正在生成 PDF...',
    'AI-Enhanced Resume Preview': '增强简历预览',
    'Professional Summary': '专业简介',
    'Enhanced Experience': '增强经历',
    'Skills': '技能',
    'Achievements': '成就',
  }
};

const t = (text, lang = 'en') => translations[lang]?.[text] || text;

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "1 solid #000000",
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#000000",
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1 solid #000000",
    paddingBottom: 3,
  },
  content: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#000000",
    marginBottom: 3,
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#000000",
    marginBottom: 2,
    marginLeft: 15,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
  },
  company: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#000000",
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 10,
    color: "#000000",
    marginRight: 8,
    marginBottom: 2,
  },
});

function AIResumeDocument({ data, aiContent }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || "YOUR NAME"}</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contact}>{data.email || "your.email@example.com"}</Text>
            <Text style={styles.contact}>•</Text>
            <Text style={styles.contact}>{data.phone || "(000) 000-0000"}</Text>
          </View>
        </View>

        {aiContent?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.content}>{aiContent.summary}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCATION</Text>
          <Text style={styles.content}>{aiContent?.education || data.education || "Education details"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCE</Text>
          {(aiContent?.experience ? aiContent.experience.split('\n') : data.activities).map((line, index) => (
            <Text key={index} style={line.startsWith('•') ? styles.bulletPoint : styles.content}>
              {line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`}
            </Text>
          ))}
        </View>

        {aiContent?.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <Text style={styles.content}>{aiContent.skills}</Text>
          </View>
        )}

        {aiContent?.achievements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            <Text style={styles.content}>{aiContent.achievements}</Text>
          </View>
        )}

        {data.additionalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
            <Text style={styles.content}>{data.additionalInfo}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default function ResumeBuilder({ language = 'en' }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    activities: [],
    currentActivity: "",
    additionalInfo: "",
  });

  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const addActivity = () => {
    const trimmed = data.currentActivity.trim();
    if (trimmed !== "") {
      setData(prev => ({
        ...prev,
        activities: [...prev.activities, trimmed],
        currentActivity: "",
      }));
    }
  };

  const removeActivity = index => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const enhanceResume = async () => {
    if (!data.name || data.activities.length === 0) {
      alert(t('Please fill in your name and add at least one activity before enhancing.', language));
      return;
    }

    setLoading(true);
    try {
      const enhancedContent = await generateResumeContent(data);
      setAiContent(enhancedContent);
    } catch (error) {
      alert(t('Error enhancing resume. Please try again.', language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">{t('AI Resume Builder', language)}</h2>

      <div className="space-y-4">
        <div className="form-group">
          <input type="text" name="name" value={data.name} onChange={handleChange} placeholder={t('Full Name', language)} className="form-input" />
        </div>

        <div className="form-group">
          <input type="email" name="email" value={data.email} onChange={handleChange} placeholder={t('Email', language)} className="form-input" />
        </div>

        <div className="form-group">
          <input type="text" name="phone" value={data.phone} onChange={handleChange} placeholder={t('Phone Number', language)} className="form-input" />
        </div>

        <div className="form-group">
          <textarea name="education" value={data.education} onChange={handleChange} placeholder={t('Education (school, degree, graduation year, etc.)', language)} className="form-textarea" rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Activities / Experience', language)}</label>
          <div className="flex gap-2 mb-4">
            <input type="text" name="currentActivity" value={data.currentActivity} onChange={handleChange} placeholder={t('Add activity, job, volunteer work, club, etc.', language)} className="form-input flex-grow" onKeyPress={(e) => e.key === 'Enter' && addActivity()} />
            <button type="button" onClick={addActivity} className="button button-primary">{t('Add', language)}</button>
          </div>

          {data.activities.length > 0 && (
            <div className="activities-list">
              {data.activities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-600 last:border-b-0">
                  <span className="text-light flex-grow pr-12">{act}</span>
                  <button onClick={() => removeActivity(idx)} className="button bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs ml-12 flex-shrink-0">
                    {t('Remove', language)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t('Additional Information', language)}</label>
          <textarea name="additionalInfo" value={data.additionalInfo} onChange={handleChange} placeholder={t('Awards, certifications, special skills, or other relevant information...', language)} className="form-textarea" rows={3} />
        </div>

        <div className="flex gap-4">
          <button onClick={enhanceResume} disabled={loading || !data.name || data.activities.length === 0} className="button button-primary flex-1">
            {loading ? t('AI Enhancing Resume...', language) : t('Enhance with AI', language)}
          </button>

          {(aiContent || (!loading && data.name && data.activities.length > 0)) && (
            <PDFDownloadLink document={<AIResumeDocument data={data} aiContent={aiContent} />} fileName={`${data.name || 'Resume'}_Resume.pdf`} className="button button-primary flex-1">
              {({ loading: pdfLoading }) => (pdfLoading ? t('Generating PDF...', language) : t('Download Resume', language))}
            </PDFDownloadLink>
          )}
        </div>

        {aiContent && (
          <div className="result-card mt-6">
            <h3 className="result-title">{t('AI-Enhanced Resume Preview', language)}</h3>
            <div className="result-content">
              <div className="mb-4">
                <h4 className="font-semibold text-primary-light mb-2">{t('Professional Summary', language)}</h4>
                <p className="text-gray-300">{aiContent.summary}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-primary-light mb-2">{t('Enhanced Experience', language)}</h4>
                <div className="text-gray-300 whitespace-pre-line">{aiContent.experience}</div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-primary-light mb-2">{t('Skills', language)}</h4>
                <p className="text-gray-300">{aiContent.skills}</p>
              </div>
              {aiContent.achievements && (
                <div>
                  <h4 className="font-semibold text-primary-light mb-2">{t('Achievements', language)}</h4>
                  <p className="text-gray-300">{aiContent.achievements}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}