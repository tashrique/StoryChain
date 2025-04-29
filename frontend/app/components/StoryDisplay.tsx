"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StoryLine {
  _id: string;
  text: string;
  timestamp: string;
  isStarterText?: boolean;
}

interface StoryDisplayProps {
  storyLines: StoryLine[];
  loading: boolean;
}

export default function StoryDisplay({
  storyLines,
  loading,
}: StoryDisplayProps) {
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new lines are added
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [storyLines]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl p-4 bg-white/5 rounded-lg shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (storyLines.length === 0) {
    return (
      <div className="w-full max-w-2xl p-6 bg-white/5 rounded-lg shadow-lg text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          This story is just beginning. Be the first to add a line!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl p-4 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg overflow-y-auto max-h-[60vh]">
      <div className="space-y-4">
        {storyLines.map((line, index) => (
          <motion.div
            key={line._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`pb-4 ${
              index < storyLines.length - 1
                ? "border-b border-gray-200 dark:border-gray-800"
                : ""
            }`}
          >
            <div
              className={`relative group ${
                line.isStarterText
                  ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4"
                  : ""
              }`}
            >
              {line.isStarterText && (
                <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Opening
                </div>
              )}
              <p className="text-base sm:text-lg break-words leading-relaxed">
                {line.text}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(line.timestamp).toLocaleString()}</span>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <button
                    className="hover:text-blue-500 transition-colors"
                    onClick={() => {
                      // Copy text to clipboard
                      navigator.clipboard.writeText(line.text);
                    }}
                    title="Copy text"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </button>
                  <span>•</span>
                  <span>Line {index + 1}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div ref={storyEndRef} />
    </div>
  );
}
