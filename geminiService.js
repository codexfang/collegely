// Gemini API Service
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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
    
    Please provide your analysis with:
    1. Admission chance as a specific percentage (e.g., "65%" - not a range, just one number with % symbol)
    2. A concise explanation (2-3 sentences) explaining the reasoning behind this percentage
    3. 3-4 specific, actionable recommendations for improving admission chances
    
    Consider factors like:
    - The school's average admitted student profile
    - Current acceptance rates
    - How competitive this student's profile is relative to typical admits
    - Any standout strengths or weaknesses
    
    Format your response as plain text with clear sections:
    CHANCE: [Specific percentage like "45%"]
    EXPLANATION: [Your detailed explanation here]
    RECOMMENDATIONS: [Numbered list of specific recommendations]
    
    Be realistic and accurate based on actual admission statistics. If it's a highly competitive school like Harvard or Stanford, most students should get lower percentages unless they have exceptional profiles.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    
    // Parse the structured response with more flexible regex for percentages
    const chanceMatch = result.match(/CHANCE:\s*(\d+%)/i);
    const explanationMatch = result.match(/EXPLANATION:\s*(.*?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = result.match(/RECOMMENDATIONS:\s*(.*?)$/s);
    
    return {
      chance: chanceMatch ? chanceMatch[1] : '50%', // Default to 50% if parsing fails
      explanation: explanationMatch ? explanationMatch[1].trim() : result,
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : 'Focus on strengthening your academic profile and extracurricular activities.'
    };
  } catch (error) {
    return {
      chance: 'Error occurred. Please try again.',
      explanation: 'Unable to analyze at this time.',
      recommendations: 'Please check your information and try again.'
    };
  }
}

// Analyze essay
export async function analyzeEssay(essayText) {
  const prompt = `
    As a college admissions essay expert, analyze this college application essay and provide constructive feedback.
    
    Essay: "${essayText}"
    
    Please provide your analysis in this format:
    SCORE: [Number from 1-10]
    FEEDBACK: [Your detailed feedback here covering strengths, weaknesses, and specific suggestions for improvement]
    
    Focus on:
    - Content quality and personal insight
    - Structure and organization
    - Writing style and clarity
    - Originality and authenticity
    - College application effectiveness
  `;

  try {
    const result = await callGeminiAPI(prompt);
    
    // Parse the structured response
    const scoreMatch = result.match(/SCORE:\s*(\d+)/);
    const feedbackMatch = result.match(/FEEDBACK:\s*(.*?)$/s);
    
    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 7,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : result
    };
  } catch (error) {
    return {
      score: null,
      feedback: 'Error analyzing essay. Please try again later.'
    };
  }
}

// Generate resume content
export async function generateResumeContent(data) {
  const prompt = `You are a professional resume writer. Transform this student's basic information into polished, professional resume content.

Student Information:
Name: ${data.name}
Email: ${data.email}  
Phone: ${data.phone}
Education: ${data.education}
Activities: ${data.activities.join('; ')}
Additional Info: ${data.additionalInfo || 'None'}

Create professional resume content following this EXACT format:

SUMMARY:
Write a compelling 2-3 sentence professional summary that highlights the student's key strengths, academic focus, and career goals. Make it specific and impressive.

EDUCATION:
Rewrite the education information in professional resume format. Add relevant details like GPA if impressive, relevant coursework, honors, etc.

EXPERIENCE:
Transform each activity into professional bullet points. Start each with a strong action verb (Led, Developed, Managed, Organized, etc.). Quantify achievements where possible (numbers, percentages, team sizes, etc.). Make each sound impressive and professional.

SKILLS:
List relevant technical skills, software, programming languages, and soft skills based on the activities. Format as comma-separated list.

ACHIEVEMENTS:
Create specific achievements based on the activities and education. Include academic honors, competition results, leadership roles, certifications, etc.

Make everything sound professional and impressive. Use specific details and strong action verbs. No placeholder text.`;

  try {
    console.log('Calling Gemini API with prompt:', prompt); // Debug log
    const result = await callGeminiAPI(prompt);
    console.log('Raw Gemini response:', result); // Debug log
    
    // Parse the structured response with more flexible regex
    const summaryMatch = result.match(/SUMMARY:\s*\n?(.*?)(?=\n\s*EDUCATION:|$)/s);
    const educationMatch = result.match(/EDUCATION:\s*\n?(.*?)(?=\n\s*EXPERIENCE:|$)/s);
    const experienceMatch = result.match(/EXPERIENCE:\s*\n?(.*?)(?=\n\s*SKILLS:|$)/s);
    const skillsMatch = result.match(/SKILLS:\s*\n?(.*?)(?=\n\s*ACHIEVEMENTS:|$)/s);
    const achievementsMatch = result.match(/ACHIEVEMENTS:\s*\n?(.*?)$/s);
    
    const enhancedContent = {
      summary: summaryMatch ? summaryMatch[1].trim() : 'Motivated and dedicated student with strong academic background and diverse experience.',
      education: educationMatch ? educationMatch[1].trim() : data.education || 'Education details to be added',
      experience: experienceMatch ? experienceMatch[1].trim() : data.activities.map(act => `• Enhanced: ${act}`).join('\n'),
      skills: skillsMatch ? skillsMatch[1].trim() : 'Communication, Leadership, Teamwork, Problem-solving, Time Management, Microsoft Office',
      achievements: achievementsMatch ? achievementsMatch[1].trim() : 'Dean\'s List candidate, Active community volunteer, Leadership experience'
    };
    
    console.log('Parsed enhanced content:', enhancedContent); // Debug log
    return enhancedContent;
    
  } catch (error) {
    console.error('Resume generation error:', error);
    // Return enhanced fallback content
    return {
      summary: `Motivated ${data.education ? 'student' : 'individual'} with demonstrated experience in ${data.activities.length > 0 ? data.activities[0].toLowerCase() : 'various activities'} and strong commitment to academic and personal excellence.`,
      education: data.education || 'Educational background in progress',
      experience: data.activities.map((act, index) => `• ${index === 0 ? 'Led' : index === 1 ? 'Managed' : 'Participated in'} ${act.toLowerCase()} with focus on skill development and team collaboration`).join('\n'),
      skills: 'Communication, Leadership, Teamwork, Problem-solving, Time Management, Organization, Microsoft Office Suite',
      achievements: 'Academic excellence, Leadership development, Community involvement, Skill advancement through extracurricular activities'
    };
  }
}

