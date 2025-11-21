// geminiService.js
// Gemini API Service via Flask backend

const BASE_URL = "https://collegely-backend.onrender.com";

export async function callGemini(prompt) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Predict college admissions with detailed analysis
export async function predictAdmissions(formData) {
  const prompt = `
You are a top college admissions expert with access to comprehensive historical admission data.

Analyze this student's chances for ${formData.college} with extreme detail. Include academic competitiveness, extracurriculars impact, and personalized suggestions.

Student Profile:
- GPA: ${formData.gpa}
- SAT Score: ${formData.sat}
- Extracurriculars: ${formData.extracurriculars || 'Not specified'}

Format your response as:
CHANCE: [percentage like 45%]
EXPLANATION: [3-4 sentences analyzing academic and extracurricular strength]
RECOMMENDATIONS: [5 actionable tips for improving chances]
`;

  try {
    const result = await callGemini(prompt);

    const chanceMatch = result.match(/CHANCE:\s*(\d+%)/i);
    const explanationMatch = result.match(/EXPLANATION:\s*(.*?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = result.match(/RECOMMENDATIONS:\s*(.*?)$/s);

    return {
      chance: chanceMatch ? chanceMatch[1] : "50%",
      explanation: explanationMatch ? explanationMatch[1].trim() : result,
      recommendations: recommendationsMatch
        ? recommendationsMatch[1].trim()
        : "Strengthen academics, highlight leadership and achievements, and craft compelling essays."
    };
  } catch (error) {
    return {
      chance: "Error occurred. Please try again.",
      explanation: "Unable to analyze at this time.",
      recommendations: "Please check your information and try again."
    };
  }
}

// Essay analysis with deep insight
export async function analyzeEssay(essayText) {
  const prompt = `
You are an expert college admissions essay reviewer. Analyze this essay in detail. Focus on:

- Clarity, flow, and structure
- Unique personal voice
- Demonstration of character and achievements
- Grammar and syntax
- Suggestions for improvement

Essay: """${essayText}"""

Format:
SCORE: [1-10]
FEEDBACK: [Detailed strengths, weaknesses, improvements, and actionable tips]
`;

  try {
    const result = await callGemini(prompt);

    const scoreMatch = result.match(/SCORE:\s*(\d+)/);
    const feedbackMatch = result.match(/FEEDBACK:\s*(.*?)$/s);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 7,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : result
    };
  } catch (error) {
    return {
      score: null,
      feedback: "Error analyzing essay. Please try again later."
    };
  }
}

// Resume generator with enhanced professional output
export async function generateResumeContent(data) {
  const prompt = `
You are a professional resume writer. Create a **polished, highly detailed, professional resume** suitable for college applications or internships.

Include all relevant sections with formatting and bullet points. Use action verbs, keywords, and concise descriptions. Prioritize achievements, leadership, and skills.

Student Info:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Education: ${data.education}
- Activities: ${data.activities.join("; ")}
- Additional Info: ${data.additionalInfo || "None"}

Resume Format:
------------------------------------------------
NAME: [Full Name]
CONTACT: [Email | Phone]
SUMMARY:
- Write a strong 3-4 sentence professional summary highlighting academics, leadership, and skills.
EDUCATION:
- Include GPA, honors, awards, relevant coursework.
EXPERIENCE / PROJECTS:
- List experiences, internships, volunteer work, projects with bullet points.
SKILLS:
- Include technical, leadership, and soft skills.
ACHIEVEMENTS:
- List awards, recognitions, and notable accomplishments.
ADDITIONAL INFO:
- Optional: certifications, languages, interests.

Output each section clearly and make it **ready to copy into a resume template**.
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
      summary: extractSection('SUMMARY') || "Motivated student with strong academic and extracurricular background.",
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
      summary: "Motivated student with strong academic and extracurricular background.",
      education: data.education || "Education in progress",
      experience: data.activities.map(a => `• ${a}`).join("\n"),
      skills: "Leadership, Teamwork, Communication, Problem-solving",
      achievements: "Awards and recognitions",
      additionalInfo: data.additionalInfo || "None"
    };
  }
}

// Scholarship finder with top national scholarships and robust parsing
export async function findScholarships(criteria) {
  const prompt = `
You are a top scholarship advisor. Provide a **list of 15 top national scholarships** for a student with this profile. Include NAME, DESCRIPTION, AMOUNT, REQUIREMENTS, and LINK.

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

Format each scholarship as:
SCHOLARSHIP 1:
NAME: ...
DESCRIPTION: ...
AMOUNT: ...
REQUIREMENTS: ...
LINK: ...
`;

  try {
    const result = await callGemini(prompt);

    const blocks = result.split(/SCHOLARSHIP\s*\d+:/i).filter(Boolean);
    const scholarships = [];

    for (let block of blocks) {
      const name = block.match(/NAME:\s*(.*?)(?:\n|$)/s)?.[1]?.trim();
      if (!name) continue;

      scholarships.push({
        name,
        description: block.match(/DESCRIPTION:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Details not available",
        amount: block.match(/AMOUNT:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Varies",
        requirements: block.match(/REQUIREMENTS:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "Check website",
        link: block.match(/LINK:\s*(.*?)(?:\n|$)/s)?.[1]?.trim() || "#"
      });
    }

    return scholarships.length ? scholarships : [{
      name: "General Merit Scholarship",
      description: "Academic achievement recognition",
      amount: "$1,000 - $2,500",
      requirements: "Strong GPA and academic standing",
      link: "#"
    }];
  } catch (error) {
    console.error("Scholarship fetching error:", error);
    return [{
      name: "Error fetching scholarships",
      description: "Please try again later",
      amount: "N/A",
      requirements: "N/A",
      link: "#"
    }];
  }
}
