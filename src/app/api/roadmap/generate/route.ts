import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

interface RoadmapRequest {
    userId: string;
    userInput: {
        targetRole: string;
        currentSkills: string;
        preferredLanguage: string;
        timeline: string;
        budget: string;
    };
    userProfile: {
        countryOfOrigin: string;
        targetRole: string;
        yearsOfExperience: number;
    };
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body: RoadmapRequest = await request.json();

        if (!body.userInput.targetRole) {
            return NextResponse.json({
                success: false,
                error: 'Target role is required'
            }, { status: 400 });
        }

        // Call the cloud-run service
        // Forward the request to Cloud Run
        const cloudRunUrl = process.env.RESUME_ANALYSIS_SERVICE_URL;
        if (!cloudRunUrl) {
            throw new Error('Resume analysis service URL not configured');
        }
        const response = await fetch(`${cloudRunUrl}/analyze/roadmap/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId,
                userInput: body.userInput,
                userProfile: body.userProfile
            })
        });

        if (!response.ok) {
            throw new Error(`Cloud Run service responded with status: ${response.status}`);
        }

        const result = await response.json();

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error generating roadmap:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate roadmap'
        }, { status: 500 });
    }
} 