// Find scholarships
export async function findScholarships(criteria) {
  const prompt = `
    As a scholarship advisor, find specific scholarships for a student with these characteristics:
    
    Profile:
    - Low Income: ${criteria.lowIncome ? 'Yes' : 'No'}
    - First Generation: ${criteria.firstGen ? 'Yes' : 'No'}
    - Ethnicity: ${criteria.ethnicity || 'Not specified'}
    - Gender: ${criteria.gender || 'Not specified'}
    - Major: ${criteria.major || 'Not specified'}
    - State: ${criteria.state || 'Not specified'}
    - Minimum GPA: ${criteria.minGPA || 'Not specified'}
    - Volunteer Experience: ${criteria.volunteer ? 'Yes' : 'No'}
    - Veteran/Military: ${criteria.veteran ? 'Yes' : 'No'}
    - Disability: ${criteria.disability ? 'Yes' : 'No'}
    
    Please provide 5-7 relevant scholarships in this format:
    
    SCHOLARSHIP 1:
    NAME: [Scholarship name]
    DESCRIPTION: [Brief description]
    AMOUNT: [Dollar amount or range]
    REQUIREMENTS: [Key requirements]
    LINK: [Give the link to the Scholarship]
    
    SCHOLARSHIP 2:
    NAME: [Scholarship name]
    DESCRIPTION: [Brief description]
    AMOUNT: [Dollar amount or range]
    REQUIREMENTS: [Key requirements]
    LINK: [Give the link to the Scholarship]

    
    [Continue for all scholarships...]
    
    Focus on real, accessible scholarships that match the student's profile.
  `;

  try {
    const result = await callGeminiAPI(prompt);
    
    // Parse scholarships from structured response
    const scholarshipBlocks = result.split(/SCHOLARSHIP \d+:/);
    const scholarships = [];
    
    for (let i = 1; i < scholarshipBlocks.length; i++) {
      const block = scholarshipBlocks[i];
      const nameMatch = block.match(/NAME:\s*(.*?)(?=DESCRIPTION:|$)/s);
      const descMatch = block.match(/DESCRIPTION:\s*(.*?)(?=AMOUNT:|$)/s);
      const amountMatch = block.match(/AMOUNT:\s*(.*?)(?=REQUIREMENTS:|$)/s);
      const reqMatch = block.match(/REQUIREMENTS:\s*(.*?)(?=SCHOLARSHIP|$)/s);
      
      if (nameMatch) {
        scholarships.push({
          name: nameMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : 'Scholarship opportunity',
          amount: amountMatch ? amountMatch[1].trim() : 'Amount varies',
          requirements: reqMatch ? reqMatch[1].trim() : 'See scholarship details'
        });
      }
    }
    
    // Fallback scholarships if parsing fails
    if (scholarships.length === 0) {
      const fallbackScholarships = [];
      
      if (criteria.lowIncome) {
        fallbackScholarships.push({
          name: 'Federal Pell Grant',
          description: 'Need-based federal grant for undergraduate students',
          amount: 'Up to $7,395',
          requirements: 'Demonstrate exceptional financial need'
        });
      }
      
      if (criteria.firstGen) {
        fallbackScholarships.push({
          name: 'First Generation College Student Scholarship',
          description: 'Support for students whose parents did not complete college',
          amount: '$2,500',
          requirements: 'First-generation college student status'
        });
      }
      
      if (criteria.ethnicity) {
        fallbackScholarships.push({
          name: `${criteria.ethnicity} Heritage Scholarship`,
          description: `Educational support for ${criteria.ethnicity} students`,
          amount: '$1,500 - $3,000',
          requirements: 'Cultural heritage and academic merit'
        });
      }
      
      if (criteria.major) {
        fallbackScholarships.push({
          name: `${criteria.major} Academic Excellence Award`,
          description: `Merit scholarship for ${criteria.major} students`,
          amount: '$2,000 - $5,000',
          requirements: 'Strong academic performance in chosen field'
        });
      }
      
      if (criteria.volunteer) {
        fallbackScholarships.push({
          name: 'Community Service Leadership Award',
          description: 'Recognition for outstanding volunteer contributions',
          amount: '$1,000 - $2,500',
          requirements: 'Documented volunteer service and leadership'
        });
      }
      
      return fallbackScholarships.length > 0 ? fallbackScholarships : [
        {
          name: 'General Merit Scholarship',
          description: 'Academic achievement recognition',
          amount: '$1,000 - $2,500',
          requirements: 'Strong GPA and academic standing'
        }
      ];
    }
    
    return scholarships;
  } catch (error) {
    return [{
      name: 'Error fetching scholarships',
      description: 'Please try again later',
      amount: 'N/A',
      requirements: 'N/A'
    }];
  }
}