'use client';

import { UserProfile } from '@/lib/types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ANALYSIS } from '@/lib/constants';

interface SkillsSectionProps {
    profile: UserProfile;
    isEditing: boolean;
    onUpdate: (updates: Partial<UserProfile>) => void;
}

export default function SkillsSection({ profile, isEditing, onUpdate }: SkillsSectionProps) {
    const handleAddSkill = () => {
        type Skill = NonNullable<UserProfile['skills']>[number];
        const newSkill: Skill = {
            name: '',
            proficiency: ANALYSIS.PROFICIENCY_LEVELS.BEGINNER,
            endorsements: 0
        };

        onUpdate({
            skills: [...(profile.skills || []), newSkill]
        });
    };

    const handleRemoveSkill = (index: number) => {
        onUpdate({
            skills: profile.skills?.filter((_, i) => i !== index) || []
        });
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
                {isEditing && (
                    <button
                        onClick={handleAddSkill}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Skill
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.skills?.map((skill, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={skill.name}
                                    onChange={e => {
                                        const newSkills = [...(profile.skills || [])];
                                        newSkills[index] = { ...skill, name: e.target.value };
                                        onUpdate({ skills: newSkills });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Skill name"
                                />
                                <select
                                    value={skill.proficiency}
                                    onChange={e => {
                                        const newSkills = [...(profile.skills || [])];
                                        newSkills[index] = {
                                            ...skill,
                                            proficiency: e.target.value as typeof skill.proficiency
                                        };
                                        onUpdate({ skills: newSkills });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value={ANALYSIS.PROFICIENCY_LEVELS.BEGINNER}>Beginner</option>
                                    <option value={ANALYSIS.PROFICIENCY_LEVELS.INTERMEDIATE}>Intermediate</option>
                                    <option value={ANALYSIS.PROFICIENCY_LEVELS.ADVANCED}>Advanced</option>
                                    <option value={ANALYSIS.PROFICIENCY_LEVELS.EXPERT}>Expert</option>
                                </select>
                                <button
                                    onClick={() => handleRemoveSkill(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-medium text-gray-800">{skill.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{skill.proficiency}</p>
                                {(skill.endorsements ?? 0) > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {skill.endorsements} endorsements
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 