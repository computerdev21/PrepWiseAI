'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Job } from '@/lib/types';
import JobCard from './JobCard';
import { jobService } from '@/lib/services/jobService';

interface JobListProps {
    analysisId: string;
    skills: string[];
}

export default function JobList({ analysisId, skills }: JobListProps) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await jobService.searchJobs(token, analysisId, skills);
                if (response.success) {
                    setJobs(response.data);
                } else {
                    setError(response.message || response.error || 'Failed to fetch jobs');
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setError('Failed to fetch jobs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [analysisId, skills, user]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600">
                No matching jobs found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Salary</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {Math.round(
                            jobs.filter(job => job.salary)
                                .reduce((sum, job) => sum + (job.salary?.min || 0), 0) /
                            jobs.filter(job => job.salary).length
                        )}k
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Local Jobs</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {jobs.filter(job => job.location.includes('Toronto')).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Jobs</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {jobs.length}
                    </p>
                </div>
            </div>

            {/* Jobs List */}
            <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}
