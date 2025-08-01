import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AccentTrainer from './AccentTrainer';
import { useAuth } from '@/lib/auth/AuthContext';

// Add type declarations for the Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface EmotionAnalysis {
    confidence: number;
    nervousness: number;
    engagement: number;
    clarity: number;
}

interface FeedbackIndicatorProps {
    label: string;
    value: number;
    color: string;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ label, value, color }) => (
    <div className="bg-white/50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm text-gray-600">{(value * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full bg-${color}-500`}
                style={{
                    width: `${value * 100}%`,
                    transition: 'width 0.5s ease-in-out'
                }}
            />
        </div>
    </div>
);

interface VoiceInterviewSimulatorProps {
    isActive: boolean;
    onTranscriptUpdate: (text: string, type: 'user' | 'assistant') => void;
}

export default function VoiceInterviewSimulator({ isActive, onTranscriptUpdate }: VoiceInterviewSimulatorProps) {
    const { user } = useAuth();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [emotions, setEmotions] = useState<EmotionAnalysis>({
        confidence: 0,
        nervousness: 0,
        engagement: 0,
        clarity: 0
    });
    const [showAccentTrainer, setShowAccentTrainer] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pronunciationData, setPronunciationData] = useState<any>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const accentTrainerRef = useRef(false);

    // Keep ref in sync with state
    useEffect(() => {
        accentTrainerRef.current = showAccentTrainer;
    }, [showAccentTrainer]);

    // Add message handler
    const addMessage = (content: string, type: 'user' | 'assistant') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        onTranscriptUpdate(content, type);
    };

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = async (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update the transcript state with both final and interim results
                setTranscript(finalTranscript || interimTranscript);

                // Only process final transcripts
                if (finalTranscript && !isProcessing) {
                    setIsProcessing(true);
                    addMessage(finalTranscript, 'user');

                    // Add a small delay to ensure we have the complete phrase
                    if (processingTimeoutRef.current) {
                        clearTimeout(processingTimeoutRef.current);
                    }

                    processingTimeoutRef.current = setTimeout(async () => {
                        await processTranscript(finalTranscript);
                        setIsProcessing(false);
                    }, 1000);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied. Please check your permissions.');
                    stopRecording();
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const processTranscript = async (text: string) => {
        try {
            if (!user) {
                console.error('No user authenticated');
                return;
            }

            const token = await user.getIdToken();
            const response = await fetch('/api/coach/voice/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text,
                    isAccentEnabled: accentTrainerRef.current
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Update emotions with scores
                setEmotions({
                    confidence: data.scores.confidence,
                    nervousness: data.scores.nervousness,
                    engagement: data.scores.engagement,
                    clarity: data.scores.clarity
                });

                // Format and display detailed feedback
                const feedback = data.feedback;
                let detailedFeedback = [
                    feedback.primaryFeedback,
                    '',
                    'Analysis:',
                    ...feedback.reasons.map((r: string) => `• ${r}`),
                    '',
                    'Examples from your response:',
                    ...feedback.examples.map((e: string) => `• ${e}`),
                    '',
                    'How to improve:',
                    ...feedback.improvements.map((i: string) => `• ${i}`)
                ];

                // Add pronunciation feedback if enabled
                if (feedback.pronunciation) {
                    setPronunciationData(feedback.pronunciation);
                    detailedFeedback = [
                        ...detailedFeedback,
                        '',
                        'Pronunciation Analysis:',
                        'Patterns:',
                        ...feedback.pronunciation.patterns.map((p: string) => `• ${p}`),
                        '',
                        'Canadian English Feedback:',
                        ...feedback.pronunciation.feedback.map((f: string) => `• ${f}`),
                        '',
                        'Focus Words:',
                        ...feedback.pronunciation.focusWords.map((w: string) => `• ${w}`),
                        '',
                        'Practice Exercises:',
                        ...feedback.pronunciation.practiceExercises.map((e: string) => `• ${e}`)
                    ];
                }

                // Add the feedback message
                addMessage(detailedFeedback.join('\n'), 'assistant');
            } else {
                const error = await response.json();
                console.error('Error analyzing emotions:', error);
                addMessage('I apologize, but I encountered an error analyzing your response. Please try again.', 'assistant');
            }
        } catch (error) {
            console.error('Error processing transcript:', error);
            addMessage('I apologize, but I encountered an error processing your response. Please try again.', 'assistant');
        }
    };

    const startRecording = async () => {
        try {
            if (!user) {
                toast.error('Please sign in to use voice features');
                return;
            }

            setIsRecording(true);
            recognitionRef.current?.start();
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Failed to start recording. Please check your microphone permissions.');
        }
    };

    const stopRecording = () => {
        try {
            setIsRecording(false);
            recognitionRef.current?.stop();
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    const toggleAccentTrainer = () => {
        setShowAccentTrainer(prev => !prev);
        // Clear pronunciation data when disabling accent trainer
        if (showAccentTrainer) {
            setPronunciationData(null);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Voice Interview Mode</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleAccentTrainer}
                        className={`px-3 py-1 rounded-lg text-sm ${showAccentTrainer ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Accent Training
                    </button>
                    <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-full ${isRecording ? 'bg-red-600' : 'bg-blue-600'} text-white`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!isActive}
                    >
                        {isRecording ? (
                            <StopIcon className="w-6 h-6" />
                        ) : (
                            <MicrophoneIcon className="w-6 h-6" />
                        )}
                    </motion.button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                        >
                            <div
                                className={`inline-block max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-800'
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                </div>
                                <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-red-200' : 'text-gray-500'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Live transcript */}
                {transcript && (
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600 italic">{transcript}</p>
                    </div>
                )}

                {/* Feedback indicators */}
                <div className="grid grid-cols-2 gap-4">
                    <FeedbackIndicator label="Confidence" value={emotions.confidence} color="blue" />
                    <FeedbackIndicator label="Engagement" value={emotions.engagement} color="yellow" />
                    <FeedbackIndicator label="Clarity" value={emotions.clarity} color="green" />
                    <FeedbackIndicator label="Nervousness" value={emotions.nervousness} color="red" />
                </div>

                {/* Accent Trainer */}
                {showAccentTrainer && pronunciationData && (
                    <div className="mt-4">
                        <AccentTrainer
                            transcript={transcript}
                            isActive={showAccentTrainer}
                            pronunciationData={pronunciationData}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 