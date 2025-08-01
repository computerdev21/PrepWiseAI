'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserProfile } from '@/lib/types';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import BasicInfo from '@/components/profile/BasicInfo';
import SocialLinks from '@/components/profile/SocialLinks';
import ResumeManager from '@/components/profile/ResumeManager';
import { profileService } from '@/lib/services/profileService';

const initialProfile: UserProfile = {
    userId: '',
    countryOfOrigin: '',
    targetRole: '',
    yearsOfExperience: '',
    updatedAt: new Date(),
    socialLinks: {},
    skills: [],
    achievements: [],
    goals: []
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await profileService.getProfile(token);
                if (response.success && response.data) {
                    setProfile(response.data);
                } else {
                    setError(response.message || response.error || 'Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to fetch profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleUpdate = (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await profileService.updateProfile(token, {
                ...profile,
                userId: user.uid
            });

            if (response.success && response.data) {
                setProfile(response.data);
                setIsEditing(false);
                setError(null);
            } else {
                setError(response.message || response.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to save profile');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Please log in to view your profile.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <button
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            {isEditing ? (
                                <>
                                    <CheckIcon className="w-5 h-5" />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="w-5 h-5" />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <BasicInfo
                        profile={profile}
                        isEditing={isEditing}
                        onUpdate={handleUpdate}
                    />

                    <SocialLinks
                        profile={profile}
                        isEditing={isEditing}
                        onUpdate={handleUpdate}
                    />

                    {/* <SkillsSection
                        profile={profile}
                        isEditing={isEditing}
                        onUpdate={handleUpdate}
                    />

                    <AchievementsSection profile={profile} /> */}

                    <ResumeManager />
                </div>
            </div>
        </div>
    );
} 