import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoContext } from '../../contexts/DemoContext';

export const DemoCursor: React.FC = () => {
  const { cursor } = useDemoContext();

  return (
    <AnimatePresence>
      {cursor.visible && (
        <motion.div
          className="pointer-events-none fixed z-[9998]"
          style={{ left: 0, top: 0 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: cursor.x,
            y: cursor.y,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
        >
          <div className="relative -translate-x-1 -translate-y-1">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
              aria-hidden
            >
              <path
                d="M5.5 3.5L18.5 11.5L12.5 13.5L10.5 19.5L5.5 3.5Z"
                fill="#0f172a"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {cursor.clicking && (
              <motion.span
                className="absolute left-2 top-2 h-8 w-8 rounded-full border-2 border-indigo-400"
                initial={{ scale: 0.4, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
