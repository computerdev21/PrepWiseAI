import { RoadmapRequest, RoadmapResponse } from '../../types/roadmap';
import { model } from '../../lib/vertexai';

interface RawRoadmapItem {
    id?: string;
    type?: string;
    title?: string;
    description?: string;
    duration?: string;
    cost?: string;
    priority?: string;
    link?: string;
    requirements?: string[];
    benefits?: string[];
    timeline?: string;
}

interface RawRoadmapAnalysis {
    roadmap?: RawRoadmapItem[];
    summary?: string;
    estimatedTimeline?: string;
    totalCost?: string;
    language?: string;
}

export class RoadmapAnalyzer {
    async analyze(request: RoadmapRequest): Promise<RoadmapResponse['data']> {
        try {
            const prompt = this.buildPrompt(request);
            const result = await model.generateContent(prompt);
            const response = await result.response;

            if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response from AI model');
            }

            return this.parseResponse(response.candidates[0].content.parts[0].text.trim());
        } catch (error) {
            console.error('Error in roadmap analysis:', error);
            throw error;
        }
    }

    private buildPrompt(request: RoadmapRequest): string {
        const { userInput, userProfile } = request;
        const { countryOfOrigin, yearsOfExperience } = userProfile;
        const { preferredLanguage, targetRole, timeline, budget, currentSkills } = userInput;

        return `You are a career development AI specialist with expertise in Canadian immigration, credential recognition, and professional development. Your task is to create a personalized action plan for someone from ${countryOfOrigin} seeking to work as a ${targetRole} in Canada.

        User Profile:
        - Country of Origin: ${countryOfOrigin}
        - Target Role: ${targetRole}
        - Years of Experience: ${yearsOfExperience}
        - Preferred Language: ${preferredLanguage}
        - Timeline Goal: ${timeline}
        - Budget Range: ${budget}
        - Current Skills: ${currentSkills}

        ${preferredLanguage?.toLowerCase() !== 'english' ? `IMPORTANT: Respond entirely in ${preferredLanguage}. All titles, descriptions, and text content must be in ${preferredLanguage}.` : ''}

        Generate a comprehensive, actionable roadmap that includes:

        1. BRIDGE COURSES & ONLINE PROGRAMS
        - Canadian-specific courses to meet credential requirements
        - Online programs from recognized Canadian institutions
        - Government-funded newcomer programs
        - Language improvement courses if needed

        2. CERTIFICATION EXAMS
        - Professional certifications required for the role
        - Canadian-specific licensing requirements
        - Exam preparation resources and timelines

        3. MENTORSHIP PROGRAMS
        - Industry-specific mentorship opportunities
        - Newcomer support programs
        - Professional networking groups

        4. INTERNSHIPS & EXPERIENCE
        - Local internship opportunities
        - Volunteer positions to gain Canadian experience
        - Entry-level positions to build local credibility

        5. GOVERNMENT PROGRAMS & SCHOLARSHIPS
        - Newcomer credentialing support
        - Government-funded training programs
        - Scholarships for international professionals

        Return a JSON object with exactly this structure:
        {
        "roadmap": [
            {
            "id": "unique-id",
            "type": "course/certification/mentorship/internship/exam",
            "title": "specific program or opportunity name",
            "description": "detailed description of what this involves",
            "duration": "time to complete (e.g., 3 months, 6 weeks)",
            "cost": "estimated cost in CAD",
            "priority": "high/medium/low",
            "link": "direct link to program or resource",
            "requirements": ["specific requirements or prerequisites"],
            "benefits": ["specific benefits this will provide"],
            "timeline": "when to start this (e.g., immediately, after 3 months)"
            }
        ],
        "summary": "comprehensive overview of the action plan",
        "estimatedTimeline": "total estimated time to complete the roadmap",
        "totalCost": "total estimated cost in CAD",
        "language": "${preferredLanguage}"
        }

        IMPORTANT GUIDELINES:
        1. Focus on Canadian-specific opportunities and requirements
        2. Include real, verifiable programs and resources with actual links, make sure the link is valid, english language, from glassdoor, indeed, linkedin, ircc, cic, government of canada, etc.
        3. Consider the user's budget constraints and timeline
        4. Prioritize items that will have the most impact on credential recognition
        5. Include both free and paid options
        6. Consider language requirements and provide language-specific resources
        7. Include government programs and newcomer support services
        8. Provide realistic timelines and costs
        9. Ensure all recommendations are actionable and specific
        ${preferredLanguage !== 'English' ? `10. ALL content must be written in ${preferredLanguage}` : ''}

        CRITICAL: 
        Keep ALL URLs and links in their original English format. Do NOT translate website URLs, email addresses, or web links. Only translate the descriptive text, titles, and descriptions.
        Return ONLY the JSON object. Do not include any markdown formatting, explanations, or additional text.${preferredLanguage !== 'English' ? ` Remember: ALL text content must be in ${preferredLanguage}.` : ''}`;
    }

    private parseResponse(text: string): RoadmapResponse['data'] {
        try {
            // Remove any markdown formatting if present
            const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

            // Try to parse the JSON
            let parsed: RawRoadmapAnalysis;
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

            // Validate and sanitize the data
            return {
                roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap.map((item, index) => ({
                    id: item.id || `roadmap-item-${index}`,
                    type: (['course', 'certification', 'mentorship', 'internship', 'exam'].includes(item.type as string)
                        ? item.type
                        : 'course') as 'course' | 'certification' | 'mentorship' | 'internship' | 'exam',
                    title: String(item.title || '').slice(0, 200),
                    description: String(item.description || '').slice(0, 500),
                    duration: String(item.duration || ''),
                    cost: item.cost ? String(item.cost).slice(0, 100) : undefined,
                    priority: (['high', 'medium', 'low'].includes(item.priority as string)
                        ? item.priority
                        : 'medium') as 'high' | 'medium' | 'low',
                    link: item.link ? String(item.link).slice(0, 500) : undefined,
                    requirements: Array.isArray(item.requirements)
                        ? item.requirements.slice(0, 5).map(req => String(req).slice(0, 200))
                        : [],
                    benefits: Array.isArray(item.benefits)
                        ? item.benefits.slice(0, 5).map(benefit => String(benefit).slice(0, 200))
                        : [],
                    timeline: String(item.timeline || '')
                })) : [],
                summary: String(parsed.summary || '').slice(0, 1000),
                estimatedTimeline: String(parsed.estimatedTimeline || ''),
                totalCost: parsed.totalCost ? String(parsed.totalCost).slice(0, 100) : undefined,
                language: String(parsed.language || 'English')
            };
        } catch (error) {
            console.error('Error parsing roadmap analysis:', error);
            // Return a valid but empty roadmap object rather than throwing
            return {
                roadmap: [],
                summary: 'Unable to generate roadmap at this time.',
                estimatedTimeline: 'Unknown',
                language: 'English'
            };
        }
    }
} 