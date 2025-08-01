'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    CodeBracketIcon,
    UsersIcon,
    GlobeAltIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import { Skill } from '@/lib/types';
import { ANALYSIS } from '@/lib/constants';

interface SkillsComparisonProps {
    originalSkills: Skill[];
    mappedSkills: Skill[];
    analysisId: string;
}

const SkillsComparison = ({ originalSkills, mappedSkills, analysisId }: SkillsComparisonProps) => {
    const router = useRouter();

    const handleViewJobs = () => {
        router.push(`/jobs/${analysisId}`);
    };

    const getCategoryIcon = (category: keyof typeof ANALYSIS.SKILL_CATEGORIES) => {
        switch (category) {
            case 'TECHNICAL':
                return <CodeBracketIcon className="w-4 h-4" />;
            case 'SOFT':
                return <UsersIcon className="w-4 h-4" />;
            case 'LANGUAGE':
                return <GlobeAltIcon className="w-4 h-4" />;
            case 'CERTIFICATION':
                return <TrophyIcon className="w-4 h-4" />;
            default:
                return <CodeBracketIcon className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: keyof typeof ANALYSIS.SKILL_CATEGORIES) => {
        switch (category) {
            case 'TECHNICAL':
                return 'bg-blue-100 text-blue-800';
            case 'SOFT':
                return 'bg-green-100 text-green-800';
            case 'LANGUAGE':
                return 'bg-purple-100 text-purple-800';
            case 'CERTIFICATION':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
                <ArrowTrendingUpIcon className="w-6 h-6 text-red-600" />
                Skills Transformation
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Original Skills */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Your International Experience
                    </h3>
                    <div className="space-y-4">
                        {originalSkills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category as keyof typeof ANALYSIS.SKILL_CATEGORIES)}`}>
                                        {skill.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {getCategoryIcon(skill.category as keyof typeof ANALYSIS.SKILL_CATEGORIES)}
                                    <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            className="bg-gray-400 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.relevanceScore * 100}%` }}
                                            transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Relevance: {Math.round(skill.relevanceScore * 100)}%
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mapped Skills */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                        Canadian Equivalents
                        <motion.button
                            onClick={handleViewJobs}
                            className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors duration-200 flex items-center gap-1"
                        >
                            <span>View Jobs</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </motion.button>
                    </h3>
                    <div className="space-y-4">
                        {mappedSkills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4 border border-red-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category as keyof typeof ANALYSIS.SKILL_CATEGORIES)}`}>
                                        {skill.category}
                                    </span>
                                </div>

                                {skill.internationalName && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">From:</span> {skill.internationalName}
                                    </p>
                                )}

                                {skill.canadianEquivalent && (
                                    <p className="text-sm text-green-600 mb-2">
                                        <span className="font-medium">To:</span> {skill.canadianEquivalent}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    {getCategoryIcon(skill.category as keyof typeof ANALYSIS.SKILL_CATEGORIES)}
                                    <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                                </div>

                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-red-500 to-blue-500 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.relevanceScore * 100}%` }}
                                            transition={{ delay: index * 0.1 + 0.8, duration: 0.8 }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Canadian Relevance: {Math.round(skill.relevanceScore * 100)}%
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-12 text-center"
            >
                <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-2">
                        Skills Successfully Mapped! 🎉
                    </h3>
                    <p className="text-red-100 mb-4">
                        Your international experience has been translated into Canadian workplace terminology
                    </p>
                    <motion.button
                        onClick={handleViewJobs}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-red-600 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-colors duration-200 inline-flex items-center gap-2"
                    >
                        <span>Find Matching Jobs</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default SkillsComparison;
