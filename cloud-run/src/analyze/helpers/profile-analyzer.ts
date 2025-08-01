import { BaseAnalyzer } from './base-analyzer';
import { AnalysisRequest, ProfileAnalysis } from '../../types/analysis';

interface RawSkill {
    name?: string;
    level?: string;
    confidence?: number;
}

interface RawExperience {
    role?: string;
    company?: string;
    duration?: number;
    highlights?: string[];
}

interface RawEducation {
    degree?: string;
    institution?: string;
    year?: number;
    country?: string;
    accreditation?: string;
    credibilityScore?: number;
    recognitionStatus?: string;
    gapAnalysis?: {
        missingRequirements?: string[];
        additionalSteps?: string[];
        estimatedTimeToEquivalency?: number;
        licensingExamsRequired?: string[];
    };
    equivalency?: {
        localEquivalent?: string;
        coveragePercentage?: number;
        recognizingBodies?: string[];
    };
}

interface RawRecommendation {
    type?: string;
    description?: string;
    priority?: string;
    category?: string;
    actionable?: boolean;
    timeframe?: string;
}

interface RawProfileAnalysis {
    skills?: RawSkill[];
    experience?: RawExperience[];
    education?: RawEducation[];
    recommendations?: RawRecommendation[];
}

export class ProfileAnalyzer extends BaseAnalyzer<ProfileAnalysis> {
    protected buildPrompt(request: AnalysisRequest): string {
        const { resumeText } = request;
        return `You are a resume analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text, markdown formatting, or explanation.

        Resume Text:
        ${resumeText}
        
        Today's date is ${new Date().toISOString().split('T')[0]}.
        
        Return a JSON object with exactly this structure:
        {
          "skills": [
            {
              "name": "skill name (max 50 chars)",
              "level": "beginner/intermediate/advanced/expert",
              "confidence": 0.95
            }
          ],
          "experience": [
            {
              "role": "job title (max 100 chars)",
              "company": "company name (max 100 chars)",
              "duration": 24,
              "highlights": ["achievement (max 200 chars per item, max 5 items)"]
            }
          ],
          "education": [
            {
              "degree": "degree name (max 100 chars)",
              "institution": "institution name (max 100 chars)",
              "year": 2020,
              "country": "country where degree was obtained",
              "accreditation": "recognized/unrecognized/pending_verification",
              "credibilityScore": 0.85,
              "recognitionStatus": "fully_recognized/partially_recognized/requires_assessment/not_recognized",
              "gapAnalysis": {
                "missingRequirements": ["specific courses or requirements missing"],
                "additionalSteps": ["credential evaluation", "licensing exam", "bridge courses"],
                "estimatedTimeToEquivalency": 12,
                "licensingExamsRequired": ["specific exam names if applicable"]
              },
              "equivalency": {
                "localEquivalent": "equivalent degree/diploma in target location",
                "coveragePercentage": 80,
                "recognizingBodies": ["WES", "ICAS", "IQAS", "relevant professional bodies"]
              }
            }
          ],
          "recommendations": [
            {
              "type": "skill/certification/experience/education_upgrade",
              "description": "detailed recommendation (max 200 chars)",
              "priority": "high/medium/low",
              "category": "immediate/short_term/long_term",
              "actionable": true,
              "timeframe": "1-3 months/3-6 months/6-12 months/1+ years"
            }
          ]
        }
        
        EXPERIENCE DURATION CALCULATION RULES:
        1. If end date contains "present", "current", "now", or is missing, use current date (${new Date().toISOString().split('T')[0]}) as end date.
        2. Calculate months accurately using this logic:
           - Parse start and end dates carefully (handle formats like "11/2012", "Nov 2012", "November 2012", "2012-11", etc.)
           - For "11, 2012 - 12, 2014": Start = November 2012, End = December 2014 = 25 months
           - For "Jan 2020 - Present": Start = January 2020, End = Current date
           - For "2019 - 2021": Start = January 2019, End = December 2021 = 36 months
           - For overlapping periods, count actual months worked
        3. Duration calculation examples:
           - "Jan 2020 - Dec 2020" = 12 months
           - "Nov 2012 - Dec 2014" = 25 months (Nov 2012 to Dec 2014)
           - "Mar 2021 - Present" = months from March 2021 to current date
           - "2019 - 2020" = 24 months (assume full years Jan to Dec)
        4. If only year is provided (e.g., "2019 - 2021"), assume January start and December end.
        5. Round partial months up to nearest whole month.
        
        GAP ANALYSIS GUIDELINES:
        - If the user has a gap in their education, provide a recommendation to upgrade their education.
        - If the user has a gap in their skills, provide a recommendation to upgrade their skills.
        - If the user has a gap in their experience, provide a recommendation to upgrade their experience.
        - If the user has a gap in their certifications, provide a recommendation to upgrade their certifications.
        - If the user has a gap in their projects, provide a recommendation to upgrade their projects.
        
        RECOMMENDATIONS GUIDELINES:
        - If the user has a gap in their education, provide a recommendation to upgrade their education.
        - If the user has a gap in their skills, provide a recommendation to upgrade their skills.
        - If the user has a gap in their experience, provide a recommendation to upgrade their experience.
        - If the user has a gap in their certifications, provide a recommendation to upgrade their certifications.
        - If the user has a gap in their projects, provide a recommendation to upgrade their projects.
        - If the user has a gap in their tools, provide a recommendation to upgrade their tools.
        - If the user has a gap in their methodologies, provide a recommendation to upgrade their methodologies.
        
        IMPORTANT:
        1. Return ONLY the JSON object. Do not include any markdown formatting, explanations, or additional text.
        2. Strictly follow the character limits for each field.
        3. For experience highlights, include at most 5 most important achievements.
        4. Ensure all strings are properly escaped and terminated.
        5. For education analysis, provide realistic assessments of international credential recognition and equivalency.
        6. For experience duration, calculate months accurately using the rules above. Double-check your month calculations.
        7. Pay special attention to date formats and handle "present", "current", "ongoing" as current date.
        
        `;
    }

