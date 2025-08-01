import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { ApiResponse } from '@/lib/types';
import { model } from '@/lib/vertexai';

interface ChatRequest {
    message: string;
    mode: 'resume_review' | 'interview_prep' | 'career_guidance';
    language: string;
    analysisId?: string;
    conversationHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { message, mode, language, analysisId, conversationHistory }: ChatRequest = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 });
        }

        let analysisContext = '';
        let contextPrompt = '';
        let systemPrompt = '';

        if (analysisId) {
            // Fetch analysis data if provided
            try {
                const cloudRunUrl = process.env.RESUME_ANALYSIS_SERVICE_URL;
                if (!cloudRunUrl) {
                    throw new Error('Resume analysis service URL not configured');
                }
                // get the analysis from the database name `analysis`
                const analysisData = await db.collection('analysis').doc(analysisId).get();

                if (analysisData.exists) {
                    const analysis = analysisData.data();
                    if (analysis?.status === 'completed') {
                        analysisContext = `
                        Analysis Context:
                        - Skills: ${analysis.profileResults?.skills?.map((s: any) => `${s.name} (${s.level})`).join(', ') || 'None'}
                        - Experience: ${analysis.profileResults?.experience?.map((e: any) => `${e.role} at ${e.company}`).join(', ') || 'None'}
                        - Education: ${analysis.profileResults?.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ') || 'None'}
                        - Technical Skills: ${analysis.technicalResults?.technicalSkills?.map((s: any) => s.name).join(', ') || 'None'}
                        - Hidden Skills: ${analysis.ahaResults?.hiddenSkills?.map((s: any) => s.originalSkill.name).join(', ') || 'None'}
                        `;


                    }
                }
            } catch (error) {
                console.error('Error fetching analysis:', error);
            }
        }

        switch (mode) {
            case 'resume_review':
                systemPrompt = `You are an expert Canadian career coach specializing in resume improvement for newcomers to Canada. Keep responses concise, structured, and actionable.

                    RESPONSE GUIDELINES:
                    - Keep responses under 150 words
                    - Use plain text only (no markdown, no asterisks, no special formatting)
                    - Use numbered or dashed lists for suggestions
                    - Ask 1-2 specific questions to understand context
                    - Focus on Canadian resume standards
                    - Be encouraging and supportive

                    RESPONSE STRUCTURE:
                    1. Brief acknowledgment (1 sentence)
                    2. 2-3 specific suggestions (numbered or dashed list)
                    3. 1-2 clarifying questions
                    4. Next step recommendation

                    RESPONSE EXAMPLE:
                    Great to connect! Here are some ways to improve your resume:
                    1. Quantify achievements: Replace vague statements with numbers showing impact, for example, "Managed a team of 5" instead of "Team management experience."
                    2. Canadianize your resume: Make sure spelling, terminology, and formatting match Canadian standards. Use a Canadian-style resume template.
                    3. Highlight transferable skills: Emphasize skills relevant to Canadian workplaces, even if gained in different contexts.
                    What type of job are you applying for? What are your top 3 transferable skills? Let's review your work experience section next.

                    ${analysisContext}

                    Respond in ${language}. Use plain text only. Do not use markdown, asterisks, or special formatting.`;
                break;

            case 'interview_prep':
                systemPrompt = `You are an expert Canadian interview coach helping newcomers prepare for job interviews. Keep responses focused and specific to the user's questions.

                RESPONSE GUIDELINES:
                - Keep responses under 150 words
                - Use plain text only (no markdown, no special formatting)
                - Focus on the specific role or question being asked
                - Provide actionable interview tips
                - Include relevant Canadian workplace context
                - Be encouraging but professional

                RESPONSE STRUCTURE:
                1. Brief acknowledgment
                2. 2-3 specific tips or practice questions relevant to their query
                3. Brief cultural context if relevant
                4. Clear next step or follow-up question

                IMPORTANT CONTEXT:
                - If the user mentions a specific role (e.g., "engine manager"), focus advice on that role
                - If they ask about a specific skill (e.g., "confidence"), provide targeted tips
                - Always maintain context from previous messages in the conversation

                Current conversation context:
                ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

                ${analysisContext}

                Respond in ${language}. Use plain text only. Do not use markdown, asterisks, or special formatting.`;
                break;

            case 'career_guidance':
                systemPrompt = `You are an expert Canadian career counselor helping newcomers navigate the Canadian job market. Keep responses concise and actionable.

                RESPONSE GUIDELINES:
                - Keep responses under 150 words
                - Use plain text only (no markdown, no asterisks, no special formatting)
                - Use numbered or dashed lists for recommendations
                - Provide specific, actionable advice
                - Ask clarifying questions about goals
                - Focus on Canadian job market realities
                - Be encouraging and supportive

                RESPONSE STRUCTURE:
                1. Brief acknowledgment (1 sentence)
                2. 2-3 specific recommendations (numbered or dashed list)
                3. 1-2 clarifying questions about goals
                4. Next step or resource suggestion

                RESPONSE EXAMPLE:
                Thanks for reaching out about your career in Canada. Here are some steps you can take:
                1. Research Canadian companies in your target industry.
                2. Join professional associations, such as PMI for project managers.
                3. Attend local networking events and meetups.
                What is your target salary range? Which Canadian cities interest you most? Let's explore certification options that are recognized in Canada.

                ${analysisContext}

                Respond in ${language}. Use plain text only. Do not use markdown, asterisks, or special formatting.`;
                break;

            default:
                systemPrompt = `You are an AI career coach helping newcomers to Canada. Keep responses focused and specific.`;
                break;
        }

        // Build conversation history for context
        const conversationContext = conversationHistory
            .slice(-10) // Keep last 10 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        // Add context-gathering logic for first-time users
        const isFirstMessage = conversationHistory.length === 0;

        if (isFirstMessage) {
            contextPrompt = `

CONTEXT GATHERING:
Since this is our first conversation, please ask 2-3 specific questions to understand:
- Their target role/industry
- Years of experience
- Current location in Canada
- Specific challenges they're facing

This will help provide more personalized guidance.`;
        }

        const fullPrompt = `${systemPrompt}${contextPrompt}

Previous conversation:
${conversationContext}

User: ${message}

Remember to:
1. Stay focused on the specific question or role mentioned
2. Provide relevant, actionable advice
3. Maintain conversation context
4. Be concise and clear

A:`;

        // Generate response using Vertex AI
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        });

        const response = result.response;
        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response at the moment. Please try again.';

        return NextResponse.json<ApiResponse<{ response: string }>>({
            success: true,
            data: {
                response: responseText
            }
        });

    } catch (error) {
        console.error('Error in coach chat:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to process message'
        }, { status: 500 });
    }
} 