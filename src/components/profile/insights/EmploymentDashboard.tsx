'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    EmploymentTrends,
    TopIndustries,
    RegionalBreakdown,
    EmploymentInsights
} from '@/lib/types/statistics';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { employmentData } from '@/data/employment-data';

interface EmploymentDashboardProps {
    region?: string;
    months?: number;
}

type ReadonlyRegionalBreakdown = {
    readonly region: string;
    readonly employmentRate: number;
    readonly unemploymentRate: number;
    readonly participationRate: number;
    readonly totalEmployed: number;
    readonly monthlyChange: number;
    readonly date: string;
    readonly topIndustries: ReadonlyArray<{
        readonly naicsCode: string;
        readonly name: string;
        readonly yearOverYearChange: number;
    }>;
    readonly yearOverYearChange?: number;
};

const EmploymentDashboard: React.FC<EmploymentDashboardProps> = ({
    region = 'canada',
    months = 24
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        trends: EmploymentTrends;
        topIndustries: TopIndustries;
        regional: ReadonlyRegionalBreakdown;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const selectedRegion = employmentData.regionalBreakdown.find(r =>
                    r.region.toLowerCase() === region.toLowerCase()
                ) || employmentData.regionalBreakdown[0];

                setData({
                    trends: employmentData.trends,
                    topIndustries: employmentData.topIndustries,
                    regional: selectedRegion
                });
                setError(null);
            } catch (err) {
                console.error('Error loading employment data:', err);
                setError('Failed to load employment data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, region, months]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!data) return null;

    const { trends, topIndustries, regional } = data;

    return (
        <div className="space-y-8">

            {/* Add Date */}
            <div className="text-sm text-gray-500">
                <p>Last updated: {trends.currentMonth.date}</p>
            </div>

            {/* Current Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Employment Rate</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {trends.currentMonth.employmentRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {trends.currentMonth.monthlyChange > 0 ? '+' : ''}
                        {trends.currentMonth.monthlyChange.toFixed(1)}% from last month
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unemployment Rate</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {trends.currentMonth.unemploymentRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Regional average
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Participation Rate</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {trends.currentMonth.participationRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Active workforce
                    </p>
                </motion.div>
            </div>

            {/* Employment Trends Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Trends</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={[...trends.historicalTrends].slice(0, months)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => {
                                    if (typeof date !== 'string') return '';
                                    const [year, month] = date.split('-');
                                    if (!year || !month) return date;
                                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' });
                                }}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => {
                                    if (typeof date !== 'string') return '';
                                    const [year, month] = date.split('-');
                                    if (!year || !month) return date;
                                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
                                }}
                                formatter={(value: number) => [`${value.toFixed(1)}%`]}
                            />
                            <Line
                                type="monotone"
                                dataKey="employmentRate"
                                name="Employment Rate"
                                stroke="#2563eb"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="unemploymentRate"
                                name="Unemployment Rate"
                                stroke="#dc2626"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Regional Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">{regional.region}</h4>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Employment Rate</dt>
                                <dd className="font-semibold">{regional.employmentRate.toFixed(1)}%</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Unemployment Rate</dt>
                                <dd className="font-semibold">{regional.unemploymentRate.toFixed(1)}%</dd>
                            </div>
                            {regional.yearOverYearChange !== undefined && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">Year over Year Change</dt>
                                    <dd className="font-semibold">
                                        {regional.yearOverYearChange > 0 ? '+' : ''}
                                        {regional.yearOverYearChange.toFixed(1)}%
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Top Industries</h4>
                        <ul className="space-y-2">
                            {regional.topIndustries.slice(0, 3).map((industry) => (
                                <li key={industry.naicsCode} className="flex justify-between">
                                    <span className="text-gray-600">{industry.name}</span>
                                    <span className="font-semibold">
                                        {industry.yearOverYearChange > 0 ? '+' : ''}
                                        {industry.yearOverYearChange.toFixed(1)}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmploymentDashboard; 