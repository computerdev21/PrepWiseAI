# Resume Analysis Service

This Cloud Run service handles resume analysis using Google Cloud's Vertex AI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
GOOGLE_CLOUD_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

3. Set up Google Cloud authentication:
```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project your-project-id

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

## Development

Run locally:
```bash
npm run dev
```

## Deployment

Deploy to Cloud Run:
```bash
npm run deploy
```

## API Endpoints

### POST /analyze
Analyzes a resume and returns detailed insights.

Request:
```json
{
  "resumeId": "resume-document-id"
}
```

Headers:
```
Authorization: Bearer <firebase-auth-token>
```

### GET /analyses
Retrieves all analyses for the authenticated user.

Headers:
```
Authorization: Bearer <firebase-auth-token>
```

## Environment Variables

- `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID
- `VERTEX_AI_LOCATION`: Location for Vertex AI (default: us-central1)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON file

## Service Account Requirements

The service account needs the following roles:
- Cloud Run Invoker
- Vertex AI User
- Firebase Admin
- Firestore User 