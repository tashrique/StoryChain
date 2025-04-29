"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NewLineInputProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
  cooldownActive: boolean;
  remainingTime?: number;
}

export default function NewLineInput({
  onSubmit,
  isSubmitting,
  cooldownActive,
  remainingTime = 0,
}: NewLineInputProps) {
  const [text, setText] = useState("");
  const [sentenceCount, setSentenceCount] = useState(0);
  const maxLength = 280;

  useEffect(() => {
    // Count sentences in the text
    const count = (text.match(/[.!?](?:\s|$)(?!(?:[a-z]|[A-Z]){1,2}\.)/g) || [])
      .length;
    setSentenceCount(count);
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      text.trim() &&
      !isSubmitting &&
      !cooldownActive &&
      sentenceCount >= 1 &&
      sentenceCount <= 2
    ) {
      await onSubmit(text);
      setText("");
    }
  };

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getInputStatus = () => {
    if (!text.trim()) return "empty";
    if (sentenceCount === 0) return "no-sentences";
    if (sentenceCount > 2) return "too-many-sentences";
    if (sentenceCount === 1) return "valid-one";
    if (sentenceCount === 2) return "valid-two";
    return "invalid";
  };

  const statusMessages = {
    empty: "Start typing your contribution...",
    "no-sentences": "Add at least one complete sentence",
    "too-many-sentences": "Maximum 2 sentences allowed",
    "valid-one": "✓ One sentence - Good to go!",
    "valid-two": "✓ Two sentences - Perfect!",
    invalid: "Something is wrong with your input",
  };

  const status = getInputStatus();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-4">
      <div className="relative">
        <textarea
          className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border rounded-lg shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
            cooldownActive || isSubmitting
              ? "border-gray-300 dark:border-gray-700 cursor-not-allowed"
              : status === "valid-one" || status === "valid-two"
              ? "border-green-500 dark:border-green-500"
              : status === "too-many-sentences"
              ? "border-red-500 dark:border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
          placeholder="Add your line to the story..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting || cooldownActive}
          maxLength={maxLength}
          rows={2}
        />
        <motion.div
          className="absolute bottom-2 right-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span
            className={`${
              text.length > maxLength * 0.9 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {text.length}/{maxLength}
          </span>
        </motion.div>
      </div>

      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-sm ${
            status === "valid-one" || status === "valid-two"
              ? "text-green-600 dark:text-green-400"
              : status === "too-many-sentences"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {statusMessages[status]}
        </motion.div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {cooldownActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-amber-500 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatRemainingTime(remainingTime)}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={
              !text.trim() ||
              isSubmitting ||
              cooldownActive ||
              sentenceCount < 1 ||
              sentenceCount > 2
            }
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              !text.trim() ||
              isSubmitting ||
              cooldownActive ||
              sentenceCount < 1 ||
              sentenceCount > 2
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? "Submitting..." : "Add Line"}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
