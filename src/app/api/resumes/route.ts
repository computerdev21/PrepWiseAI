import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ResumeUpload } from '@/lib/types';
import { auth, db } from '@/lib/firebase-admin';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';
import { FIREBASE_ERRORS, ERROR_MESSAGES, FIREBASE } from '@/lib/constants';

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

        const resumesSnapshot = await db.collection('resumes')
            .where('userId', '==', userId)
            .orderBy('uploadDate', 'desc')
            .get();

        const resumes = resumesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json<ApiResponse<any>>({
            success: true,
            data: resumes
        });

    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: ERROR_MESSAGES.FIRESTORE.DEFAULT
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
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

        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume ID is required'
            }, { status: 400 });
        }

        const resumeDoc = await db.collection('resumes').doc(resumeId).get();

        if (!resumeDoc.exists) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: ERROR_MESSAGES.FIRESTORE[FIREBASE_ERRORS.FIRESTORE.DOCUMENT_NOT_FOUND]
            }, { status: 404 });
        }

        const resumeData = resumeDoc.data() as ResumeUpload;
        if (resumeData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: ERROR_MESSAGES.FIRESTORE[FIREBASE_ERRORS.FIRESTORE.PERMISSION_DENIED]
            }, { status: 403 });
        }

        try {
            // Delete file from storage
            const storageRef = ref(storage, `${FIREBASE.STORAGE.RESUME_PATH}/${userId}/${resumeData.fileName}`);
            await deleteObject(storageRef);
        } catch (storageError: any) {
            // If the file doesn't exist in storage, we still want to delete the document
            if (storageError?.code !== FIREBASE_ERRORS.STORAGE.OBJECT_NOT_FOUND) {
                throw storageError;
            }
            console.warn('File not found in storage, proceeding with document deletion');
        }

        // Delete document from Firestore
        await db.collection('resumes').doc(resumeId).delete();

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error: any) {
        console.error('Resume delete error:', error);
        const errorMessage = error?.code === FIREBASE_ERRORS.STORAGE.OBJECT_NOT_FOUND
            ? ERROR_MESSAGES.STORAGE[FIREBASE_ERRORS.STORAGE.OBJECT_NOT_FOUND]
            : ERROR_MESSAGES.STORAGE.DEFAULT;

        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
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

        const { resumeId } = await request.json();
        if (!resumeId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Resume ID is required'
            }, { status: 400 });
        }

        const batch = db.batch();
        const activeResumes = await db.collection('resumes')
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();

        activeResumes.forEach(doc => {
            batch.update(doc.ref, { isActive: false });
        });

        // Then set the selected resume as active
        const resumeRef = db.collection('resumes').doc(resumeId);
        batch.update(resumeRef, { isActive: true });

        await batch.commit();

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: 'Resume set as active successfully'
        });

    } catch (error) {
        console.error('Resume update error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: ERROR_MESSAGES.FIRESTORE.DEFAULT
        }, { status: 500 });
    }
} 