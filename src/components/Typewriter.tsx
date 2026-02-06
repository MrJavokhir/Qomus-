'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    showCursor?: boolean;
    trigger?: boolean;
    onComplete?: () => void;
}

export default function Typewriter({
    text,
    speed = 50,
    delay = 0,
    className = "",
    showCursor = true,
    trigger = true,
    onComplete
}: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!trigger) return;

        const startTimeout = setTimeout(() => {
            setIsStarted(true);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [delay, trigger]);

    useEffect(() => {
        if (!isStarted) return;

        // Reset if text changes
        if (displayedText.length > text.length && !text.startsWith(displayedText)) {
            setDisplayedText('');
            return;
        }

        let currentIndex = displayedText.length;
        if (currentIndex >= text.length) {
            if (!isComplete) {
                setIsComplete(true);
                if (onComplete) onComplete();
            }
            return;
        }

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [isStarted, text, speed, onComplete, displayedText, isComplete]);

    // Reset when text changes drastically or trigger resets (optional, but good for lang switch)
    useEffect(() => {
        setDisplayedText('');
        setIsStarted(false);
        setIsComplete(false);
    }, [text]);

    return (
        <span className={className}>
            {displayedText}
            {showCursor && !isComplete && isStarted && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
                />
            )}
        </span>
    );
}
