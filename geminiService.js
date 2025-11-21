// geminiService.js
// Gemini API Service via Flask backend

const BASE_URL = "https://collegely-backend.onrender.com"; // Make sure this matches your Render URL

// Generic POST call to Flask /api/chat endpoint
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

// College admissions prediction
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
    console.debug('predictAdmissions - raw response:', result);

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

// Essay analysis
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

// Resume generation
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

// Scholarship finder
export async function findScholarships(criteria) {
  const prompt = `
You are a scholarship advisor. Provide 15 top national scholarships with NAME, DESCRIPTION, AMOUNT, REQUIREMENTS, LINK.

Student Profile:
- Low Income: ${criteria.lowIncome ? "Yes" : "No"}
- First Generation: ${criteria.firstGen ? "Yes" : "No"}
- Ethnicity: ${criteria.ethnicity || "Not specified"}
- Gender: ${criteria.gender || "Not specified"}
- Major: ${criteria.major || "Not specified"}
- State: ${criteria.state || "Not specified"}
- Minimum GPA: ${criteria.minGPA || "Not specified"}
- Volunteer Experience: ${criteria.volunteer ? "Yes" : "No"}
- Veteran/Military: ${criteria.veteran ? "Yes" : "No"}
- Disability: ${criteria.disability ? "Yes" : "No"}

Format each scholarship clearly.
`;

  try {
    const result = await callGemini(prompt);
    const blocks = result.split(/SCHOLARSHIP\s*\d+:/i).filter(Boolean);
    return blocks.map(block => ({
      name: block.match(/NAME:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Unknown",
      description: block.match(/DESCRIPTION:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "N/A",
      amount: block.match(/AMOUNT:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Varies",
      requirements: block.match(/REQUIREMENTS:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Check website",
      link: block.match(/LINK:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "#"
    })).filter(s => s.name) || [{
      name: "General Merit Scholarship",
      description: "Academic achievement recognition",
      amount: "$1,000 - $2,500",
      requirements: "Strong GPA",
      link: "#"
    }];
  } catch (error) {
    console.error("Scholarship fetching error:", error);
    return [{
      name: "Error fetching scholarships",
      description: "Try again later",
      amount: "N/A",
      requirements: "N/A",
      link: "#"
    }];
  }
}