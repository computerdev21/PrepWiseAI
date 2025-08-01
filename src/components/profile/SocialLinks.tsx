'use client';

import { UserProfile } from '@/lib/types';
import { LinkIcon } from '@heroicons/react/24/outline';

interface SocialLinksProps {
    profile: UserProfile;
    isEditing: boolean;
    onUpdate: (updates: Partial<UserProfile>) => void;
}

export default function SocialLinks({ profile, isEditing, onUpdate }: SocialLinksProps) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['github', 'linkedin', 'portfolio'].map((platform) => (
                    <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {platform}
                        </label>
                        {isEditing ? (
                            <input
                                type="url"
                                value={profile.socialLinks?.[platform as keyof typeof profile.socialLinks] || ''}
                                onChange={e => onUpdate({
                                    socialLinks: {
                                        ...(profile.socialLinks || {}),
                                        [platform]: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder={`Enter your ${platform} URL`}
                            />
                        ) : (
                            <a
                                href={profile.socialLinks?.[platform as keyof typeof profile.socialLinks]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-700 flex items-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                {profile.socialLinks?.[platform as keyof typeof profile.socialLinks] || 'Not set'}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 