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

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Use Vertex AI to analyze pronunciation and provide Canadian English feedback
        const prompt = `Analyze the following text for pronunciation in Canadian English. Focus on words that might be challenging for non-native speakers or have distinct Canadian pronunciation.

Text to analyze: "${text}"

For each identified word that needs attention, provide:
1. The correct Canadian pronunciation (using simple phonetic spelling)
2. Common pronunciation mistakes
3. Tips for improvement
4. A confidence score for how likely this word needs attention

Return ONLY a JSON array of pronunciation feedback objects with this exact structure:
{
  "feedback": [
    {
      "word": "about",
      "canadianPronunciation": "uh-BOWT",
      "userPronunciation": "a-BAUT",
      "confidence": 0.85,
      "tips": [
        "Emphasize the 'ow' sound in 'bout'",
        "Avoid the American 'ow' sound"
      ]
    }
  ]
}

Focus on these Canadian English characteristics:
- "About" pronounced as "uh-bowt" (not "a-baut")
- "Sorry" pronounced as "sore-ee" (not "sahr-ee")
- "Process" pronounced as "PRO-cess" (not "PRAH-cess")
- Emphasis on proper syllables
- Distinct Canadian vowel sounds

Return ONLY the JSON object with no additional text or explanation.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = result.response;
        const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        try {
            const analysis = JSON.parse(analysisText);

            // Validate the analysis object has the correct structure
            if (!Array.isArray(analysis.feedback)) {
                throw new Error('Invalid analysis format');
            }

            // Validate each feedback item
            analysis.feedback = analysis.feedback.map((item: any) => ({
                word: String(item.word || ''),
                canadianPronunciation: String(item.canadianPronunciation || ''),
                userPronunciation: String(item.userPronunciation || ''),
                confidence: Number(item.confidence) || 0,
                tips: Array.isArray(item.tips) ? item.tips.map(String) : []
            }));

            return NextResponse.json(analysis);

        } catch (error) {
            console.error('Error parsing pronunciation analysis:', error);
            return NextResponse.json({ error: 'Failed to analyze pronunciation' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in pronunciation analysis:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 