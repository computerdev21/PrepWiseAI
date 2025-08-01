import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SpeakerWaveIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import toast from 'react-hot-toast';

interface AccentTrainerProps {
    transcript: string;
    isActive: boolean;
    pronunciationData?: {
        patterns: string[];
        feedback: string[];
        focusWords: string[];
        practiceExercises: string[];
    };
}

const AccentTrainer: React.FC<AccentTrainerProps> = ({ transcript, isActive, pronunciationData }) => {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE'>('MALE');

    const playCanadianPronunciation = async (word: string) => {
        if (!user) {
            console.error('No user authenticated');
            return;
        }

        setSelectedWord(word);
        try {
            const token = await user.getIdToken();
            const audio = new Audio(`/api/coach/voice/speak?word=${encodeURIComponent(word)}&accent=canadian&gender=${voiceGender}`);

            // Add authorization header to audio request
            const response = await fetch(audio.src, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audioElement = new Audio(audioUrl);
                await audioElement.play();
                // Clean up the URL after playing
                audioElement.onended = () => URL.revokeObjectURL(audioUrl);
            } else {
                throw new Error('Failed to fetch audio');
            }
        } catch (error) {
            console.error('Error playing pronunciation:', error);
            toast.error('Failed to play pronunciation. Please try again.');
        } finally {
            setSelectedWord(null);
        }
    };

    if (!isActive) return null;

    return (
        <div className="mt-4 p-4 bg-white/80 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Pronunciation Feedback</h4>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Voice:</span>
                    <button
                        onClick={() => setVoiceGender(prev => prev === 'MALE' ? 'FEMALE' : 'MALE')}
                        className={`px-3 py-1 rounded-lg text-sm ${voiceGender === 'MALE' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                            }`}
                    >
                        {voiceGender === 'MALE' ? 'Male' : 'Female'} Voice
                    </button>
                </div>
            </div>

            {isAnalyzing ? (
                <div className="flex items-center justify-center py-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <ArrowPathIcon className="w-6 h-6 text-red-600" />
                    </motion.div>
                    <span className="ml-2 text-gray-600">Analyzing pronunciation...</span>
                </div>
            ) : pronunciationData ? (
                <div className="space-y-4">
                    {/* Pronunciation Patterns */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Pronunciation Patterns</h5>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {pronunciationData.patterns.map((pattern, index) => (
                                <li key={index}>{pattern}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Canadian English Feedback */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Canadian English Feedback</h5>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {pronunciationData.feedback.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Focus Words */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Focus Words</h5>
                        <div className="flex flex-wrap gap-2">
                            {pronunciationData.focusWords.map((word, index) => (
                                <button
                                    key={index}
                                    onClick={() => playCanadianPronunciation(word)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-red-600 hover:bg-red-50"
                                    disabled={selectedWord === word}
                                >
                                    <SpeakerWaveIcon className="w-4 h-4" />
                                    {word}
                                    {selectedWord === word && <span className="ml-1">(Playing...)</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Practice Exercises */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Practice Exercises</h5>
                        <ul className="list-decimal list-inside text-gray-600 space-y-2">
                            {pronunciationData.practiceExercises.map((exercise, index) => (
                                <li key={index}>{exercise}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 text-center py-4">
                    Enable accent training and speak to receive pronunciation feedback
                </p>
            )}
        </div>
    );
};

export default AccentTrainer; 