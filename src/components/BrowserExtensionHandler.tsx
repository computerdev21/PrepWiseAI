'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BrowserExtensionHandler() {
    const pathname = usePathname();

    // Remove Grammarly attributes after initial render
    useEffect(() => {
        const body = document.querySelector('body');
        if (body) {
            body.removeAttribute('data-new-gr-c-s-check-loaded');
            body.removeAttribute('data-gr-ext-installed');
        }
    }, [pathname]); // Re-run when route changes

    return null; // This component doesn't render anything
} 