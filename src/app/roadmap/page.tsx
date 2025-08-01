'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    BookOpenIcon,
    GlobeAltIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    SparklesIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { profileService } from '@/lib/services/profileService';
import { UserProfile, Analysis } from '@/lib/types';
import { analysisService } from '@/lib/services/analysisService';
import { ResumeListResponse, resumeService } from '@/lib/services/resumeService';

interface RoadmapItem {
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

interface RoadmapResponse {
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

const initialProfile: UserProfile = {
    userId: '',
    countryOfOrigin: '',
    targetRole: '',
    yearsOfExperience: '',
    updatedAt: new Date(),
    socialLinks: {},
    skills: [],
    achievements: [],
    goals: []
};

export default function RoadmapPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapResponse['data'] | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
    const [resumes, setResumes] = useState<ResumeListResponse['data']>([]);
    const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});

    const [userInput, setUserInput] = useState({
        targetRole: '',
        currentSkills: '',
        preferredLanguage: 'English',
        timeline: '6-12 months',
        budget: 'moderate'
    });

    const fetchUserProfile = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await profileService.getProfile(token);
            if (response.success && response.data) {
                setUserProfile(response.data);
                setUserInput({
                    targetRole: response.data.targetRole,
                    currentSkills: response.data.skills.join(', '),
                    preferredLanguage: 'English',
                    timeline: '6-12 months',
                    budget: 'moderate'
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchResumes = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const result = await resumeService.listResumes(token);
            if (result.success && result.data) {
                setResumes(result.data);
                fetchAnalysesForResumes(token, result.data);
            }
        } catch (error) {
            console.error('Error fetching resume with analysis:', error);
        }
    };

    const fetchAnalysesForResumes = async (token: string, resumes: any[]) => {
        try {
            const response = await analysisService.getAnalysisList(token);
            if (response.success) {
                const analysisMap = response.data.reduce((acc: Record<string, Analysis>, analysis: Analysis) => {
                    acc[analysis.resumeId] = analysis;
                    return acc;
                }, {});
                setAnalyses(analysisMap);
            }
        } catch (error) {
            console.error('Error fetching analyses:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchResumes();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const generateRoadmap = async () => {
        if (!userInput.targetRole.trim()) {
            toast.error('Please enter your target role');
            return;
        }

        setIsGenerating(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.uid,
                    userInput,
                    userProfile: {
                        countryOfOrigin: userProfile.countryOfOrigin,
                        targetRole: userProfile.targetRole,
                        yearsOfExperience: userProfile.yearsOfExperience
                    }
                })
            });

            const result: RoadmapResponse = await response.json();

            if (result.success && result.data) {
                setRoadmap(result.data);
                toast.success('Your personalized roadmap has been generated!');
            } else {
                toast.error(result.error || 'Failed to generate roadmap');
            }
        } catch (error) {
            console.error('Error generating roadmap:', error);
            toast.error('Failed to generate roadmap. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalysisSelect = (analysisId: string) => {
        setSelectedAnalysisId(analysisId);
        const selectedAnalysis = analyses[analysisId];

        if (selectedAnalysis?.profileResults?.skills) {
            const skillsText = selectedAnalysis.profileResults.skills
                .map(skill => `${skill.name} (${skill.level})`)
                .join(', ');

            const recommendations = selectedAnalysis.profileResults.recommendations.map(recommendation => recommendation.description).join(', ') || '';
            const technicalSkills = selectedAnalysis.technicalResults?.technicalSkills.map(skill => skill.name).join(', ') || '';
            const certifications = selectedAnalysis.technicalResults?.certifications.map(cert => cert.name).join(', ') || '';
            const education = selectedAnalysis.profileResults?.education.map(edu => edu.degree).join(', ') || '';
            const experience = selectedAnalysis.profileResults?.experience.map(exp => exp.role).join(', ') || '';
            const hiddenSkills = selectedAnalysis.ahaResults?.hiddenSkills.map(skill => skill.originalSkill.name).join(', ') || '';

            setUserInput(prev => ({
                ...prev,
                currentSkills: `
                    Skills: ${skillsText}
                    Hidden Skills: ${hiddenSkills}
                    Technical Skills: ${technicalSkills}
                    Certifications: ${certifications}
                    Education: ${education}
                    Experience: ${experience}
                    Recommendations: ${recommendations}
                `
            }));

            toast.success('Skills loaded from analysis!');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'course': return <AcademicCapIcon className="w-5 h-5" />;
            case 'certification': return <BookOpenIcon className="w-5 h-5" />;
            case 'mentorship': return <BriefcaseIcon className="w-5 h-5" />;
            case 'internship': return <GlobeAltIcon className="w-5 h-5" />;
            case 'exam': return <CheckCircleIcon className="w-5 h-5" />;
            default: return <MapIcon className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                            <MapIcon className="w-10 h-10 text-red-600" />
                            Personalized Roadmap & Resources
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get your AI-generated action plan with tailored courses, certifications, and opportunities to accelerate your career in Canada
                        </p>
                    </div>

                    {/* Input Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-blue-600" />
                            Build Your Roadmap
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Role *
                                </label>
                                <input
                                    type="text"
                                    value={userInput.targetRole}
                                    onChange={(e) => setUserInput({ ...userInput, targetRole: e.target.value })}
                                    placeholder="e.g., Software Engineer, Data Analyst"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Language
                                </label>
                                <select
                                    value={userInput.preferredLanguage}
                                    onChange={(e) => setUserInput({ ...userInput, preferredLanguage: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="English">English</option>
                                    <option value="French">French</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="Mandarin">Mandarin</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Punjabi">Punjabi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timeline Goal
                                </label>
                                <select
                                    value={userInput.timeline}
                                    onChange={(e) => setUserInput({ ...userInput, timeline: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="3-6 months">3-6 months</option>
                                    <option value="6-12 months">6-12 months</option>
                                    <option value="1-2 years">1-2 years</option>
                                    <option value="2+ years">2+ years</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Budget Range
                                </label>
                                <select
                                    value={userInput.budget}
                                    onChange={(e) => setUserInput({ ...userInput, budget: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="low">Low ($0-$500)</option>
                                    <option value="moderate">Moderate ($500-$2000)</option>
                                    <option value="high">High ($2000+)</option>
                                </select>
                            </div>
                        </div>

                        {/* Resume Analysis Selection */}
                        {resumes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Load Skills from Resume Analysis
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedAnalysisId}
                                        onChange={(e) => handleAnalysisSelect(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">Select a resume analysis...</option>
                                        {resumes.map((resume) => (
                                            <option key={resume.id} value={resume.id} disabled={!analyses[resume.id]}>
                                                {resume.fileName} - {analyses[resume.id]?.profileResults?.skills?.length || 0} skills
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            setSelectedAnalysisId('');
                                            setUserInput(prev => ({ ...prev, currentSkills: '' }));
                                        }}
                                        className="px-4 py-3 text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                {selectedAnalysisId && (
                                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Skills loaded from analysis
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Skills & Experience
                            </label>
                            <textarea
                                value={userInput.currentSkills}
                                onChange={(e) => setUserInput({ ...userInput, currentSkills: e.target.value })}
                                placeholder="Describe your current skills, experience, and any specific areas you want to improve..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={generateRoadmap}
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    Generating Your Roadmap...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-6 h-6" />
                                    Generate Personalized Roadmap
                                    <ArrowRightIcon className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Roadmap Results */}
                    {roadmap && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-8"
                        >
                            {/* Summary */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                    <MapIcon className="w-6 h-6 text-green-600" />
                                    Your Action Plan Summary
                                </h2>
                                <p className="text-gray-700 mb-4">{roadmap.summary}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>Timeline: {roadmap.estimatedTimeline}</span>
                                    </div>
                                    {roadmap.totalCost && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <span>Estimated Cost: {roadmap.totalCost}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-purple-600">
                                        <GlobeAltIcon className="w-4 h-4" />
                                        <span>Language: {roadmap.language}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Items */}
                            <div className="space-y-6">
                                {roadmap.roadmap.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${getPriorityColor(item.priority)}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getTypeIcon(item.type)}
                                                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                                {item.priority.toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-4">{item.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{item.duration}</span>
                                            </div>
                                            {item.cost && (
                                                <div className="text-sm text-gray-600">
                                                    Cost: {item.cost}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-600">
                                                Timeline: {item.timeline}
                                            </div>
                                        </div>

                                        {item.requirements && item.requirements.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {item.requirements.map((req, i) => (
                                                        <li key={i}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <h4 className="font-medium text-gray-800 mb-2">Benefits:</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {item.benefits.map((benefit, i) => (
                                                    <li key={i}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {item.link && (
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Learn More
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div >
    );
} 