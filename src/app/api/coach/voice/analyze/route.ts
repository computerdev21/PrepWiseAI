import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { model } from '@/lib/vertexai';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await auth.verifyIdToken(token);

        const { text, isAccentEnabled } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Combined prompt for both interview analysis and pronunciation (if enabled)
        const prompt = `As an expert Canadian interview and pronunciation coach, analyze the following response.
${isAccentEnabled ? `
First, analyze the pronunciation and provide:
1. Identified pronunciation patterns
2. Canadian English pronunciation feedback
3. Specific words or sounds that need attention
4. Practice suggestions

Return this part in the "pronunciation" section of the JSON response.
` : ''}

Then, analyze the interview response and provide:
1. Scores (0 to 1) for each attribute:
   - confidence: How confident does the speaker sound?
   - nervousness: How nervous does the speaker appear?
   - engagement: How engaged and enthusiastic is the speaker?
   - clarity: How clear and articulate is the response?

2. Specific reasons for each score, identifying:
   - What contributed to high scores
   - What led to low scores
   - Specific examples from the text

3. Actionable improvement suggestions for the lowest scoring areas

Text to analyze: "${text}"

Return the response in this exact JSON format:
{
    "confidence": 0.75,
    "nervousness": 0.3,
    "engagement": 0.8,
    "clarity": 0.7,
    "analysis": {
        "confidence": {
            "score": 0.75,
            "reasons": ["Speaks with authority", "Uses strong action verbs"],
            "examples": ["specific phrases from text"],
            "improvements": ["specific suggestions"]
        },
        "nervousness": {
            "score": 0.3,
            "reasons": ["Limited filler words", "Clear speech pattern"],
            "examples": ["specific phrases from text"],
            "improvements": ["specific suggestions"]
        },
        "engagement": {
            "score": 0.8,
            "reasons": ["Shows enthusiasm", "Asks thoughtful questions"],
            "examples": ["specific phrases from text"],
            "improvements": ["specific suggestions"]
        },
        "clarity": {
            "score": 0.7,
            "reasons": ["Well-structured response", "Professional vocabulary"],
            "examples": ["specific phrases from text"],
            "improvements": ["specific suggestions"]
        }
    },
    ${isAccentEnabled ? `
    "pronunciation": {
        "patterns": ["List of identified pronunciation patterns"],
        "feedback": ["Specific Canadian English pronunciation feedback"],
        "focusWords": ["Words that need attention"],
        "practiceExercises": ["Suggested exercises for improvement"]
    },` : ''}
    "primaryFeedback": "One clear, actionable suggestion focusing on the lowest scoring area"
}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = result.response;
        let analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up the response text to ensure it's valid JSON
        analysisText = analysisText.trim();
        analysisText = analysisText.replace(/```json\n?/g, '');
        analysisText = analysisText.replace(/```\n?/g, '');
        analysisText = analysisText.trim();

        try {
            const analysis = JSON.parse(analysisText);

            // Validate the analysis object has all required fields
            const requiredFields = ['confidence', 'nervousness', 'engagement', 'clarity', 'analysis', 'primaryFeedback'];
            if (isAccentEnabled) requiredFields.push('pronunciation');

            const hasAllFields = requiredFields.every(field => field in analysis);

            if (!hasAllFields) {
                throw new Error('Invalid analysis format');
            }

            // Generate a more detailed feedback message
            const lowestScore = Math.min(
                analysis.confidence,
                analysis.engagement,
                analysis.clarity,
                1 - analysis.nervousness // Invert nervousness for comparison
            );

            let attribute = '';
            if (lowestScore === analysis.confidence) attribute = 'confidence';
            else if (lowestScore === analysis.engagement) attribute = 'engagement';
            else if (lowestScore === analysis.clarity) attribute = 'clarity';
            else if (lowestScore === 1 - analysis.nervousness) attribute = 'nervousness';

            const feedback = {
                score: lowestScore,
                attribute,
                reasons: analysis.analysis[attribute].reasons,
                examples: analysis.analysis[attribute].examples,
                improvements: analysis.analysis[attribute].improvements,
                primaryFeedback: analysis.primaryFeedback,
                pronunciation: isAccentEnabled ? analysis.pronunciation : null
            };

            return NextResponse.json({
                scores: {
                    confidence: analysis.confidence,
                    nervousness: analysis.nervousness,
                    engagement: analysis.engagement,
                    clarity: analysis.clarity
                },
                feedback,
                detailedAnalysis: analysis.analysis
            });

        } catch (error) {
            console.error('Error parsing analysis:', error);
            console.error('Raw analysis text:', analysisText);
            return NextResponse.json({ error: 'Failed to analyze response' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in voice analysis:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 