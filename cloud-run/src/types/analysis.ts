export interface AnalysisRequest {
    userId: string;
    resumeId: string;
    resumeText: string;
    userData?: any;
}

export interface AnalysisResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface BaseAnalysisResult {
    component: string;
    timestamp: Date;
}

interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    confidence: number;
}

interface Experience {
    role: string;
    company: string;
    duration: number;
    highlights: string[];
}

interface Education {
    degree: string;
    institution: string;
    year: number | null;
    country: string;
    accreditation: 'recognized' | 'unrecognized' | 'pending_verification';
    credibilityScore: number;
    recognitionStatus: 'fully_recognized' | 'partially_recognized' | 'requires_assessment' | 'not_recognized';
    gapAnalysis: {
        missingRequirements: string[];
        additionalSteps: string[];
        estimatedTimeToEquivalency: number;
        licensingExamsRequired: string[];
    };
    equivalency: {
        localEquivalent: string;
        coveragePercentage: number;
        recognizingBodies: string[];
    };
}

interface Recommendation {
    type: 'skill' | 'certification' | 'experience' | 'education_upgrade';
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: 'immediate' | 'short_term' | 'long_term';
    actionable: boolean;
    timeframe: '1-3 months' | '3-6 months' | '6-12 months' | '1+ years';
}

export interface ProfileAnalysis {
    skills: Skill[];
    experience: Experience[];
    education: Education[];
    recommendations: Recommendation[];
}

interface TechnicalSkill {
    name: string;
    category: 'programming' | 'database' | 'cloud' | 'tool' | 'methodology' | 'monitoring' | 'framework';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    lastUsed: number;
    context: string[];
}

interface TechnicalProject {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    impact: string[];
}

interface Certification {
    name: string;
    issuer: string;
    year: number;
    relevance: 'high' | 'medium' | 'low';
}

interface SkillGap {
    skillGap: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
}

export interface TechnicalSkillsAnalysis {
    technicalSkills: TechnicalSkill[];
    technicalProjects: TechnicalProject[];
    certifications: Certification[];
    recommendations: SkillGap[];
}

export interface SoftSkillsAnalysis extends BaseAnalysisResult {
    skills: {
        category: string;
        skills: string[];
        evidence: string[];
    }[];
}

export interface ExperienceAnalysis extends BaseAnalysisResult {
    positions: {
        role: string;
        company: string;
        duration: number;
        highlights: string[];
        impact: string[];
    }[];
}

export interface EducationAnalysis extends BaseAnalysisResult {
    degrees: {
        degree: string;
        institution: string;
        year: number;
        field: string;
    }[];
    certifications: {
        name: string;
        issuer: string;
        year: number;
    }[];
}

export interface DomainExpertiseAnalysis extends BaseAnalysisResult {
    industries: {
        name: string;
        level: string;
        years: number;
    }[];
    specializations: string[];
    toolsAndPlatforms: string[];
}

export interface MatchingAttributesAnalysis extends BaseAnalysisResult {
    preferences: {
        workStyle: string[];
        companySize: string[];
        industry: string[];
        location: string[];
        roleType: string[];
    };
}

export interface RecommendationsAnalysis extends BaseAnalysisResult {
    recommendations: {
        type: 'skill' | 'certification' | 'experience';
        description: string;
        priority: 'high' | 'medium' | 'low';
        rationale: string;
    }[];
}

export interface CareerTrajectoryAnalysis extends BaseAnalysisResult {
    currentLevel: string;
    potentialPaths: {
        role: string;
        timeframe: string;
        requiredSkills: string[];
        suggestedSteps: string[];
    }[];
}

export interface CompatibilityScoresAnalysis extends BaseAnalysisResult {
    scores: {
        startupFit: number;
        enterpriseFit: number;
        consultingFit: number;
        productFit: number;
        researchFit: number;
    };
    rationale: {
        strengths: string[];
        challenges: string[];
    };
}

export interface AhaAnalysis {
    hiddenSkills: Array<{
        originalSkill: {
            name: string;
            context: string;
            location: string;
        };
        equivalentSkill: {
            name: string;
            market: string;
            confidence: number;
            description: string;
        };
        potentialRoles: string[];
        marketValue: {
            salary: {
                min: number;
                max: number;
                currency: string;
            };
            demandLevel: 'high' | 'medium' | 'low';
        };
    }>;
    insightSummary: string;
} 