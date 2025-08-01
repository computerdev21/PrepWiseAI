'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">TalentUnlock</h3>
                        <p className="text-gray-400">
                            Bridging international talent with Canadian opportunities through AI-powered skill mapping.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/upload" className="text-gray-400 hover:text-white transition-colors">
                                    Upload Resume
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse-jobs" className="text-gray-400 hover:text-white transition-colors">
                                    Browse Jobs
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <p className="text-gray-400">
                            Questions? Reach out to us at{' '}
                            <a href="mailto:support@talentunlock.ai" className="text-red-400 hover:text-red-300">
                                support@talentunlock.ai
                            </a>
                        </p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TalentUnlock. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
