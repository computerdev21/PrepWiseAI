import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UserProfile } from '@/lib/types';
import { auth, db } from '@/lib/firebase-admin';
import { ERROR_MESSAGES } from '@/lib/constants';

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

        const data = await request.json();
        const {
            countryOfOrigin,
            targetRole,
            yearsOfExperience,
            socialLinks,
            skills,
            goals,
            achievements
        } = data;

        // Validate required fields
        if (!countryOfOrigin || !targetRole || !yearsOfExperience) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Create or update user profile
        const profileData: UserProfile = {
            userId,
            countryOfOrigin,
            targetRole,
            yearsOfExperience,
            updatedAt: new Date(),
            // Optional fields
            socialLinks: socialLinks || {},
            skills: Array.isArray(skills) ? skills : [],
            goals: Array.isArray(goals) ? goals : [],
            achievements: Array.isArray(achievements) ? achievements : []
        };

        await db.collection('userProfile').doc(userId).set(profileData, { merge: true });

        return NextResponse.json<ApiResponse<UserProfile>>({
            success: true,
            data: profileData,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to update profile'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: ERROR_MESSAGES.AUTH.DEFAULT
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user profile
        const profileDoc = await db.collection('userProfile').doc(userId).get();

        if (!profileDoc.exists) {
            // Return empty profile with default values if not found
            const emptyProfile: UserProfile = {
                userId,
                countryOfOrigin: '',
                targetRole: '',
                yearsOfExperience: '',
                updatedAt: new Date(),
                socialLinks: {},
                skills: [],
                goals: [],
                achievements: []
            };

            return NextResponse.json<ApiResponse<UserProfile>>({
                success: true,
                data: emptyProfile
            });
        }

        const profile = profileDoc.data() as UserProfile;

        return NextResponse.json<ApiResponse<UserProfile>>({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: ERROR_MESSAGES.FIRESTORE.DEFAULT
        }, { status: 500 });
    }
} 