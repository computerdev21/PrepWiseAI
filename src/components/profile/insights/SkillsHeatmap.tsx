import React from 'react';

// Sample data - Replace with real data from your API
const skills = [
    { name: 'React', demand: 95, growth: '+15%' },
    { name: 'Python', demand: 90, growth: '+12%' },
    { name: 'AWS', demand: 88, growth: '+18%' },
    { name: 'Data Analysis', demand: 85, growth: '+10%' },
    { name: 'Node.js', demand: 82, growth: '+8%' },
    { name: 'DevOps', demand: 80, growth: '+20%' },
];

const SkillsHeatmap = () => {
    return (
        <div className="space-y-4">
            {skills.map((skill) => (
                <div key={skill.name} className="relative">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                            {skill.name}
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                            {skill.growth}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                                width: `${skill.demand}%`,
                                backgroundColor: `rgba(14, 165, 233, ${skill.demand / 100})`
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkillsHeatmap; 