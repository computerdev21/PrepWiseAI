'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BookOpenIcon,
    CursorArrowRaysIcon,
    StarIcon,
    MapPinIcon,
    BriefcaseIcon,
    ExclamationCircleIcon,
    AcademicCapIcon,
    CommandLineIcon,
    ServerIcon,
    CloudIcon,
    WrenchScrewdriverIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Analysis } from '@/lib/types';
import { analysisService } from '@/lib/services/analysisService';
import SkillsComparison from './SkillsComparison';
import { useAuth } from '@/lib/auth/AuthContext';
import toast from 'react-hot-toast';
import AhaMoments from './AhaMoments';

interface AnalysisResultsProps {
    analysisId: string;
}

const AnalysisResults = ({ analysisId }: AnalysisResultsProps) => {
    const router = useRouter();
    const { user } = useAuth();
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!user) return;

            try {
                const token = await user.getIdToken();
                const response = await analysisService.getAnalysis(token, analysisId);

                if (response.success) {
                    setAnalysis(response.data);
                } else {
                    setError(response.error || 'Failed to fetch analysis');
                    toast.error('Failed to fetch analysis results');
                }
            } catch (error) {
                console.error('Error fetching analysis:', error);
                setError('An error occurred while fetching the analysis');
                toast.error('Failed to load analysis results');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [analysisId, user]);

    const handleViewJobs = () => {
        router.push(`/jobs/${analysisId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full"
                />
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis not found</h2>
                    <p className="text-gray-600 mb-8">{error || 'Please try uploading your resume again.'}</p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Upload New Resume
                    </button>
                </div>
            </div>
        );
    }

    if (analysis.status === 'processing' || analysis.status === 'pending') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full mx-auto mb-6"
                    />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis in Progress</h2>
                    <p className="text-gray-600">Please wait while we analyze your resume...</p>
                </div>
            </div>
        );
    }

    if (analysis.status === 'failed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Failed</h2>
                    <p className="text-gray-600 mb-8">{analysis.error || 'An error occurred during analysis. Please try again.'}</p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { profileResults } = analysis;
    if (!profileResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Results Available</h2>
                    <p className="text-gray-600 mb-8">Analysis completed but no results were generated.</p>
                    <button
                        onClick={() => router.push('/upload')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
            <div className="container mx-auto px-6 pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Analysis Complete!
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Your profile has been successfully analyzed
                        </motion.p>
                    </div>

                    {/* Aha Moments Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-12"
                    >
                        <AhaMoments analysis={analysis} />
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <BookOpenIcon className="w-6 h-6 text-green-600" />
                            Recommendations
                        </h2>

                        <div className="space-y-4">
                            {profileResults.recommendations.map((rec, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.6 + index * 0.1 }}
                                    className={`flex items-start gap-4 p-4 rounded-lg ${rec.priority === 'high'
                                        ? 'bg-red-50'
                                        : rec.priority === 'medium'
                                            ? 'bg-yellow-50'
                                            : 'bg-green-50'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 ${rec.priority === 'high'
                                        ? 'bg-red-500'
                                        : rec.priority === 'medium'
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-gray-700 mb-2">{rec.description}</p>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className={`text-xs px-2 py-1 rounded ${rec.type === 'education_upgrade'
                                                ? 'bg-purple-100 text-purple-700'
                                                : rec.type === 'certification'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : rec.type === 'experience'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {rec.type.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${rec.priority === 'high'
                                                ? 'bg-red-100 text-red-700'
                                                : rec.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {rec.priority}
                                            </span>
                                            {rec.category && (
                                                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                                    {rec.category.replace('_', ' ')}
                                                </span>
                                            )}
                                            {rec.actionable && (
                                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                                                    Actionable
                                                </span>
                                            )}
                                            {rec.timeframe && (
                                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                    {rec.timeframe}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Skills Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <StarIcon className="w-6 h-6 text-yellow-600" />
                            Skills
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profileResults.skills.map((skill, index) => (
                                <motion.div
                                    key={skill.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Level: {skill.level}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        {Math.round(skill.confidence * 100)}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Technical Skills Analysis */}
                    {analysis.technicalResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <CommandLineIcon className="w-6 h-6 text-indigo-600" />
                                Technical Analysis
                            </h2>

                            {/* Technical Skills by Category */}
                            {analysis.technicalResults.technicalSkills && (
                                <div className="space-y-8">
                                    {/* Database Skills */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ServerIcon className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-700">Database Technologies</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysis.technicalResults.technicalSkills
                                                .filter(skill => skill.category === 'database')
                                                .map((skill, index) => (
                                                    <div
                                                        key={skill.name}
                                                        className="p-4 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-gray-800">{skill.name}</h4>
                                                            <span className={`text-sm px-2 py-1 rounded ${skill.level === 'expert'
                                                                ? 'bg-green-100 text-green-700'
                                                                : skill.level === 'advanced'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {skill.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {skill.yearsOfExperience} years • Last used: {skill.lastUsed}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skill.context.map((ctx, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                                >
                                                                    {ctx}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Cloud Skills */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CloudIcon className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-700">Cloud & Infrastructure</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysis.technicalResults.technicalSkills
                                                .filter(skill => skill.category === 'cloud')
                                                .map((skill, index) => (
                                                    <div
                                                        key={skill.name}
                                                        className="p-4 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-gray-800">{skill.name}</h4>
                                                            <span className={`text-sm px-2 py-1 rounded ${skill.level === 'expert'
                                                                ? 'bg-green-100 text-green-700'
                                                                : skill.level === 'advanced'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {skill.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {skill.yearsOfExperience} years • Last used: {skill.lastUsed}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skill.context.map((ctx, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                                >
                                                                    {ctx}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Programming Skills */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CommandLineIcon className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-700">Programming & Development</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysis.technicalResults.technicalSkills
                                                .filter(skill => skill.category === 'programming')
                                                .map((skill, index) => (
                                                    <div
                                                        key={skill.name}
                                                        className="p-4 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-gray-800">{skill.name}</h4>
                                                            <span className={`text-sm px-2 py-1 rounded ${skill.level === 'expert'
                                                                ? 'bg-green-100 text-green-700'
                                                                : skill.level === 'advanced'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {skill.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {skill.yearsOfExperience} years • Last used: {skill.lastUsed}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skill.context.map((ctx, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                                >
                                                                    {ctx}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Tools & Methodologies */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-700">Tools & Methodologies</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {analysis.technicalResults.technicalSkills
                                                .filter(skill => ['tool', 'methodology', 'monitoring'].includes(skill.category))
                                                .map((skill, index) => (
                                                    <div
                                                        key={skill.name}
                                                        className="p-4 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-gray-800">{skill.name}</h4>
                                                            <span className={`text-sm px-2 py-1 rounded ${skill.level === 'expert'
                                                                ? 'bg-green-100 text-green-700'
                                                                : skill.level === 'advanced'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {skill.level}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {skill.yearsOfExperience} years • Last used: {skill.lastUsed}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skill.context.map((ctx, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                                >
                                                                    {ctx}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Technical Projects */}
                            {analysis.technicalResults.technicalProjects && (
                                <div className="mt-12">
                                    <div className="flex items-center gap-2 mb-6">
                                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-700">Key Technical Projects</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {analysis.technicalResults.technicalProjects.map((project, index) => (
                                            <div
                                                key={project.name}
                                                className="p-6 bg-gray-50 rounded-lg"
                                            >
                                                <h4 className="font-semibold text-gray-800 text-lg mb-2">{project.name}</h4>
                                                <p className="text-gray-600 mb-3">{project.description}</p>
                                                <p className="text-sm text-gray-700 mb-3">Role: {project.role}</p>

                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Technologies Used:</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.technologies.map((tech, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Impact:</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {project.impact.map((impact, i) => (
                                                            <li key={i} className="text-sm text-gray-600">{impact}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Experience Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                            Experience
                        </h2>

                        <div className="space-y-6">
                            {profileResults.experience.map((exp, index) => (
                                <motion.div
                                    key={`${exp.company}-${exp.role}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + index * 0.1 }}
                                    className="p-6 bg-gray-50 rounded-lg"
                                >
                                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{exp.role}</h3>
                                    <p className="text-gray-600 mb-3">{exp.company} • {exp.duration} Months</p>
                                    <ul className="list-disc list-inside space-y-2">
                                        {exp.highlights.map((highlight, i) => (
                                            <li key={i} className="text-gray-700">{highlight}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Education Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                            Education
                        </h2>

                        <div className="space-y-6">
                            {profileResults.education.map((edu, index) => (
                                <motion.div
                                    key={`${edu.institution}-${edu.degree}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.4 + index * 0.1 }}
                                    className="p-6 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg mb-1">{edu.degree}</h3>
                                            <p className="text-gray-600">{edu.institution}</p>
                                            {edu.country && (
                                                <p className="text-sm text-gray-500">Country: {edu.country}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-500">{edu.year}</span>
                                            {edu.credibilityScore && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Credibility: {Math.round(edu.credibilityScore * 100)}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Accreditation and Recognition Status */}
                                    {(edu.accreditation || edu.recognitionStatus) && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {edu.accreditation && (
                                                <span className={`text-xs px-2 py-1 rounded ${edu.accreditation === 'recognized'
                                                    ? 'bg-green-100 text-green-700'
                                                    : edu.accreditation === 'pending_verification'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {edu.accreditation.replace('_', ' ')}
                                                </span>
                                            )}
                                            {edu.recognitionStatus && (
                                                <span className={`text-xs px-2 py-1 rounded ${edu.recognitionStatus === 'fully_recognized'
                                                    ? 'bg-green-100 text-green-700'
                                                    : edu.recognitionStatus === 'partially_recognized'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : edu.recognitionStatus === 'requires_assessment'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {edu.recognitionStatus.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Equivalency Information */}
                                    {edu.equivalency && (
                                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-blue-800 mb-2">Equivalency Analysis</h4>
                                            <p className="text-sm text-blue-700 mb-1">
                                                <span className="font-medium">Local Equivalent:</span> {edu.equivalency.localEquivalent}
                                            </p>
                                            <p className="text-sm text-blue-700 mb-1">
                                                <span className="font-medium">Coverage:</span> {edu.equivalency.coveragePercentage}%
                                            </p>
                                            {edu.equivalency.recognizingBodies.length > 0 && (
                                                <div className="text-sm text-blue-700">
                                                    <span className="font-medium">Recognizing Bodies:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {edu.equivalency.recognizingBodies.map((body, i) => (
                                                            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {body}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Gap Analysis */}
                                    {edu.gapAnalysis && (
                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                            <h4 className="font-medium text-yellow-800 mb-2">Gap Analysis</h4>
                                            {edu.gapAnalysis.missingRequirements.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-yellow-700 mb-1">Missing Requirements:</p>
                                                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                                                        {edu.gapAnalysis.missingRequirements.map((req, i) => (
                                                            <li key={i}>{req}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {edu.gapAnalysis.additionalSteps.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-yellow-700 mb-1">Additional Steps:</p>
                                                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                                                        {edu.gapAnalysis.additionalSteps.map((step, i) => (
                                                            <li key={i}>{step}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {edu.gapAnalysis.estimatedTimeToEquivalency > 0 && (
                                                <p className="text-sm text-yellow-700">
                                                    <span className="font-medium">Estimated Time to Equivalency:</span> {edu.gapAnalysis.estimatedTimeToEquivalency} months
                                                </p>
                                            )}
                                            {edu.gapAnalysis.licensingExamsRequired.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium text-yellow-700 mb-1">Licensing Exams Required:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {edu.gapAnalysis.licensingExamsRequired.map((exam, i) => (
                                                            <span key={i} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                {exam}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>



                    {/* CTA */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                        className="text-center"
                    >
                        <button
                            onClick={handleViewJobs}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                        >
                            <BriefcaseIcon className="w-5 h-5" />
                            View Job Matches
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                        <p className="text-gray-600 mt-4">
                            Discover opportunities that match your profile
                        </p>
                    </motion.div> */}
                </motion.div>
            </div>
        </div>
    );
};

export default AnalysisResults;
