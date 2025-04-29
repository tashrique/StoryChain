"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    starterText: string;
  }) => Promise<void>;
}

export default function CreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [starterText, setStarterText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({ title, description, starterText });
      setTitle("");
      setDescription("");
      setStarterText("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Start a New Story</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="Enter a captivating title..."
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="What's this story about?"
                  rows={3}
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="starterText"
                >
                  Opening Lines (1-3 sentences)
                </label>
                <textarea
                  id="starterText"
                  value={starterText}
                  onChange={(e) => setStarterText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="Once upon a time..."
                  rows={4}
                  maxLength={280}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {starterText.length}/280 characters
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-white ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create Story"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
