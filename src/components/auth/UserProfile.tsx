'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { motion } from 'framer-motion';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export default function UserProfile() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
                {user.photoURL ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                        <Image
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            width={32}
                            height={32}
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {user.displayName?.charAt(0) || 'U'}
                        </span>
                    </div>
                )}
                <span className="text-gray-700 font-medium">
                    {user.displayName || 'User'}
                </span>
                <motion.svg
                    className="w-4 h-4 text-gray-600 ui-open:rotate-180 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </MenuButton>

            <MenuItems
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 z-50"
                style={{
                    right: 'auto',
                    left: '0',
                    transform: 'translateX(-25%)'
                }}
            >
                <div className="px-1 py-1">
                    <div className="px-3 py-2 text-sm text-gray-500">
                        {user.email}
                    </div>
                </div>
                <div className="px-1 py-1">
                    <MenuItem
                        as={Link}
                        href="/profile"
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 ui-active:bg-red-50 ui-active:text-red-600"
                    >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile
                    </MenuItem>
                    <MenuItem
                        as={Link}
                        href="/profile/gta-insights"
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 ui-active:bg-red-50 ui-active:text-red-600"
                    >
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        GTA Insights
                    </MenuItem>
                    <MenuItem
                        as="button"
                        onClick={logout}
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 ui-active:bg-red-50 ui-active:text-red-600"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}