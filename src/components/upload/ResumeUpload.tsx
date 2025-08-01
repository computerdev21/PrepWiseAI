'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowUpTrayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    CloudArrowUpIcon,
    UserIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ResumeUpload as ResumeUploadType, UploadProgress, UserProfile, Analysis } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { FIREBASE } from '@/lib/constants';
import { analysisService } from '@/lib/services/analysisService';
import { profileService } from '@/lib/services/profileService';
import { resumeService } from '@/lib/services/resumeService';
import { formatDateWithTime } from '@/lib/utils';

export default function ResumeUpload() {
    const router = useRouter();
    const { user } = useAuth();
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        progress: 0,
        status: 'uploading'
    });
    const [userBackground, setUserBackground] = useState<Omit<UserProfile, 'userId'>>({
        countryOfOrigin: '',
        targetRole: '',
        yearsOfExperience: '',
        updatedAt: new Date(),
        socialLinks: {},
        skills: [],
        goals: [],
        achievements: []
    });
    const [currentStep, setCurrentStep] = useState<'upload' | 'background' | 'complete'>('upload');
    const [resumes, setResumes] = useState<ResumeUploadType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analysisStatus, setAnalysisStatus] = useState<Record<string, Analysis>>({});
    const [processingResumes, setProcessingResumes] = useState<Set<string>>(new Set());

    const steps = [
        { step: 'upload', label: 'Upload Resume', icon: CloudArrowUpIcon },
        { step: 'background', label: 'Background Info', icon: UserIcon },
        { step: 'complete', label: 'Review', icon: CheckIcon }
    ];

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchResumes();
            fetchAnalysisStatus();
        }
    }, [user]);

    useEffect(() => {
        if (!user || processingResumes.size === 0) return;

        const pollInterval = setInterval(async () => {
            try {
                const token = await user.getIdToken();
                const response = await analysisService.getAnalysisList(token);
                if (response.success) {
                    const newStatusMap = response.data.reduce((acc: Record<string, Analysis>, analysis: Analysis) => {
                        acc[analysis.resumeId] = analysis;
                        return acc;
                    }, {});

                    setAnalysisStatus(newStatusMap);

                    // Remove completed or failed analyses from processing set
                    const stillProcessing = new Set(processingResumes);
                    for (const [resumeId, analysis] of Object.entries(newStatusMap)) {
                        if (analysis.status === 'completed' || analysis.status === 'failed') {
                            stillProcessing.delete(resumeId);
                        }
                    }
                    setProcessingResumes(stillProcessing);
                }
            } catch (error) {
                console.error('Error polling analysis status:', error);
            }
        }, 8000); // Poll every 8 seconds

        return () => clearInterval(pollInterval);
    }, [user, processingResumes]);

    const fetchUserProfile = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await profileService.getProfile(token);
            if (response.success && response.data) {
                setUserBackground(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchResumes = async () => {
        try {
            setIsLoading(true);
            const token = await user?.getIdToken();
            if (!token) return;

            const response = await resumeService.listResumes(token);
            if (response.success && response.data) {
                setResumes(response.data);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalysisStatus = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await analysisService.getAnalysisList(token);
            if (response.success) {
                const statusMap = response.data.reduce((acc: Record<string, Analysis>, analysis: Analysis) => {
                    acc[analysis.resumeId] = analysis;
                    return acc;
                }, {});
                setAnalysisStatus(statusMap);
            }
        } catch (error) {
            console.error('Error fetching analysis status:', error);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!FIREBASE.STORAGE.ALLOWED_FILE_TYPES.includes(file.type as typeof FIREBASE.STORAGE.ALLOWED_FILE_TYPES[number])) {
            alert('Please upload a PDF or Word document.');
            return;
        }

        // Validate file size
        if (file.size > FIREBASE.STORAGE.MAX_FILE_SIZE) {
            alert('File size too large. Please upload a file smaller than 10MB.');
            return;
        }

        setSelectedFile(file);
        setUploadProgress({
            progress: 0,
            status: 'ready'
        });
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleBackgroundSubmit = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();

            // Save background info using profile service
            const profileResponse = await profileService.updateProfile(token, {
                ...userBackground,
                userId: user.uid
            });

            if (!profileResponse.success) {
                throw new Error(profileResponse.error || 'Failed to save background info');
            }

            // Fetch updated resumes list
            await fetchResumes();

            // Get the most recently uploaded resume
            const latestResume = resumes[resumes.length - 1];
            if (latestResume) {
                // Start analysis in background
                startAnalysis(latestResume.id);
            }

            // Immediately move to complete step
            setCurrentStep('complete');
            toast.success('Profile updated and analysis started!');
        } catch (error) {
            console.error('Error saving background:', error);
            toast.error('Failed to save background information');
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            setUploadProgress({
                progress: 0,
                status: 'uploading'
            });

            // Get a fresh token
            const token = await user.getIdToken(true);
            const response = await resumeService.uploadResume(token, file);

            if (response.success && response.data) {
                toast.success('File uploaded successfully!');
                await handleUploadSuccess();
            } else {
                throw new Error(response.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
            setUploadProgress({
                progress: 0,
                status: 'error'
            });
        }
    };

    const handleDeleteResume = async (resumeId: string) => {
        try {
            const token = await user?.getIdToken();
            if (!token) return;

            const response = await resumeService.deleteResume(token, resumeId);

            if (response.success) {
                toast.success('Resume deleted successfully');
                await fetchResumes();
            } else {
                throw new Error('Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
        }
    };

    const handleSetActiveResume = async (resumeId: string) => {
        try {
            const token = await user?.getIdToken();
            if (!token) return;

            const response = await resumeService.setActiveResume(token, resumeId);

            if (response.success) {
                await fetchResumes();
            }
        } catch (error) {
            console.error('Error setting active resume:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUploadSuccess = async () => {
        try {
            // Update upload progress
            setUploadProgress({
                progress: 100,
                status: 'completed'
            });

            // Fetch updated resumes list
            await fetchResumes();

            // Move to background step
            setCurrentStep('background');

        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress({
                progress: 0,
                status: 'error'
            });
        }
    };

    const startAnalysis = async (resumeId: string) => {
        if (!user) return;

        // Immediately mark as processing
        setProcessingResumes(prev => new Set(prev).add(resumeId));

        try {
            const token = await user.getIdToken();
            const response = await analysisService.startAnalysis(token, resumeId);
            if (response.success) {
                setAnalysisStatus(prev => ({
                    ...prev,
                    [resumeId]: response.data
                }));
            } else {
                throw new Error(response.error || 'Failed to start analysis');
            }
        } catch (error) {
            console.error('Error starting analysis:', error);
            toast.error('Failed to start analysis');
            // Remove from processing on error
            setProcessingResumes(prev => {
                const newSet = new Set(prev);
                newSet.delete(resumeId);
                return newSet;
            });
        }
    };

    const renderAnalysisStatus = (resume: ResumeUploadType) => {
        const isProcessing = processingResumes.has(resume.id);
        const analysis = analysisStatus[resume.id];

        if (isProcessing || analysis?.status === 'processing') {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent" />
                    <span className="text-sm font-medium">Analyzing...</span>
                </div>
            );
        }

        if (analysis?.status === 'completed') {
            return (
                <div className="flex items-center gap-2 px-2 py-2 text-green-700 rounded-lg">
                    <span className="text-sm font-medium">Analysis Complete</span>
                </div>
            );
        }
    }

    const renderAnalysisActions = (resume: ResumeUploadType) => {
        const isProcessing = processingResumes.has(resume.id);
        const analysis = analysisStatus[resume.id];

        if (isProcessing || analysis?.status === 'processing') {
            return (
                <></>
            );
        }

        if (analysis?.status === 'completed') {
            return (
                <div className="flex items-center gap-3">
                    <a
                        href={`/analysis/${analysis.id}`}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        View Analysis
                    </a>
                </div>
            );
        }

        if (analysis?.status === 'failed') {
            return (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Analysis Failed</span>
                    </div>
                    <button
                        onClick={() => startAnalysis(resume.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        Retry Analysis
                    </button>
                </div>
            );
        }

        return (
            <button
                onClick={() => startAnalysis(resume.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
                Start Analysis
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.h1
                            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Upload Your Resume
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Let our AI analyze your international experience and map it to Canadian opportunities
                        </motion.p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-8">
                        <nav className="flex items-center space-x-4" aria-label="Progress">
                            {steps.map(({ step, label, icon: Icon }) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === step
                                            ? 'bg-red-600 text-white'
                                            : steps.indexOf({ step: currentStep, label: '', icon: CloudArrowUpIcon }) >
                                                steps.indexOf({ step, label: '', icon: CloudArrowUpIcon })
                                                ? 'bg-red-200 text-red-700'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span
                                        className={`ml-2 text-sm font-medium ${currentStep === step ? 'text-red-600' : 'text-gray-500'
                                            }`}
                                    >
                                        {label}
                                    </span>
                                    {step !== 'complete' && (
                                        <div className="ml-4 w-8 h-0.5 bg-gray-200"></div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <AnimatePresence mode="wait">
                        {currentStep === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <div
                                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragOver
                                        ? 'border-red-500 bg-red-50'
                                        : selectedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-red-400'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {selectedFile.name}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-2 mx-auto"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                Remove file
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-4">
                                            <ArrowUpTrayIcon className="w-16 h-16 text-gray-400 mx-auto" />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    Drop your resume here
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    or click to browse files
                                                </p>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                    id="file-input"
                                                />
                                                <label
                                                    htmlFor="file-input"
                                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                                                >
                                                    Choose File
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Supports PDF, DOC, DOCX (max 10MB)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 text-center"
                                    >
                                        {uploadProgress.status === 'uploading' ? (
                                            <div className="space-y-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress.progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600">Uploading... {uploadProgress.progress}%</p>
                                            </div>
                                        ) : uploadProgress.status === 'completed' ? (
                                            <button
                                                onClick={() => setCurrentStep('background')}
                                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                                            >
                                                Continue
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        ) : uploadProgress.status === 'error' ? (
                                            <div className="space-y-4">
                                                <p className="text-red-600">Upload failed. Please try again.</p>
                                                <button
                                                    onClick={() => handleFileUpload(selectedFile)}
                                                    className="text-red-600 hover:text-red-700 underline"
                                                >
                                                    Retry Upload
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleFileUpload(selectedFile)}
                                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                                            >
                                                Upload Resume
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === 'background' && (
                            <motion.div
                                key="background"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                    Tell us about your background
                                </h2>

                                <div className="space-y-6 max-w-md mx-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country of Origin *
                                        </label>
                                        <input
                                            type="text"
                                            value={userBackground.countryOfOrigin}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, countryOfOrigin: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="e.g., India, Philippines, Syria"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Role in Canada *
                                        </label>
                                        <input
                                            type="text"
                                            value={userBackground.targetRole}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, targetRole: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="e.g., Software Engineer, Data Scientist"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Years of Experience
                                        </label>
                                        <select
                                            value={userBackground.yearsOfExperience}
                                            onChange={(e) => setUserBackground(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            <option value="">Select experience level</option>
                                            <option value="0-1">0-1 years</option>
                                            <option value="2-3">2-3 years</option>
                                            <option value="4-6">4-6 years</option>
                                            <option value="7-10">7-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setCurrentStep('upload')}
                                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleBackgroundSubmit}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Start Analysis
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-8">Your Resumes</h2>

                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    </div>
                                ) : resumes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No resumes uploaded yet.</p>
                                        <button
                                            onClick={() => setCurrentStep('upload')}
                                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Upload Your First Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {resumes.map((resume) => (
                                            <div
                                                key={resume.id}
                                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-red-100 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-lg text-gray-900 mb-1">
                                                            {resume.fileName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            Uploaded on {formatDateWithTime(resume.uploadDate)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {renderAnalysisStatus(resume)}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                        {/* Analysis Status */}
                                                        {renderAnalysisActions(resume)}

                                                        {/* Resume Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {/* <button
                                                                onClick={() => handleSetActiveResume(resume.id)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${resume.isActive
                                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {resume.isActive ? 'Active Resume' : 'Set as Active'}
                                                            </button> */}
                                                            <button
                                                                onClick={() => handleDeleteResume(resume.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                                title="Delete Resume"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setCurrentStep('upload')}
                                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors text-center font-medium"
                                    >
                                        Upload Another Resume
                                    </button>
                                    <a
                                        href="/analysis"
                                        className="flex-1 bg-white text-red-600 border-2 border-red-600 px-6 py-3 rounded-xl hover:bg-red-50 transition-colors text-center font-medium"
                                    >
                                        View All Analyses
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}