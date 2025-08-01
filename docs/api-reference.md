# API Reference

## Authentication

All API endpoints require authentication using Firebase Auth. Include the JWT token in the Authorization header:
```
Authorization: Bearer <firebase_jwt_token>
```

## Endpoints

### Resume Management

#### POST `/api/upload`
Upload a resume file.

**Request:**
```typescript
FormData: {
  file: File,
  userId?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    id: string,
    fileName: string,
    fileUrl: string,
    uploadedAt: Date,
    userId: string
  },
  message: string
}
```

#### POST `/api/analyze`
Analyze a resume using AI.

**Request:**
```typescript
{
  resumeId: string,
  userId?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    id: string,
    resumeId: string,
    profileResults: {
      skills: string[],
      experience: string[],
      education: string[],
      achievements: string[]
    },
    mappedSkills: {
      name: string,
      confidence: number,
      canadianEquivalent: string
    }[],
    status: 'completed' | 'processing' | 'failed',
    createdAt: Date
  },
  message: string
}
```

### Career Coaching

#### POST `/api/coach/chat`
Get AI career coaching responses.

**Request:**
```typescript
{
  message: string,
  mode: 'resume_review' | 'interview_prep' | 'career_guidance',
  language: string,
  analysisId?: string,
  conversationHistory: {
    role: 'user' | 'assistant',
    content: string
  }[]
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    response: string,
    suggestions?: string[],
    nextSteps?: string[]
  },
  message: string
}
```

### Job Matching

#### GET `/api/jobs`
Get job recommendations based on skills.

**Query Parameters:**
- `analysisId`: string
- `skills`: comma-separated string
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```typescript
{
  success: boolean,
  data: {
    jobs: {
      id: string,
      title: string,
      company: string,
      location: string,
      salary: {
        min: number,
        max: number,
        currency: string
      },
      skills: string[],
      matchPercentage: number,
      postedDate: Date,
      applicationUrl?: string
    }[],
    total: number,
    page: number,
    limit: number
  },
  message: string
}
```

### Career Roadmap

#### POST `/api/roadmap/generate`
Generate a career development roadmap.

**Request:**
```typescript
{
  targetRole: string,
  currentSkills: string[],
  timeline: string,
  budget: string,
  analysisId?: string
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    steps: {
      id: string,
      type: 'course' | 'certification' | 'mentorship' | 'internship' | 'exam',
      title: string,
      description: string,
      duration: string,
      cost?: string,
      priority: 'high' | 'medium' | 'low',
      link?: string,
      requirements?: string[],
      benefits: string[],
      timeline: string
    }[],
    estimatedCompletion: string,
    totalCost: string
  },
  message: string
}
```

### User Profile

#### GET `/api/profile`
Get user profile information.

**Response:**
```typescript
{
  success: boolean,
  data: {
    userId: string,
    countryOfOrigin: string,
    targetRole: string,
    yearsOfExperience: string,
    updatedAt: Date,
    socialLinks: Record<string, string>,
    skills: string[],
    achievements: string[],
    goals: string[]
  },
  message: string
}
```

#### PUT `/api/profile`
Update user profile information.

**Request:**
```typescript
{
  countryOfOrigin?: string,
  targetRole?: string,
  yearsOfExperience?: string,
  socialLinks?: Record<string, string>,
  skills?: string[],
  achievements?: string[],
  goals?: string[]
}
```

**Response:**
```typescript
{
  success: boolean,
  data: UserProfile,
  message: string
}
```

## Error Handling

All endpoints follow a consistent error response format:

```typescript
{
  success: false,
  error: string,
  message: string,
  code?: string
}
```

Common error codes:
- `auth/unauthorized`: Invalid or missing authentication
- `validation/invalid-input`: Invalid request parameters
- `resource/not-found`: Requested resource not found
- `service/unavailable`: External service unavailable
- `rate-limit/exceeded`: Rate limit exceeded 