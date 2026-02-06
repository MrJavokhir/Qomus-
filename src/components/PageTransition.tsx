'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext, useRef } from 'react';

// FrozenRouter helps preserve the previous route's content during the exit animation
// differently from just AnimatePresence which might lose context
function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext);
    const frozen = useRef(context).current;

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{
                    y: 40,
                    opacity: 0,
                    filter: 'blur(10px)',
                    scale: 1
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    transition: {
                        duration: 0.7,
                        ease: [0.34, 1.56, 0.64, 1], // Custom bounce easing
                        staggerChildren: 0.05
                    }
                }}
                exit={{
                    y: -20,
                    opacity: 0,
                    scale: 0.95,
                    filter: 'blur(5px)',
                    transition: {
                        duration: 0.4,
                        ease: 'easeInOut'
                    }
                }}
                className="w-full h-full"
            >
                <FrozenRouter>{children}</FrozenRouter>
            </motion.div>
        </AnimatePresence>
    );
}
