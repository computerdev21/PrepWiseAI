import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { ApiResponse } from '@/lib/types';
import { DocumentParserService } from '@/lib/services/documentParserService';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await auth.verifyIdToken(token);

        // Get request body
        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume ID is required'
            }, { status: 400 });
        }

        // Process the document
        await DocumentParserService.processDocument(resumeId);

        return NextResponse.json<ApiResponse<{ message: string }>>({
            success: true,
            data: {
                message: 'Document processed successfully'
            }
        });

    } catch (error) {
        console.error('Error parsing document:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse document'
        }, { status: 500 });
    }
} 