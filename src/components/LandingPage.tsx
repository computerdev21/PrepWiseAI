'use client'
import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpTrayIcon,
    ArrowRightIcon,
    UsersIcon,
    BriefcaseIcon,
    CursorArrowRaysIcon,
    CpuChipIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const LandingPage = () => {
    const successStories = [
        { name: "Ahmed", from: "Mechanical Engineer", to: "Senior Software Developer", company: "Shopify", flag: "🇸🇾" },
        { name: "Maria", from: "School Teacher", to: "Product Manager", company: "RBC", flag: "🇵🇭" },
        { name: "Raj", from: "Marketing Manager", to: "Data Scientist", company: "Google", flag: "🇮🇳" }
    ];

    const steps = [
        { icon: ArrowUpTrayIcon, title: "Upload Resume", desc: "Drop your international resume" },
        { icon: CpuChipIcon, title: "AI Analysis", desc: "Our AI maps your skills to Canadian standards" },
        { icon: BriefcaseIcon, title: "Roadmap", desc: "Our AI coach helps you improve your interview skills" },
        { icon: AcademicCapIcon, title: "AI Coach", desc: "Our AI coach helps you improve your interview skills" },
        { icon: CursorArrowRaysIcon, title: "Get Matched", desc: "Find jobs that value your experience. (Coming Soon)" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => {
                    // Create a deterministic pattern using the index
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    const left = (col * 25) + ((row % 2) * 12.5); // Offset every other row
                    const top = row * 25;

                    return (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-red-200 rounded-full opacity-30"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -100, 0],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 10 + i * 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Hero Section */}
            <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.h1
                        className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 via-red-500 to-blue-600 bg-clip-text text-transparent"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Unlock Your
                        <span className="block">Canadian Career</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        AI-powered platform that translates your international experience
                        into <span className="font-semibold text-red-600">Canadian opportunities</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link href="/upload">
                            <button className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                <span className="flex items-center gap-3">
                                    <ArrowUpTrayIcon className="w-5 h-5" />
                                    Upload Your Resume
                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    {[
                        { icon: CursorArrowRaysIcon, number: "87%", label: "Success Rate" },
                        { icon: BriefcaseIcon, number: "2.3x", label: "Salary Increase" },
                        { icon: UsersIcon, number: "15K+", label: "Newcomers Helped" }
                    ].map((stat, i) => {
                        const IconComponent = stat.icon;
                        return (
                            <motion.div
                                key={i}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20"
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IconComponent className="w-8 h-8 text-red-600 mx-auto mb-3" />
                                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>


            {/* How It Works */}
            <div className="relative z-10 py-16">
                <div className="container mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-12 text-gray-800"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        How It Works ⚡
                    </motion.h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mx-auto">
                        {steps.map((step, i) => {
                            const IconComponent = step.icon;
                            return (
                                <React.Fragment key={i}>
                                    <motion.div
                                        className="flex flex-col items-center text-center max-w-xs"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                                        <p className="text-gray-600">{step.desc}</p>
                                    </motion.div>

                                    {i < steps.length - 1 && (
                                        <motion.div
                                            className="hidden md:block"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.3 + 0.5 }}
                                        >
                                            <ArrowRightIcon className="w-8 h-8 text-red-400" />
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Success Stories */}
            <div className="relative z-10 bg-white/50 backdrop-blur-sm py-16">
                <div className="container mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-12 text-gray-800"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Success Stories 🌟 (mock data)
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {successStories.map((story, i) => (
                            <motion.div
                                key={i}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                            >
                                <div className="text-2xl mb-3">{story.flag}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{story.name}</h3>
                                <div className="space-y-2 mb-4">
                                    <div className="text-gray-600">{story.from}</div>
                                    <div className="flex items-center gap-2">
                                        <ArrowRightIcon className="w-4 h-4 text-red-500" />
                                        <span className="font-semibold text-green-600">{story.to}</span>
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium">{story.company}</div>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    {[...Array(5)].map((_, j) => (
                                        <span key={j}>⭐</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 bg-gradient-to-r from-red-600 to-blue-600 py-16">
                <motion.div
                    className="container mx-auto px-6 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Career? 🚀
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful newcomers who found their dream jobs in Canada
                    </p>
                    <Link href="/upload">
                        <motion.button
                            className="bg-white text-red-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Your Journey Today
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;