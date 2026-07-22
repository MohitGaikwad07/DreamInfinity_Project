import { getAIService } from './ai/index.js';

export const generateAiCareerSummary = async (profile, aggregatedData) => {
  const aiService = getAIService();

  const prompt = `
Generate a professional career summary and direction for this candidate.
Return EXACTLY a JSON object with the following fields:
{
  "summary": "A detailed, compelling professional career summary paragraphs highlighting experience and potential.",
  "strengths": ["Strengths 1", "Strengths 2", "Strengths 3"],
  "weaknesses": ["Improvement Areas 1", "Improvement Areas 2"],
  "recommendedSkills": ["Recommended Skill 1", "Recommended Skill 2", "Recommended Skill 3"],
  "careerGoal": "A direct, inspiring career goal statement matching their background.",
  "learningProgress": 80
}

Candidate Information:
Name: ${profile.user?.name || 'Candidate'}
Headline: ${profile.headline || 'Software Engineer'}
Bio: ${profile.bio || ''}
Location: ${profile.location || ''}
Skills: ${JSON.stringify(profile.skills || {})}
Experience: ${JSON.stringify(profile.experience || [])}
Education: ${JSON.stringify(profile.education || [])}
Projects: ${JSON.stringify(profile.projects || [])}
Coding Performance: Solved ${aggregatedData.codingHistory?.problemsSolved || 0} problems with coding score ${aggregatedData.codingHistory?.codingScore || 0}%
Interview Performance: ${aggregatedData.interviewHistory?.completedCount || 0} interviews completed with average score ${aggregatedData.interviewHistory?.averageScore || 0}%
`;

  try {
    const rawResult = await aiService.generate({
      systemInstruction: 'You are an elite career coach and ATS optimization specialist. Analyze the candidate info and respond ONLY in valid JSON matching the schema.',
      prompt,
      responseFormat: 'json'
    });
    
    // Clean up markdown wrapping if any
    return parseJSON(rawResult);
  } catch (error) {
    console.error('AI Career Summary Generation Error:', error);
    // Return fallback summary if AI fails
    return {
      summary: `${profile.user?.name || 'The candidate'} is a dedicated professional specializing in software engineering. Ready to apply technical competence and soft skills to build high-impact systems.`,
      strengths: ['Technical capabilities', 'Goal oriented', 'Eager learner'],
      weaknesses: ['Expanding cloud deployments', 'Mock interview speed'],
      recommendedSkills: ['Docker', 'AWS Solutions', 'System Design'],
      careerGoal: 'Develop robust, scalable engineering solutions for modern business operations.',
      learningProgress: 50
    };
  }
};

const parseJSON = (text) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('No JSON block found in AI response');
    }
    const cleanText = text.slice(start, end + 1).trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Failed to parse AI JSON:', err.message);
    throw err;
  }
};

export const generateAiPortfolioReview = async (profile, aggregatedData) => {
  const aiService = getAIService();

  const prompt = `
Analyze the candidate's portfolio (projects, resume, coding stats, interview performance, and community activity) and generate a detailed review.
Return EXACTLY a JSON object with the following fields:
{
  "score": 85,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "missingSections": ["missing section 1", "missing section 2"],
  "improvements": ["improvement 1", "improvement 2"]
}

Candidate Portfolio Data:
Headline: ${profile.headline || ''}
Bio: ${profile.bio || ''}
Skills: ${JSON.stringify(profile.skills || {})}
Experience: ${JSON.stringify(profile.experience || [])}
Education: ${JSON.stringify(profile.education || [])}
Projects: ${JSON.stringify(profile.projects || [])}
Latest Resume Details: Target Role is ${aggregatedData.latestResume?.targetRole || 'Not specified'}, ATS Score is ${aggregatedData.latestResume?.atsScore || 0}%
Coding submissions: ${aggregatedData.codingHistory?.problemsSolved || 0} questions solved
Mock Interviews: Average score is ${aggregatedData.interviewHistory?.averageScore || 0}%
Community posts: ${aggregatedData.communityProfile?.postCount || 0} posts shared
`;

  try {
    const rawResult = await aiService.generate({
      systemInstruction: 'You are a veteran technical recruiter analyzing portfolios for top tech roles. Review the details objectively and output ONLY valid JSON.',
      prompt,
      responseFormat: 'json'
    });

    return parseJSON(rawResult);
  } catch (error) {
    console.error('AI Portfolio Review Generation Error:', error);
    // Return fallback review if AI fails
    return {
      score: 65,
      suggestions: ['Add links to live demos of your projects', 'Practice mock interviews to lift communication scores'],
      missingSections: ['Cover Banner photo', 'DevOps & DevOps tools in Skills list'],
      improvements: ['Add descriptions for your education history', 'Increase Github engagement links']
    };
  }
};
