import { Analysis } from '@/lib/types';
import { SparklesIcon, ArrowTrendingUpIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface AhaMomentsProps {
    analysis: Analysis;
}

export default function AhaMoments({ analysis }: AhaMomentsProps) {
    if (!analysis.ahaResults?.hiddenSkills.length) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-purple-900">Your Hidden Talents</h2>
            </div>

            <p className="text-purple-700 mb-8 text-lg">
                {analysis.ahaResults.insightSummary}
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {analysis.ahaResults.hiddenSkills.map((skill, index) => (
                    <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-purple-100 transform hover:scale-102 transition-transform"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {skill.originalSkill.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {skill.originalSkill.context} in {skill.originalSkill.location}
                                </p>
                            </div>
                            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                {skill.equivalentSkill.market}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                                <span className="text-green-700">
                                    Equivalent to: <strong>{skill.equivalentSkill.name}</strong>
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm">
                                {skill.equivalentSkill.description}
                            </p>

                            <div className="border-t border-purple-100 pt-3 mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-purple-900">Potential Roles:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skill.potentialRoles.map((role, roleIndex) => (
                                        <span
                                            key={roleIndex}
                                            className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                                <div className="text-gray-600">
                                    Market Value: {skill.marketValue.salary.currency}{' '}
                                    {skill.marketValue.salary.min.toLocaleString()} -{' '}
                                    {skill.marketValue.salary.max.toLocaleString()}
                                </div>
                                <div className={`
                                    px-2 py-1 rounded-full text-sm
                                    ${skill.marketValue.demandLevel === 'high' ? 'bg-green-100 text-green-700' :
                                        skill.marketValue.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'}
                                `}>
                                    {skill.marketValue.demandLevel.charAt(0).toUpperCase() +
                                        skill.marketValue.demandLevel.slice(1)} Demand
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 