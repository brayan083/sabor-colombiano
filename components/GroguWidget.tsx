"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const IMAGES = [
    "/img/grogu.png?v=2",
    "/img/grogu2.png" // User added second image
];

const GroguWidget = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Only show on specific pages: Home (/), Catalog (/catalog), Cart (/cart), and Product Details (/product/*)
    const exactPaths = ['/', '/catalog', '/cart'];
    const shouldRender = exactPaths.includes(pathname) || pathname.startsWith('/product/');

    useEffect(() => {
        if (!shouldRender) return;

        // Loop to show/hide Grogu
        const loop = () => {
            // Show Grogu
            setIsVisible(true);

            // Hide after 4 seconds (time to slide out, wave, and slide back)
            setTimeout(() => {
                setIsVisible(false);

                // Switch to next image after it hides (wait a bit for transition to finish)
                setTimeout(() => {
                    setCurrentImageIndex(prev => (prev + 1) % IMAGES.length);
                }, 1000);
            }, 4000);
        };

        // Initial delay
        const initialTimer = setTimeout(() => {
            loop();
            // Repeat loop every 10 seconds (more frequent)
            const interval = setInterval(loop, 10000);
            return () => clearInterval(interval);
        }, 1000);

        return () => clearTimeout(initialTimer);
    }, [shouldRender]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed bottom-20 right-0 z-40 transition-transform duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0' : 'translate-x-full'
                }`}
            style={{ width: '160px', height: '160px' }} // Increased size
        >
            <div className={`w-full h-full relative ${isVisible ? 'animate-wiggle' : ''}`}>
                <Image
                    src={IMAGES[currentImageIndex]}
                    alt="Baby Yoda Waving"
                    fill
                    className="object-contain drop-shadow-lg"
                    priority
                />
            </div>
        </div>
    );
};

export default GroguWidget;
