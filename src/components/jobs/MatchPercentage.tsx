'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface MatchPercentageProps {
    percentage: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

const MatchPercentage = ({ percentage, label = 'Match', size = 'md' }: MatchPercentageProps) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-20 h-20 text-lg';
            case 'lg':
                return 'w-32 h-32 text-3xl';
            default:
                return 'w-24 h-24 text-2xl';
        }
    };

    const getColor = (percent: number) => {
        if (percent >= 85) return 'text-green-600';
        if (percent >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStrokeColor = (percent: number) => {
        if (percent >= 85) return 'stroke-green-600';
        if (percent >= 70) return 'stroke-yellow-600';
        return 'stroke-red-600';
    };

    const getBgColor = (percent: number) => {
        if (percent >= 85) return 'bg-green-100';
        if (percent >= 70) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const radius = size === 'lg' ? 60 : size === 'sm' ? 35 : 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${getSizeClasses()}`}>
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                    />
                    <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDasharray}
                        className={getStrokeColor(percentage)}
                        initial={{ strokeDashoffset: strokeDasharray }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`font-bold ${getColor(percentage)}`}
                    >
                        {percentage}%
                    </motion.div>
                </div>
            </div>

            {label && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className={`mt-3 px-4 py-2 rounded-full text-sm font-medium ${getBgColor(percentage)} ${getColor(percentage)} flex items-center gap-2`}
                >
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    {label}
                </motion.div>
            )}
        </div>
    );
};

export default MatchPercentage;
