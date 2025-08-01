import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

// Sample data - Replace with real data from your API
const data = [
    {
        experience: 'Entry',
        tech: 65000,
        finance: 60000,
        healthcare: 55000,
    },
    {
        experience: 'Mid',
        tech: 95000,
        finance: 85000,
        healthcare: 75000,
    },
    {
        experience: 'Senior',
        tech: 130000,
        finance: 120000,
        healthcare: 110000,
    },
    {
        experience: 'Lead',
        tech: 160000,
        finance: 150000,
        healthcare: 140000,
    },
];

const formatSalary = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
};

const SalaryTrendsChart = () => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="experience" />
                <YAxis tickFormatter={formatSalary} />
                <Tooltip
                    formatter={formatSalary}
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                />
                <Legend />
                <Bar
                    dataKey="tech"
                    name="Technology"
                    fill="#0EA5E9"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="finance"
                    name="Finance"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="healthcare"
                    name="Healthcare"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalaryTrendsChart; 