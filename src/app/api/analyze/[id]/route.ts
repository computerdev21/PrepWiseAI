import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Analysis } from '@/lib/types';
import { auth, db } from '@/lib/firebase-admin';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const analysisDoc = await db.collection('analysis').doc(params.id).get();
        if (!analysisDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Analysis not found'
            }, { status: 404 });
        }

        const analysis = analysisDoc.data() as Analysis;
        if (analysis.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        return NextResponse.json<ApiResponse<Analysis>>({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { results } = await request.json();
        if (!results) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Results are required'
            }, { status: 400 });
        }

        const analysisDoc = await db.collection('analysis').doc(params.id).get();
        if (!analysisDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Analysis not found'
            }, { status: 404 });
        }

        const analysis = analysisDoc.data() as Analysis;
        if (analysis.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Update analysis with results
        await db.collection('analysis').doc(params.id).update({
            status: 'completed',
            profileResults: results.profileResults,
            technicalResults: results.technicalResults,
            ahaResults: results.ahaResults,
            completedAt: new Date()
        });

        return NextResponse.json<ApiResponse<Analysis>>({
            success: true,
            data: {
                ...analysis,
                status: 'completed',
                profileResults: results.profileResults,
                technicalResults: results.technicalResults,
                ahaResults: results.ahaResults,
                completedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error updating analysis:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const analysisDoc = await db.collection('analysis').doc(params.id).get();
        if (!analysisDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Analysis not found'
            }, { status: 404 });
        }

        const analysis = analysisDoc.data() as Analysis;
        if (analysis.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        await db.collection('analysis').doc(params.id).delete();

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: 'Analysis deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting analysis:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
} 