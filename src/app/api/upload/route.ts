import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ResumeUpload } from '@/lib/types';
import { auth, storage } from '@/lib/firebase-admin';
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
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get the file from the request
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'No file provided'
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `resumes/${userId}/${timestamp}_${file.name}`;

        // Upload to Firebase Storage
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileRef = bucket.file(fileName);

        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type
            }
        });

        // Get download URL
        const [downloadUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500' // Long expiry for demo
        });

        // Create upload record in Firestore
        const uploadData: ResumeUpload = {
            id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            downloadUrl,
            uploadDate: new Date(),
            status: 'processing',
            processingStatus: 'processing',
            progress: 100,
            updatedAt: new Date()
        };

        const db = (await import('@/lib/firebase-admin')).db;
        await db.collection('resumes').doc(uploadData.id).set(uploadData);

        // Trigger document parsing in the background
        await DocumentParserService.processDocument(uploadData.id)

        return NextResponse.json<ApiResponse<ResumeUpload>>({
            success: true,
            data: uploadData,
            message: 'File uploaded successfully and processing started'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload file'
        }, { status: 500 });
    }
}
