'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { resumeService } from '@/lib/services/resumeService';
import type { ResumeListResponse } from '@/lib/services/resumeService';
import { analysisService } from '@/lib/services/analysisService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Analysis } from '@/lib/types';
import { formatDateWithTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ResumeManager() {
    const { user } = useAuth();
    const [resumes, setResumes] = useState<ResumeListResponse['data']>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
    const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
    const router = useRouter();

    const fetchResumes = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await resumeService.listResumes(token);
            if (response.success) {
                setResumes(response.data);
                // Fetch analysis status for each resume
                fetchAnalysesForResumes(token, response.data);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
            setError('Failed to fetch resumes');
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
            fetchResumes();
        }
    }, [user]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await resumeService.uploadResume(token, file);

            if (response.success) {
                setResumes(prev => [...prev, response.data]);
            } else {
                setError(response.message || 'Failed to upload resume');
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            setError('Failed to upload resume');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (resumeId: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await resumeService.deleteResume(token, resumeId);
            if (response.success) {
                await fetchResumes();
            } else {
                setError(response.message || response.error || 'Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            setError('Failed to delete resume');
        }
    };

    const handleAnalyze = async (resumeId: string) => {
        if (!user) return;
        setIsAnalyzing(resumeId);
        setError(null);

        try {
            const token = await user.getIdToken();
            let response = null;
            if (analyses?.[resumeId]?.id) {
                response = await analysisService.retryAnalysis(token, resumeId, analyses?.[resumeId]?.id);
            } else {
                // create analysis
                response = await analysisService.startAnalysis(token, resumeId);
            }

            if (response.success) {
                setAnalyses(prev => ({
                    ...prev,
                    [resumeId]: response.data
                }));
            } else {
                setError(response.message || response.error || 'Failed to analyze resume');
            }
        } catch (error) {
            console.error('Error analyzing resume:', error);
            setError('Failed to analyze resume');
        } finally {
            setIsAnalyzing(null);
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Manager</h2>

            {/* Upload Section */}
            <div className="mb-6">
                <label className="block mb-2">
                    <span className="sr-only">Choose file</span>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100"
                    />
                </label>
                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-red-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-600 mb-4">{error}</div>
            )}

            {/* Resumes List */}
            <div className="space-y-4">
                {resumes.map((resume) => (
                    <div key={resume.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">{resume.fileName}</h3>
                                <p className="text-sm text-gray-600">
                                    Uploaded on {formatDateWithTime(resume.uploadDate)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Status and Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Status Badge */}
                                    {analyses[resume.id] && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${analyses[resume.id].status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : analyses[resume.id].status === 'failed'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {analyses[resume.id].status}
                                        </span>
                                    )}

                                    {/* View Analysis Button */}
                                    {analyses[resume.id] && analyses[resume.id].status === 'completed' && (
                                        <button
                                            onClick={() => router.push(`/analysis/${analyses[resume.id].id}`)}
                                            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                        >
                                            View Analysis
                                        </button>
                                    )}

                                    {/* Analyze/Retry Button */}
                                    <button
                                        onClick={() => handleAnalyze(resume.id)}
                                        disabled={isAnalyzing === resume.id}
                                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${analyses[resume.id]?.status === 'failed'
                                            ? 'text-white bg-orange-600 hover:bg-orange-700'
                                            : 'text-white bg-red-600 hover:bg-red-700'
                                            } disabled:opacity-50`}
                                    >
                                        {isAnalyzing === resume.id ? (
                                            <div className="flex items-center space-x-1">
                                                <LoadingSpinner size="small" />
                                                <span>Analyzing...</span>
                                            </div>
                                        ) : (
                                            analyses?.[resume?.id]?.id ? 'Retry Analyze' : 'Analyze'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 