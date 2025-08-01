'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPinIcon,
    CurrencyDollarIcon,
    ArrowTopRightOnSquareIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { Job } from '@/lib/types';

const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`;
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const JobCard = ({ job }: { job: Job }) => {
    return (
        <motion.div
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                        <BuildingOfficeIcon className="w-5 h-5" />
                        <span>{job.company}</span>
                    </div>
                </div>
                {job.applicationUrl && (
                    <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                )}
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>{formatSalary(job.salary)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Posted {formatDate(job.postedDate)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(job.matchPercentage / 20)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500">via {job.source}</span>
            </div>
        </motion.div>
    );
};

export default JobCard;
