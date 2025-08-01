'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Analysis } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { analysisService } from '@/lib/services/analysisService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Card from '../ui/Card';
import { formatDateWithTime } from '@/lib/utils';

export default function AnalysisList() {
    const router = useRouter();
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalyses = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await analysisService.getAnalysisList(token);
                if (response.success) {
                    setAnalyses(response.data);
                } else {
                    setError(response.message || 'Failed to fetch analyses');
                }
            } catch (err) {
                console.error('Error fetching analyses:', err);
                setError('Failed to fetch analyses');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyses();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!analyses.length) return <div className="text-gray-600">No analyses found. Upload a resume to get started.</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Your Resume Analyses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis) => (
                    <Card key={analysis.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <button
                            onClick={() => router.push(`/analysis/${analysis.id}`)}
                            className="w-full text-left"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold">Analysis #{analysis.id.slice(0, 8)}</h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDateWithTime(analysis.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        analysis.status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {analysis.status}
                                    </span>
                                </div>

                                {analysis.status === 'completed' && analysis.profileResults && (
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium">Skills analyzed:</span> {analysis.profileResults.skills.length}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Experience entries:</span> {analysis.profileResults.experience.length}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Recommendations:</span> {analysis.profileResults.recommendations.length}
                                        </p>
                                    </div>
                                )}

                                {analysis.status === 'failed' && (
                                    <p className="text-sm text-red-600">
                                        {analysis.error || 'Analysis failed'}
                                    </p>
                                )}

                                {analysis.status === 'processing' && (
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="small" />
                                        <span className="text-sm">Processing...</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
} 