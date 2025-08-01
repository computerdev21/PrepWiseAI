import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Get the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to Cloud Run
    const cloudRunUrl = process.env.RESUME_ANALYSIS_SERVICE_URL;
    if (!cloudRunUrl) {
      throw new Error('Resume analysis service URL not configured');
    }

    // Forward the request with the same body and auth header
    const response = await fetch(`${cloudRunUrl}/analyze/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(await request.json())
    });

    // Return the Cloud Run response
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in analysis:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get the auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Forward the request to Cloud Run
    const cloudRunUrl = process.env.RESUME_ANALYSIS_SERVICE_URL;
    if (!cloudRunUrl) {
      throw new Error('Resume analysis service URL not configured');
    }

    const analysisDoc = await db.collection('analysis')
      .where('userId', '==', userId)
      .get()

    if (!analysisDoc.docs.length) {
      return NextResponse.json({ success: false, message: 'Analysis not found' }, { status: 404 });
    }

    const analysis = analysisDoc.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: analysis });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