    protected parseResponse(text: string): ProfileAnalysis {
        try {
            // Remove any markdown formatting if present
            const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

            // Try to parse the JSON
            let parsed: RawProfileAnalysis;
            try {
                parsed = JSON.parse(cleanText);
            } catch (parseError) {
                // If parsing fails, try to clean up common issues
                const fixedText = cleanText
                    // Fix unterminated strings by adding missing quotes
                    .replace(/([^"])(")([^"]*$)/g, '$1$2$3"')
                    // Remove any trailing commas in arrays and objects
                    .replace(/,(\s*[}\]])/g, '$1')
                    // Ensure arrays and objects are properly closed
                    .replace(/([^}\]])\s*$/g, '$1}')
                    .trim();
                parsed = JSON.parse(fixedText);
            }

            console.log('Parsed response:', parsed);

            // Validate and sanitize the data
            return {
                skills: Array.isArray(parsed.skills) ? parsed.skills.map(skill => ({
                    name: String(skill.name || '').slice(0, 50),
                    level: (['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level as string)
                        ? skill.level
                        : 'intermediate') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
                    confidence: Number(skill.confidence) || 0.5
                })) : [],
                experience: Array.isArray(parsed.experience) ? parsed.experience.map(exp => ({
                    role: String(exp.role || '').slice(0, 100),
                    company: String(exp.company || '').slice(0, 100),
                    duration: Number(exp.duration) || 0,
                    highlights: Array.isArray(exp.highlights)
                        ? exp.highlights.slice(0, 5).map(h => String(h).slice(0, 200))
                        : []
                })) : [],
                education: Array.isArray(parsed.education) ? parsed.education.map(edu => ({
                    degree: String(edu.degree || '').slice(0, 100),
                    institution: String(edu.institution || '').slice(0, 100),
                    year: typeof edu.year === 'number' && Number.isInteger(edu.year) ? edu.year : null,
                    country: String(edu.country || ''),
                    accreditation: (['recognized', 'unrecognized', 'pending_verification'].includes(edu.accreditation as string)
                        ? edu.accreditation
                        : 'pending_verification') as 'recognized' | 'unrecognized' | 'pending_verification',
                    credibilityScore: Number(edu.credibilityScore) || 0.5,
                    recognitionStatus: (['fully_recognized', 'partially_recognized', 'requires_assessment', 'not_recognized'].includes(edu.recognitionStatus as string)
                        ? edu.recognitionStatus
                        : 'requires_assessment') as 'fully_recognized' | 'partially_recognized' | 'requires_assessment' | 'not_recognized',
                    gapAnalysis: edu.gapAnalysis ? {
                        missingRequirements: Array.isArray(edu.gapAnalysis.missingRequirements)
                            ? edu.gapAnalysis.missingRequirements.map(req => String(req))
                            : [],
                        additionalSteps: Array.isArray(edu.gapAnalysis.additionalSteps)
                            ? edu.gapAnalysis.additionalSteps.map(step => String(step))
                            : [],
                        estimatedTimeToEquivalency: Number(edu.gapAnalysis.estimatedTimeToEquivalency) || 0,
                        licensingExamsRequired: Array.isArray(edu.gapAnalysis.licensingExamsRequired)
                            ? edu.gapAnalysis.licensingExamsRequired.map(exam => String(exam))
                            : []
                    } : {
                        missingRequirements: [],
                        additionalSteps: [],
                        estimatedTimeToEquivalency: 0,
                        licensingExamsRequired: []
                    },
                    equivalency: edu.equivalency ? {
                        localEquivalent: String(edu.equivalency.localEquivalent || ''),
                        coveragePercentage: Number(edu.equivalency.coveragePercentage) || 0,
                        recognizingBodies: Array.isArray(edu.equivalency.recognizingBodies)
                            ? edu.equivalency.recognizingBodies.map(body => String(body))
                            : []
                    } : {
                        localEquivalent: '',
                        coveragePercentage: 0,
                        recognizingBodies: []
                    }
                })) : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(rec => ({
                    type: (['skill', 'certification', 'experience', 'education_upgrade'].includes(rec.type as string)
                        ? rec.type
                        : 'skill') as 'skill' | 'certification' | 'experience' | 'education_upgrade',
                    description: String(rec.description || '').slice(0, 200),
                    priority: (['high', 'medium', 'low'].includes(rec.priority as string)
                        ? rec.priority
                        : 'medium') as 'high' | 'medium' | 'low',
                    category: (['immediate', 'short_term', 'long_term'].includes(rec.category as string)
                        ? rec.category
                        : 'short_term') as 'immediate' | 'short_term' | 'long_term',
                    actionable: Boolean(rec.actionable),
                    timeframe: (['1-3 months', '3-6 months', '6-12 months', '1+ years'].includes(rec.timeframe as string)
                        ? rec.timeframe
                        : '3-6 months') as '1-3 months' | '3-6 months' | '6-12 months' | '1+ years'
                })) : []
            };
        } catch (error) {
            console.error('Error parsing profile analysis:', error);
            // Return a valid but empty analysis object rather than throwing
            return {
                skills: [],
                experience: [],
                education: [],
                recommendations: []
            };
        }
    }
} 