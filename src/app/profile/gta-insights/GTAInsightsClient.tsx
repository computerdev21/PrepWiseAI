'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import EmploymentDashboard from '@/components/profile/insights/EmploymentDashboard';

// Dynamically import charts to avoid SSR issues
const JobMarketChart = dynamic(() => import('@/components/profile/insights/JobMarketChart'), { ssr: false });
const SalaryTrendsChart = dynamic(() => import('@/components/profile/insights/SalaryTrendsChart'), { ssr: false });
const SkillsHeatmap = dynamic(() => import('@/components/profile/insights/SkillsHeatmap'), { ssr: false });
const ResourcesTimeline = dynamic(() => import('@/components/profile/insights/ResourcesTimeline'), { ssr: false });

export default function GTAInsightsClient() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">GTA Job Market Insights</h1>
                <p className="text-gray-600 mt-2">
                    Real-time analytics and insights for the Greater Toronto Area job market
                </p>
            </div>

            {/* Employment Statistics Dashboard */}
            <div className="mb-8">
                <EmploymentDashboard region="ontario" months={24} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Job Market Overview */}
                <Card className="col-span-full lg:col-span-2">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Job Market Overview</h2>
                        <div className="h-[400px]">
                            <JobMarketChart />
                        </div>
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card className="lg:col-span-1">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600">Average Salary</p>
                                <p className="text-2xl font-bold text-blue-700">$85,000</p>
                                <p className="text-xs text-blue-500">+5.2% from last year</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-green-600">Open Positions</p>
                                <p className="text-2xl font-bold text-green-700">12,450</p>
                                <p className="text-xs text-green-500">+1,200 this month</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-purple-600">Top Hiring Companies</p>
                                <p className="text-2xl font-bold text-purple-700">350+</p>
                                <p className="text-xs text-purple-500">Active this week</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Salary Trends */}
                <Card className="col-span-full md:col-span-1">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Salary Trends by Experience</h2>
                        <div className="h-[300px]">
                            <SalaryTrendsChart />
                        </div>
                    </div>
                </Card>

                {/* Skills in Demand */}
                <Card className="col-span-full md:col-span-1">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Skills in Demand</h2>
                        <div className="h-[300px]">
                            <SkillsHeatmap />
                        </div>
                    </div>
                </Card>

                {/* Resource Timeline */}
                <Card className="col-span-full">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Upcoming Resources & Events</h2>
                        <ResourcesTimeline />
                    </div>
                </Card>
            </div>
        </div>
    );
} 