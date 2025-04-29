"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Story {
  _id: string;
  title: string;
  slug: string;
  description: string;
  lastActivityAt: string;
}

interface StoryListProps {
  stories: Story[];
  onCreateStory: () => void;
}

// Array of vibrant gradient combinations
const gradients = [
  "from-pink-500 to-purple-600",
  "from-blue-500 to-teal-500",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-purple-500",
  "from-yellow-500 to-orange-600",
  "from-teal-500 to-blue-600",
  "from-red-500 to-pink-600",
  "from-purple-500 to-indigo-600",
  "from-emerald-500 to-green-600",
];

// Function to get a random gradient
const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export default function StoryList({ stories, onCreateStory }: StoryListProps) {
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);
  const [storyGradients, setStoryGradients] = useState<{
    [key: string]: string;
  }>({});

  // Sort stories by latest activity and assign random gradients
  useEffect(() => {
    const gradientMap: { [key: string]: string } = {};
    stories.forEach((story) => {
      if (!storyGradients[story._id]) {
        gradientMap[story._id] = getRandomGradient();
      }
    });
    setStoryGradients((prev) => ({ ...prev, ...gradientMap }));
  }, [stories]);

  const formatLastActivity = (date: string) => {
    const now = new Date();
    const activity = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - activity.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Sort stories by lastActivityAt
  const sortedStories = [...stories].sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          onClick={onCreateStory}
          className="h-48 rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-400 flex items-center justify-center p-6 group transition-all hover:shadow-xl hover:shadow-blue-500/20 relative overflow-hidden bg-white/5 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-all">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-600 mb-1">
              Start a New Story
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new collaborative story
            </p>
          </div>
        </motion.button>

        <AnimatePresence>
          {sortedStories.map((story, index) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredStory(story._id)}
              onHoverEnd={() => setHoveredStory(null)}
              className="relative"
            >
              <Link href={`/stories/${story.slug}`}>
                <motion.div
                  className={`h-48 rounded-xl bg-gradient-to-br ${
                    storyGradients[story._id]
                  } p-6 cursor-pointer overflow-hidden relative group backdrop-blur-sm bg-opacity-20`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />

                  <div className="relative z-10">
                    <motion.h3
                      className="text-xl font-bold text-white mb-2 line-clamp-1"
                      initial={{ y: 0 }}
                      whileHover={{ y: -2 }}
                    >
                      {story.title}
                    </motion.h3>
                    <p className="text-white/90 text-sm line-clamp-3 mb-4 group-hover:text-white transition-colors">
                      {story.description}
                    </p>
                    <div className=" bottom-1 left-6 right-6 flex justify-between items-center">
                      <p className="text-xs text-white/80 group-hover:text-white transition-colors">
                        Last activity:{" "}
                        {formatLastActivity(story.lastActivityAt)}
                      </p>
                      <motion.div
                        className="flex items-center space-x-1 text-white/80"
                        initial={{ opacity: 0, x: 10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                      >
                        <span className="text-xs">Read more</span>
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white"
                    initial={{ width: 0 }}
                    animate={{
                      width: hoveredStory === story._id ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
