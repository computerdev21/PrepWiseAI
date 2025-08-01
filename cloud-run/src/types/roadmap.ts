export interface RoadmapRequest {
    userId: string;
    userInput: {
        targetRole: string;
        currentSkills: string;
        preferredLanguage: string;
        timeline: string;
        budget: string;
    };
    userProfile: {
        countryOfOrigin: string;
        targetRole: string;
        yearsOfExperience: number;
    };
}

export interface RoadmapItem {
    id: string;
    type: 'course' | 'certification' | 'mentorship' | 'internship' | 'exam';
    title: string;
    description: string;
    duration: string;
    cost?: string;
    priority: 'high' | 'medium' | 'low';
    link?: string;
    requirements?: string[];
    benefits: string[];
    timeline: string;
}

export interface RoadmapResponse {
    success: boolean;
    data?: {
        roadmap: RoadmapItem[];
        summary: string;
        estimatedTimeline: string;
        totalCost?: string;
        language: string;
    };
    error?: string;
} 