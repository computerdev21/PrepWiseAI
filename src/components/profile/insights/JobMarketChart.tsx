import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

// Sample data - Replace with real data from your API
const data = [
    { month: 'Jan', tech: 4500, finance: 3000, healthcare: 2000 },
    { month: 'Feb', tech: 5000, finance: 3200, healthcare: 2100 },
    { month: 'Mar', tech: 4800, finance: 3100, healthcare: 2300 },
    { month: 'Apr', tech: 5200, finance: 3400, healthcare: 2400 },
    { month: 'May', tech: 5500, finance: 3600, healthcare: 2600 },
    { month: 'Jun', tech: 5800, finance: 3800, healthcare: 2800 },
];

const JobMarketChart = () => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHealthcare" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="tech"
                    name="Technology"
                    stroke="#0EA5E9"
                    fillOpacity={1}
                    fill="url(#colorTech)"
                />
                <Area
                    type="monotone"
                    dataKey="finance"
                    name="Finance"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorFinance)"
                />
                <Area
                    type="monotone"
                    dataKey="healthcare"
                    name="Healthcare"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorHealthcare)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default JobMarketChart; 