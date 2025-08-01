# AI Career Coach - Setup Guide

## Overview
The AI Career Coach is a conversational chatbot system that helps newcomers to Canada with:
- **Resume Review**: AI-powered resume improvement suggestions
- **Interview Preparation**: Mock interviews and feedback
- **Career Guidance**: Canadian job market navigation and career development

## Key Features

### 🎯 Three Coaching Modes
1. **Resume Review Coach**
   - Analyzes existing resume analysis data
   - Provides specific improvement suggestions
   - Focuses on Canadian resume standards
   - Emphasizes transferable skills

2. **Interview Preparation Coach**
   - Conducts mock interviews
   - Provides feedback on responses
   - Explains Canadian workplace culture
   - Practices behavioral questions

3. **Career Guidance Coach**
   - Canadian job market insights
   - Career path exploration
   - Skill development recommendations
   - Networking strategies

### 🌍 Multi-Language Support
- English, French, Spanish, Mandarin, Hindi, Punjabi
- Seamless language switching
- Culturally appropriate responses

### 🤖 Smart AI Responses
- **Concise & Structured**: Responses under 150 words with clear bullet points
- **Context-Aware**: Asks clarifying questions to understand user background
- **Actionable**: Provides specific next steps and recommendations
- **Personalized**: Uses resume analysis data for tailored advice

### 📋 Response Structure
Each AI response follows a consistent format:
1. **Brief acknowledgment** (1 sentence)
2. **2-3 specific suggestions** (bullet points)
3. **1-2 clarifying questions** (to gather context)
4. **Next step recommendation** (actionable guidance)

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Cloud Run Service URL
RESUME_ANALYSIS_SERVICE_URL=http://localhost:8080

# Google Cloud Service Account
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### 2. Google Cloud Setup
1. Enable Vertex AI API in your Google Cloud project
2. Create a service account with Vertex AI permissions
3. Download the service account key JSON file
4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### 3. Dependencies
The required packages are already included:
- `@google-cloud/vertexai` - For AI model integration
- `framer-motion` - For animations
- `react-hot-toast` - For notifications

## Usage

### For Users
1. Navigate to `/coach` in the application
2. Select your preferred coaching mode
3. Choose your language
4. Optionally select a resume analysis for context
5. Start chatting with the AI coach

### For Developers
The system is built with:
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Vertex AI integration
- **Authentication**: Firebase Auth
- **Database**: Firestore (for session management)

## API Endpoints

### POST `/api/coach/chat`
Handles chat messages and generates AI responses.

**Request Body:**
```json
{
  "message": "string",
  "mode": "resume_review" | "interview_prep" | "career_guidance",
  "language": "string",
  "analysisId": "string (optional)",
  "conversationHistory": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "AI generated response"
  }
}
```

## Hackathon Ready Features

### ✅ Implemented
- Complete chat interface with real-time messaging
- Three distinct coaching modes with structured responses
- Multi-language support (6 languages)
- Integration with existing resume analysis
- Responsive design with animations
- Error handling and loading states
- Context-gathering system for personalized guidance

### 🚀 Quick Wins
- Easy to customize prompts for different coaching styles
- Scalable architecture for adding new languages
- Integration with existing user authentication
- Real-time conversation history
- Structured, actionable responses

### 🔧 Easy Customizations
- Modify system prompts in `/api/coach/chat/route.ts`
- Add new languages in the frontend component
- Customize UI themes and animations
- Extend with additional coaching modes
- Adjust response length and structure

## Response Quality Features

### 📝 Structured Responses
- Consistent format across all modes
- Bullet points for clarity
- Actionable recommendations
- Clear next steps

### 🎯 Context Gathering
- Asks relevant questions to understand user background
- Uses resume analysis data for personalized advice
- Adapts responses based on experience level
- Considers Canadian job market context

### 🌟 User Experience
- Concise responses (under 150 words)
- Encouraging and supportive tone
- Culturally appropriate guidance
- Real-time conversation flow

## Security & Privacy
- All conversations are processed securely through Google Cloud
- User authentication required for all interactions
- No conversation data is permanently stored (stateless)
- Environment variables for sensitive configuration

## Performance
- Optimized for real-time chat experience
- Efficient conversation history management (last 10 messages)
- Responsive design for all device sizes
- Fast AI response times with Vertex AI

## Future Enhancements
- Conversation persistence and history
- Voice input/output capabilities
- Integration with job matching system
- Advanced analytics and insights
- Multi-user coaching sessions 