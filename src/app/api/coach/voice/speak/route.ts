import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';

// Initialize the Text-to-Speech client
const textToSpeechClient = new TextToSpeechClient();

// Available Canadian English voices
// Using Wavenet voices for better quality
const CANADIAN_VOICES = {
    MALE: 'en-US-Standard-D',    // Male voice
    FEMALE: 'en-US-Standard-C',  // Female voice
};

export async function GET(req: NextRequest) {
    try {
        // Verify authentication
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await auth.verifyIdToken(token);

        // Get the word to pronounce from query parameters
        const word = req.nextUrl.searchParams.get('word');
        const accent = req.nextUrl.searchParams.get('accent');
        const gender = req.nextUrl.searchParams.get('gender') || 'MALE';

        if (!word) {
            return NextResponse.json({ error: 'No word provided' }, { status: 400 });
        }

        // Configure the voice for Canadian English
        const synthesisRequest: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
            input: { text: word },
            voice: {
                languageCode: 'en-CA',
                name: CANADIAN_VOICES[gender as keyof typeof CANADIAN_VOICES] || CANADIAN_VOICES.MALE,
                ssmlGender: gender === 'FEMALE' ? 'FEMALE' : 'MALE',
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: 0,
                speakingRate: 0.9, // Slightly slower for clearer pronunciation
                effectsProfileId: ['handset-class-device'], // Optimize for mobile/web playback
            },
        };

        // Generate the audio
        const [response] = await textToSpeechClient.synthesizeSpeech(synthesisRequest);
        const audioContent = response.audioContent as Buffer;

        // Return the audio as a response
        return new NextResponse(audioContent, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioContent.length.toString(),
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year since pronunciations don't change
            },
        });

    } catch (error) {
        console.error('Error in text-to-speech:', error);

        // If it's a voice not found error, try falling back to a US English voice
        if (error instanceof Error && error.message.includes('Voice') && error.message.includes('does not exist')) {
            try {
                const fallbackRequest: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
                    input: { text: req.nextUrl.searchParams.get('word') || '' },
                    voice: {
                        languageCode: 'en-US',
                        name: 'en-US-Wavenet-A', // Fallback to US English voice
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        pitch: 0,
                        speakingRate: 0.9,
                        effectsProfileId: ['handset-class-device'],
                    },
                };

                const [fallbackResponse] = await textToSpeechClient.synthesizeSpeech(fallbackRequest);
                const fallbackAudioContent = fallbackResponse.audioContent as Buffer;

                return new NextResponse(fallbackAudioContent, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': fallbackAudioContent.length.toString(),
                        'Cache-Control': 'public, max-age=31536000',
                    },
                });
            } catch (fallbackError) {
                console.error('Error in fallback text-to-speech:', fallbackError);
            }
        }

        return NextResponse.json({
            error: 'Failed to generate speech',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 