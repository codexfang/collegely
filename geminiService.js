// geminiService.js
// Gemini API Service via Flask backend

const BASE_URL = "http://127.0.0.1:5000"; // Flask backend

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

// Predict college admissions with percentage
export async function predictAdmissions(formData) {
  const prompt = `
As a college admissions expert with access to comprehensive admission data, analyze a student's admission chances for ${formData.college}.

Student Profile:
- GPA: ${formData.gpa}
- SAT Score: ${formData.sat}
- Extracurriculars: ${formData.extracurriculars || 'Not specified'}

Based on historical admission data, current admission trends, and the competitiveness of ${formData.college}, provide a realistic assessment.

Format:
CHANCE: [Specific percentage like "45%"]
EXPLANATION: [2-3 sentence explanation]
RECOMMENDATIONS: [3-4 actionable tips]
`;

  try {
    const result = await callGemini(prompt);

    const chanceMatch = result.match(/CHANCE:\s*(\d+%)/i);
    const explanationMatch = result.match(/EXPLANATION:\s*(.*?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = result.match(/RECOMMENDATIONS:\s*(.*?)$/s);

    return {
      chance: chanceMatch ? chanceMatch[1] : "50%",
      explanation: explanationMatch ? explanationMatch[1].trim() : result,
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : "Focus on strengthening your academic profile and extracurricular activities."
    };
  } catch (error) {
    return {
      chance: "Error occurred. Please try again.",
      explanation: "Unable to analyze at this time.",
      recommendations: "Please check your information and try again."
    };
  }
}

// Analyze essay
export async function analyzeEssay(essayText) {
  const prompt = `
As a college admissions essay expert, analyze this college application essay and provide constructive feedback.

Essay: "${essayText}"

Format:
SCORE: [1-10]
FEEDBACK: [Detailed feedback covering strengths, weaknesses, suggestions]
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

// Generate resume content
export async function generateResumeContent(data) {
  const prompt = `
You are a professional resume writer. Transform this student's info into polished resume content.

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Education: ${data.education}
Activities: ${data.activities.join("; ")}
Additional Info: ${data.additionalInfo || "None"}

Format:
SUMMARY:
EDUCATION:
EXPERIENCE:
SKILLS:
ACHIEVEMENTS:
`;

  try {
    const result = await callGemini(prompt);

    const summaryMatch = result.match(/SUMMARY:\s*\n?(.*?)(?=\n\s*EDUCATION:|$)/s);
    const educationMatch = result.match(/EDUCATION:\s*\n?(.*?)(?=\n\s*EXPERIENCE:|$)/s);
    const experienceMatch = result.match(/EXPERIENCE:\s*\n?(.*?)(?=\n\s*SKILLS:|$)/s);
    const skillsMatch = result.match(/SKILLS:\s*\n?(.*?)(?=\n\s*ACHIEVEMENTS:|$)/s);
    const achievementsMatch = result.match(/ACHIEVEMENTS:\s*\n?(.*?)$/s);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : "Motivated student with strong academic and extracurricular experience.",
      education: educationMatch ? educationMatch[1].trim() : data.education || "Education details missing",
      experience: experienceMatch ? experienceMatch[1].trim() : data.activities.map(a => `• ${a}`).join("\n"),
      skills: skillsMatch ? skillsMatch[1].trim() : "Communication, Leadership, Teamwork, Problem-solving",
      achievements: achievementsMatch ? achievementsMatch[1].trim() : "Academic and extracurricular achievements"
    };
  } catch (error) {
    console.error("Resume generation error:", error);
    return {
      summary: `Motivated student with experience in ${data.activities[0] || "various activities"}.`,
      education: data.education || "Education in progress",
      experience: data.activities.map(a => `• ${a}`).join("\n"),
      skills: "Communication, Leadership, Teamwork, Problem-solving",
      achievements: "Academic and extracurricular achievements"
    };
  }
}

// Find scholarships
export async function findScholarships(criteria) {
  const prompt = `
As a scholarship advisor, find scholarships for a student with this profile:

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

Provide 5-7 scholarships with NAME, DESCRIPTION, AMOUNT, REQUIREMENTS, LINK.
`;

  try {
    const result = await callGemini(prompt);

    const blocks = result.split(/SCHOLARSHIP \d+:/);
    const scholarships = [];

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const name = block.match(/NAME:\s*(.*?)(?=DESCRIPTION:|$)/s)?.[1]?.trim();
      if (name) {
        scholarships.push({
          name,
          description: block.match(/DESCRIPTION:\s*(.*?)(?=AMOUNT:|$)/s)?.[1]?.trim() || "Scholarship details",
          amount: block.match(/AMOUNT:\s*(.*?)(?=REQUIREMENTS:|$)/s)?.[1]?.trim() || "Amount varies",
          requirements: block.match(/REQUIREMENTS:\s*(.*?)(?=SCHOLARSHIP|$)/s)?.[1]?.trim() || "See details"
        });
      }
    }

    return scholarships.length ? scholarships : [{
      name: "General Merit Scholarship",
      description: "Academic achievement recognition",
      amount: "$1,000 - $2,500",
      requirements: "Strong GPA and academic standing"
    }];
  } catch (error) {
    return [{
      name: "Error fetching scholarships",
      description: "Please try again later",
      amount: "N/A",
      requirements: "N/A"
    }];
  }
}