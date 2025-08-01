'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth/AuthContext';
import UserProfile from '@/components/auth/UserProfile';
import LoginButton from '@/components/auth/LoginButton';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Upload Resume', href: '/upload' },
        { name: 'About', href: '#about' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-red-600">
                        TalentUnlock
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        {isOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* <Link href="/jobs" className="text-gray-600 hover:text-red-600">
                            Browse Jobs
                        </Link> */}

                        {user ? (
                            <>
                                <Link
                                    href="/upload"
                                    className="text-gray-600 hover:text-red-600"
                                >
                                    Upload Resume
                                </Link>
                                <Link href="/analysis" className="text-gray-600 hover:text-red-600">
                                    Analysis
                                </Link>
                                <Link href="/roadmap" className="text-gray-600 hover:text-red-600">
                                    Roadmap
                                </Link>
                                <Link href="/coach" className="text-gray-600 hover:text-red-600">
                                    AI Coach
                                </Link>
                                <UserProfile />
                            </>
                        ) : (
                            <LoginButton />
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0 }}
                    className="md:hidden overflow-hidden"
                >
                    <div className="py-4 space-y-4">
                        {user ? (
                            <>
                                <Link
                                    href="/upload"
                                    className="block text-gray-600 hover:text-red-600"
                                >
                                    Upload Resume
                                </Link>
                                <Link href="/roadmap" className="block text-gray-600 hover:text-red-600">
                                    Roadmap
                                </Link>
                                <Link href="/coach" className="block text-gray-600 hover:text-red-600">
                                    AI Coach
                                </Link>
                                <UserProfile />
                            </>
                        ) : (
                            <LoginButton />
                        )}
                        <Link href="/jobs" className="block text-gray-600 hover:text-red-600">
                            Browse Jobs
                        </Link>
                        <Link href="/analysis" className="block text-gray-600 hover:text-red-600">
                            Analysis
                        </Link>
                    </div>
                </motion.div>
            </div>
        </nav>
    );
};

export default Navigation;
