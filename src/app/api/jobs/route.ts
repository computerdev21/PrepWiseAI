import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Job, JobMatch } from '@/lib/types';
import { JOB } from '@/lib/constants';

// Mock Canadian job data
const mockJobs: Job[] = [
    {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'Shopify',
        location: 'Toronto, ON',
        salary: { min: 120000, max: 180000, currency: JOB.CURRENCY },
        description: 'Join our team to build scalable e-commerce solutions that power millions of businesses worldwide.',
        requirements: ['5+ years experience', 'React/Node.js', 'Cloud platforms', 'Agile methodology'],
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Agile'],
        matchPercentage: 92,
        applicationUrl: 'https://shopify.com/careers',
        postedDate: new Date('2024-01-15'),
        source: 'LINKEDIN'
    },
    {
        id: '2',
        title: 'Data Scientist',
        company: 'RBC',
        location: 'Toronto, ON',
        salary: { min: 100000, max: 150000, currency: JOB.CURRENCY },
        description: 'Help us leverage data to drive business decisions and create innovative financial solutions.',
        requirements: ['3+ years experience', 'Python/R', 'Machine Learning', 'SQL'],
        skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Statistics'],
        matchPercentage: 88,
        applicationUrl: 'https://jobs.rbc.com',
        postedDate: new Date('2024-01-10'),
        source: 'INDEED'
    },
    {
        id: '3',
        title: 'Product Manager',
        company: 'Google',
        location: 'Waterloo, ON',
        salary: { min: 140000, max: 200000, currency: JOB.CURRENCY },
        description: 'Lead product strategy and development for next-generation AI-powered applications.',
        requirements: ['5+ years PM experience', 'Technical background', 'User research', 'Analytics'],
        skills: ['Product Management', 'User Research', 'Analytics', 'Technical Skills'],
        matchPercentage: 85,
        applicationUrl: 'https://careers.google.com',
        postedDate: new Date('2024-01-12'),
        source: 'LINKEDIN'
    },
    {
        id: '4',
        title: 'DevOps Engineer',
        company: 'Amazon',
        location: 'Vancouver, BC',
        salary: { min: 110000, max: 160000, currency: JOB.CURRENCY },
        description: 'Build and maintain cloud infrastructure for high-scale applications.',
        requirements: ['3+ years DevOps', 'AWS/Azure', 'Docker/Kubernetes', 'CI/CD'],
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        matchPercentage: 78,
        applicationUrl: 'https://amazon.jobs',
        postedDate: new Date('2024-01-08'),
        source: 'GLASSDOOR'
    },
    {
        id: '5',
        title: 'UX Designer',
        company: 'Microsoft',
        location: 'Toronto, ON',
        salary: { min: 90000, max: 130000, currency: JOB.CURRENCY },
        description: 'Create intuitive user experiences for enterprise software solutions.',
        requirements: ['3+ years UX design', 'Figma/Sketch', 'User research', 'Prototyping'],
        skills: ['UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
        matchPercentage: 82,
        applicationUrl: 'https://careers.microsoft.com',
        postedDate: new Date('2024-01-14'),
        source: 'LINKEDIN'
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get('analysisId');
        const skills = searchParams.get('skills')?.split(',') || [];

        // Filter jobs based on skills match
        const filteredJobs = mockJobs.map(job => {
            const matchingSkills = job.skills.filter(skill =>
                skills.some(userSkill =>
                    userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(userSkill.toLowerCase())
                )
            );

            const matchPercentage = Math.min(95, Math.max(60,
                (matchingSkills.length / job.skills.length) * 100 + Math.random() * 20
            ));

            return {
                ...job,
                matchPercentage: Math.round(matchPercentage)
            };
        }).sort((a, b) => b.matchPercentage - a.matchPercentage);

        const topMatches = filteredJobs.slice(0, 3);
        const averageMatchScore = filteredJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / filteredJobs.length;

        const jobMatch: JobMatch = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            analysisId: analysisId || '',
            jobs: filteredJobs,
            topMatches,
            averageMatchScore: Math.round(averageMatchScore),
            createdAt: new Date()
        };

        return NextResponse.json<ApiResponse<JobMatch>>({
            success: true,
            data: jobMatch,
            message: 'Job matches found successfully'
        });

    } catch (error) {
        console.error('Jobs error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch job matches'
        }, { status: 500 });
    }
}
