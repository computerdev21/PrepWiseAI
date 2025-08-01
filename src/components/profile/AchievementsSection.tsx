'use client';

import { UserProfile } from '@/lib/types';
import { USER_PROFILE } from '@/lib/constants';

interface AchievementsSectionProps {
    profile: UserProfile;
}

export default function AchievementsSection({ profile }: AchievementsSectionProps) {
    const getAchievementColor = (level: typeof USER_PROFILE.ACHIEVEMENT_LEVELS[keyof typeof USER_PROFILE.ACHIEVEMENT_LEVELS]) => {
        switch (level) {
            case USER_PROFILE.ACHIEVEMENT_LEVELS.GOLD:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case USER_PROFILE.ACHIEVEMENT_LEVELS.SILVER:
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case USER_PROFILE.ACHIEVEMENT_LEVELS.BRONZE:
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.achievements?.map((achievement, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getAchievementColor(achievement.level)}`}
                    >
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm mt-1">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium uppercase">{achievement.level}</span>
                            {achievement.earnedAt && (
                                <span className="text-xs">
                                    • Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 