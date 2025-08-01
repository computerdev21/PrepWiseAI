'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { motion } from 'framer-motion';

export default function LoginButton() {
    const { signInWithGoogle } = useAuth();

    return (
        <motion.button
            onClick={signInWithGoogle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-3"
        >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
        </motion.button>
    );
} 