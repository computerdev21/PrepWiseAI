'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    ChatBubbleLeftRightIcon,
    UserIcon,
    SparklesIcon,
    DocumentTextIcon,
    MicrophoneIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { analysisService } from '@/lib/services/analysisService';
import { Analysis } from '@/lib/types';
import VoiceInterviewSimulator from '@/components/coach/VoiceInterviewSimulator';
import AccentTrainer from '@/components/coach/AccentTrainer';

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
        analysisId?: string;
        resumeId?: string;
        language?: string;
    };
}

interface CoachSession {
    id: string;
    userId: string;
    type: 'resume_review' | 'interview_prep' | 'career_guidance';
    language: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

const formatMessage = (content: string) => {
    // Replace \n\n with line breaks for paragraphs
    return content.split('\n\n').map((paragraph, i) => (
        <p key={i} className="mb-3">{paragraph}</p>
    ));
};

export default function CoachPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'resume_review' | 'interview_prep' | 'career_guidance'>('resume_review');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceEmotions, setVoiceEmotions] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (user) {
            fetchAnalyses();
            initializeSession();
        }
    }, [user, selectedMode, selectedLanguage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const fetchAnalyses = async () => {
        try {
            const token = await user.getIdToken();
            const response = await analysisService.getAnalysisList(token);
            if (response.success) {
                setAnalyses(response.data);
            }
        } catch (error) {
            console.error('Error fetching analyses:', error);
        }
    };

    const initializeSession = async () => {
        const welcomeMessages = {
            resume_review: {
                English: "Hello! I'm your AI Career Coach. I'm here to help you improve your resume and make it stand out to Canadian employers. I can review your resume analysis and provide specific suggestions for improvement. What would you like to focus on?",
                French: "Bonjour! Je suis votre coach de carrière IA. Je suis ici pour vous aider à améliorer votre CV et le faire ressortir auprès des employeurs canadiens. Que souhaitez-vous améliorer?",
                Spanish: "¡Hola! Soy tu coach de carrera IA. Estoy aquí para ayudarte a mejorar tu CV y hacerlo destacar ante los empleadores canadienses. ¿En qué te gustaría enfocarte?",
                Mandarin: "你好！我是你的AI职业教练。我在这里帮助你改进简历，让它在加拿大雇主面前脱颖而出。你想重点改进什么？",
                Hindi: "नमस्ते! मैं आपका AI करियर कोच हूं। मैं यहां आपकी रिज्यूमे को बेहतर बनाने और कनाडाई नियोक्ताओं के सामने इसे उभारने में मदद करने के लिए हूं। आप किस पर ध्यान केंद्रित करना चाहते हैं?",
                Punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਕੈਰੀਅਰ ਕੋਚ ਹਾਂ। ਮੈਂ ਇੱਥੇ ਤੁਹਾਡੀ ਰਿਜ਼ਿਊਮੇ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਅਤੇ ਕੈਨੇਡੀਅਨ ਨਿਯੋਜਕਾਂ ਦੇ ਸਾਹਮਣੇ ਇਸਨੂੰ ਉਭਾਰਨ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ 'ਤੇ ਧਿਆਨ ਕੇਂਦਰਿਤ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?"
            },
            interview_prep: {
                English: "Great! Let's prepare you for Canadian job interviews. I can conduct mock interviews, provide feedback on your responses, and help you understand Canadian workplace culture. Are you ready to start?",
                French: "Parfait! Préparons-vous pour les entretiens d'embauche canadiens. Je peux mener des entretiens simulés et vous donner des conseils. Êtes-vous prêt à commencer?",
                Spanish: "¡Excelente! Vamos a prepararte para las entrevistas de trabajo canadienses. Puedo realizar entrevistas simuladas y darte consejos. ¿Estás listo para comenzar?",
                Mandarin: "太好了！让我们为加拿大工作面试做准备。我可以进行模拟面试并给你建议。你准备好开始了吗？",
                Hindi: "बहुत अच्छा! आइए कनाडाई नौकरी के साक्षात्कार के लिए तैयार करें। मैं मॉक इंटरव्यू कर सकता हूं और आपको सलाह दे सकता हूं। क्या आप शुरू करने के लिए तैयार हैं?",
                Punjabi: "ਬਹੁਤ ਵਧੀਆ! ਆਓ ਤੁਹਾਨੂੰ ਕੈਨੇਡੀਅਨ ਨੌਕਰੀ ਦੇ ਇੰਟਰਵਿਊ ਲਈ ਤਿਆਰ ਕਰੀਏ। ਮੈਂ ਮੌਕ ਇੰਟਰਵਿਊ ਕਰ ਸਕਦਾ ਹਾਂ ਅਤੇ ਤੁਹਾਨੂੰ ਸਲਾਹ ਦੇ ਸਕਦਾ ਹਾਂ। ਕੀ ਤੁਸੀਂ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਤਿਆਰ ਹੋ?"
            },
            career_guidance: {
                English: "Welcome to career guidance! I'm here to help you navigate the Canadian job market, understand career paths, and develop your professional skills. What career questions do you have?",
                French: "Bienvenue au conseil en carrière! Je suis ici pour vous aider à naviguer sur le marché du travail canadien. Quelles questions de carrière avez-vous?",
                Spanish: "¡Bienvenido a la orientación profesional! Estoy aquí para ayudarte a navegar por el mercado laboral canadiense. ¿Qué preguntas de carrera tienes?",
                Mandarin: "欢迎来到职业指导！我在这里帮助你了解加拿大就业市场。你有什么职业问题吗？",
                Hindi: "करियर मार्गदर्शन में आपका स्वागत है! मैं यहां कनाडाई नौकरी बाजार को समझने में आपकी मदद करने के लिए हूं। आपके पास क्या करियर प्रश्न हैं?",
                Punjabi: "ਕੈਰੀਅਰ ਮਾਰਗਦਰਸ਼ਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਮੈਂ ਇੱਥੇ ਕੈਨੇਡੀਅਨ ਨੌਕਰੀ ਬਾਜ਼ਾਰ ਨੂੰ ਸਮਝਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ। ਤੁਹਾਡੇ ਕੋਲ ਕੀ ਕੈਰੀਅਰ ਪ੍ਰਸ਼ਨ ਹਨ?"
            }
        };

        const welcomeMessage = welcomeMessages[selectedMode][selectedLanguage as keyof typeof welcomeMessages[typeof selectedMode]] || welcomeMessages[selectedMode].English;

        setMessages([{
            id: '1',
            type: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
            metadata: { language: selectedLanguage }
        }]);
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date(),
            metadata: { language: selectedLanguage }
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: inputMessage,
                    mode: selectedMode,
                    language: selectedLanguage,
                    analysisId: selectedAnalysis,
                    conversationHistory: messages.map(m => ({
                        role: m.type === 'user' ? 'user' : 'assistant',
                        content: m.content
                    }))
                })
            });

            const result = await response.json();

            if (result.success) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    type: 'assistant',
                    content: result.data.response,
                    timestamp: new Date(),
                    metadata: { language: selectedLanguage }
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                toast.error(result.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'resume_review': return <DocumentTextIcon className="w-5 h-5" />;
            case 'interview_prep': return <AcademicCapIcon className="w-5 h-5" />;
            case 'career_guidance': return <BriefcaseIcon className="w-5 h-5" />;
            default: return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
        }
    };

    const handleVoiceTranscript = (transcript: string) => {
        setVoiceTranscript(transcript);
        // Add the transcript to the chat
        if (transcript.trim()) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'user',
                content: transcript,
                timestamp: new Date()
            }]);
        }
    };

    const handleEmotionUpdate = (emotions: any) => {
        setVoiceEmotions(emotions);
        // If there's feedback, add it to the chat
        if (emotions.feedback) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'assistant',
                content: emotions.feedback,
                timestamp: new Date()
            }]);
        }
    };

    const handleTranscriptUpdate = (text: string, type: 'user' | 'assistant') => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type,
            content: text,
            timestamp: new Date()
        }]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                            <SparklesIcon className="w-10 h-10 text-red-600" />
                            AI Career Coach
                        </h1>
                        <p className="text-xl text-gray-600">
                            Your personalized career assistant for resume improvement and interview preparation
                        </p>
                    </div>

                    {/* Mode Selection */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Session Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {[
                                { id: 'resume_review', label: 'Resume Review', icon: DocumentTextIcon },
                                { id: 'interview_prep', label: 'Interview Prep', icon: AcademicCapIcon },
                                { id: 'career_guidance', label: 'Career Guidance', icon: BriefcaseIcon }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setSelectedMode(mode.id as any);
                                        setIsVoiceMode(false);
                                        setVoiceTranscript('');
                                        setVoiceEmotions(null);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all ${selectedMode === mode.id
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <mode.icon className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-medium">{mode.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Language Selection */}
                        <div className="flex items-center gap-4 mb-4">
                            <GlobeAltIcon className="w-5 h-5 text-gray-600" />
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="English">English</option>
                                <option value="French">French</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Mandarin">Mandarin</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Punjabi">Punjabi</option>
                            </select>
                        </div>

                        {/* Resume Analysis Selection */}
                        {selectedMode === 'resume_review' && analyses.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Resume Analysis (Optional)
                                </label>
                                <select
                                    value={selectedAnalysis}
                                    onChange={(e) => setSelectedAnalysis(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">No analysis selected</option>
                                    {analyses.map((analysis) => (
                                        <option key={analysis.id} value={analysis.id}>
                                            {analysis.resumeId} - {analysis.status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Voice Mode Toggle (only show in interview prep mode) */}
                    {selectedMode === 'interview_prep' && (
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => setIsVoiceMode(!isVoiceMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isVoiceMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                                Voice Mode
                            </button>
                        </div>
                    )}

                    {/* Chat Interface */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                            <div className="flex items-center gap-3">
                                {getModeIcon(selectedMode)}
                                <div>
                                    <h3 className="font-semibold">
                                        {selectedMode === 'resume_review' && 'Resume Review Coach'}
                                        {selectedMode === 'interview_prep' && 'Interview Preparation Coach'}
                                        {selectedMode === 'career_guidance' && 'Career Guidance Coach'}
                                    </h3>
                                    <p className="text-sm opacity-90">Language: {selectedLanguage}</p>
                                </div>
                            </div>
                        </div>

                        {/* Voice Interview Simulator */}
                        {selectedMode === 'interview_prep' && isVoiceMode && (
                            <VoiceInterviewSimulator
                                isActive={isVoiceMode}
                                onTranscriptUpdate={handleTranscriptUpdate}
                            />
                        )}

                        {/* Messages */}
                        {!isVoiceMode &&
                            <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {message.type === 'user' ? (
                                                <p className="text-sm">{message.content}</p>
                                            ) : (
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {formatMessage(message.content)}
                                                </div>
                                            )}
                                            <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-red-200' : 'text-gray-500'
                                                }`}>
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm">Typing...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        }

                        {/* Input */}
                        {!isVoiceMode && (
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex gap-2">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                        rows={1}
                                        disabled={isTyping}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || isTyping}
                                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 