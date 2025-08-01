# Getting Started with TalentUnlock

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Project with Vertex AI enabled
- Firebase project

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd talent-unlock
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hackthebrain-2025
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Vertex AI Configuration  
VERTEX_AI_PROJECT_ID=hackthebrain-2025
VERTEX_AI_LOCATION=northamerica-northeast1

# Credentials
GOOGLE_APPLICATION_CREDENTIALS=./key.json
```

4. **Google Cloud Setup**
- Enable Vertex AI API in your Google Cloud project
- Create a service account with Vertex AI permissions
- Download the service account key JSON file
- Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

5. **Firebase Setup**
- Create a new Firebase project
- Enable Authentication (Google Sign-in)
- Enable Firestore Database
- Enable Storage
- Add your web app and get configuration
- Update `.env.local` with your Firebase config

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Development Workflow

1. **Code Structure**
- `/app` - Next.js App Router (pages and API routes)
- `/components` - Reusable React components
- `/lib` - Utilities, services, and types
- `/hooks` - Custom React hooks

2. **Key Features**
- Resume upload and analysis
- AI-powered skills mapping
- Job matching
- Career roadmap generation
- AI career coaching

3. **Testing**
```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

4. **Building for Production**
```bash
# Create production build
npm run build

# Start production server
npm start
```

## Troubleshooting

Common issues and solutions:

1. **Firebase Authentication Issues**
- Ensure Firebase config is correct
- Check if Google Sign-in is enabled
- Verify domain is whitelisted

2. **Vertex AI Issues**
- Check service account permissions
- Verify API is enabled
- Ensure credentials file is accessible

3. **Upload Issues**
- Check Firebase Storage rules
- Verify file size limits
- Check CORS configuration 