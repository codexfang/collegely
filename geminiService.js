// geminiService.js
// Gemini API Service via Flask backend

import scholarships from './scholarships.json';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://collegely-backend.onrender.com";

// -----------------------
// Generic Gemini API call
// -----------------------
export async function callGemini(prompt) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// -----------------------
// College admissions prediction
// -----------------------
export async function predictAdmissions(formData) {
  const collegeNameSafe = formData.college || "the specified college";
  const prompt = `
You are a top college admissions expert.

College: "${collegeNameSafe}"

Student Profile:
- GPA: ${formData.gpa || 'N/A'}
- SAT Score: ${formData.sat || 'N/A'}
- Extracurriculars: ${formData.extracurriculars || 'Not specified'}

Please produce a clear, machine-parseable answer using these exact sections:

CHANCE: [single percentage like "45%"]
EXPLANATION: [3-4 sentences]
RECOMMENDATIONS:
1. ...
2. ...
3. ...
4. ...
`;

  try {
    const result = await callGemini(prompt);
    const chanceMatch = result.match(/CHANCE:\s*([0-9]{1,3}(?:\.[0-9]+)?\s*%)/i) ||
                        result.match(/([0-9]{1,3}(?:\.[0-9]+)?)\s*%/);
    const explanationMatch = result.match(/EXPLANATION:\s*(.*?)(?=RECOMMENDATIONS:|$)/is);
    const recommendationsMatch = result.match(/RECOMMENDATIONS:\s*(.*)$/is);

    return {
      chance: chanceMatch ? chanceMatch[1].trim() : '50%',
      explanation: explanationMatch ? explanationMatch[1].trim() : result.split(/\n\n/)[0],
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() :
        '1) Strengthen academics 2) Highlight leadership 3) Improve essays 4) Get strong recommendation letters'
    };
  } catch (error) {
    console.error('predictAdmissions error:', error);
    return {
      chance: "Error occurred",
      explanation: "Unable to analyze at this time.",
      recommendations: "Please check your information and try again."
    };
  }
}

// -----------------------
// Essay analysis
// -----------------------
export async function analyzeEssay(essayText) {
  const prompt = `
You are a college admissions essay reviewer. Analyze:

- Clarity, flow, and structure
- Unique personal voice
- Character and achievements
- Grammar and syntax
- Suggestions for improvement

Essay: """${essayText}"""

Format:
SCORE: [1-10]
FEEDBACK: [Detailed strengths, weaknesses, and improvements]
`;

  try {
    const result = await callGemini(prompt);
    const scoreMatch = result.match(/SCORE:\s*(\d+)/);
    const feedbackMatch = result.match(/FEEDBACK:\s*(.*)$/s);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 7,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : result
    };
  } catch (error) {
    return {
      score: null,
      feedback: "Error analyzing essay. Try again later."
    };
  }
}

// -----------------------
// Resume generation
// -----------------------
export async function generateResumeContent(data) {
  const prompt = `
You are a professional resume writer. Generate a highly detailed resume.

Student Info:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Education: ${data.education}
- Activities: ${data.activities.join("; ")}
- Additional Info: ${data.additionalInfo || "None"}

Format each section clearly (NAME, CONTACT, SUMMARY, EDUCATION, EXPERIENCE/PROJECTS, SKILLS, ACHIEVEMENTS, ADDITIONAL INFO)
`;

  try {
    const result = await callGemini(prompt);
    const extractSection = (label) => {
      const match = result.match(new RegExp(`${label}:\\s*(.*?)\\n(?=[A-Z ]+:|$)`, 's'));
      return match ? match[1].trim() : '';
    };

    return {
      name: extractSection('NAME') || data.name,
      contact: extractSection('CONTACT') || `${data.email} | ${data.phone}`,
      summary: extractSection('SUMMARY') || "Motivated student with strong academics.",
      education: extractSection('EDUCATION') || data.education || "Education details missing",
      experience: extractSection('EXPERIENCE / PROJECTS') || data.activities.map(a => `• ${a}`).join("\n"),
      skills: extractSection('SKILLS') || "Leadership, Teamwork, Communication, Problem-solving",
      achievements: extractSection('ACHIEVEMENTS') || "Awards and recognitions",
      additionalInfo: extractSection('ADDITIONAL INFO') || data.additionalInfo || "None"
    };
  } catch (error) {
    console.error("Resume generation error:", error);
    return {
      name: data.name,
      contact: `${data.email} | ${data.phone}`,
      summary: "Motivated student with strong academics.",
      education: data.education || "Education in progress",
      experience: data.activities.map(a => `• ${a}`).join("\n"),
      skills: "Leadership, Teamwork, Communication, Problem-solving",
      achievements: "Awards and recognitions",
      additionalInfo: data.additionalInfo || "None"
    };
  }
}

// -----------------------
// Scholarship Finder using local JSON
// -----------------------
export function findScholarships(criteria) {
  const minGPA = parseFloat(criteria.minGPA) || 0;
  const gender = (criteria.gender || "").toLowerCase();
  const ethnicity = (criteria.ethnicity || "").toLowerCase();
  const major = (criteria.major || "").toLowerCase();
  const state = (criteria.state || "").toLowerCase();

  const filtered = scholarships.filter(sch => {
    const tags = (sch.tags || []).map(t => t.toLowerCase());
    const eligibility = (sch.eligibility || "").toLowerCase();

    // Check boolean flags against tags
    if (criteria.lowIncome && !tags.includes("low-income")) return false;
    if (criteria.firstGen && !tags.includes("first-gen")) return false;
    if (criteria.volunteer && !tags.includes("volunteer")) return false;
    if (criteria.veteran && !tags.includes("veteran")) return false;
    if (criteria.disability && !tags.includes("disability")) return false;

    // Check filters against tags OR eligibility string (fallback)
    if (gender && !tags.includes(gender) && !eligibility.includes(gender)) return false;
    if (ethnicity && !tags.includes(ethnicity) && !eligibility.includes(ethnicity)) return false;
    if (major && !tags.includes(major) && !eligibility.includes(major)) return false;
    if (state && !tags.includes(state) && !eligibility.includes(state)) return false;

    // Check GPA
    if (sch.minGPA && minGPA < sch.minGPA) return false;

    return true;
  });

  // Return up to 15 results; fill with general scholarships if fewer
  const results = filtered.slice(0, 15);
  while (results.length < 15) {
    results.push({
      name: "General Merit Scholarship",
      amount: "$1,000–$2,500",
      deadline: "Varies",
      eligibility: "Open to all students",
      overview: "Academic achievement recognition",
      link: "#"
    });
  }

  return results;
}

// -----------------------
// Internship Analysis using Gemini
// -----------------------
export async function analyzeInternship(internship) {
  const prompt = `
You are a career counselor and internship advisor. Analyze the following internship posting:

Title: ${internship.title}
Company: ${internship.company}
Description: ${internship.description}

Provide a short, structured analysis including:
- Relevance to career goals
- Skills gained
- Suitability for college applications

Format:
SUMMARY: ...
SKILLS: ...
RECOMMENDATIONS: ...
`;

  try {
    const result = await callGemini(prompt);
    const summaryMatch = result.match(/SUMMARY:\s*(.*?)(?=SKILLS:|$)/s);
    const skillsMatch = result.match(/SKILLS:\s*(.*?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = result.match(/RECOMMENDATIONS:\s*(.*)$/s);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : "",
      skills: skillsMatch ? skillsMatch[1].trim() : "",
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : ""
    };
  } catch (error) {
    console.error("Internship analysis error:", error);
    return {
      summary: "",
      skills: "",
      recommendations: ""
    };
  }
}