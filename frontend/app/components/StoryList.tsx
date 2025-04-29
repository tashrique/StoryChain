"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function StoryList({ stories, onCreateStory }: StoryListProps) {
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          onClick={onCreateStory}
          className="h-48 rounded-xl border-2 border-dashed border-blue-500 hover:border-blue-600 flex items-center justify-center p-6 group transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
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

        {stories.map((story) => (
          <motion.div
            key={story._id}
            onHoverStart={() => setHoveredStory(story._id)}
            onHoverEnd={() => setHoveredStory(null)}
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <Link href={`/stories/${story.slug}`}>
              <div className="h-48 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-6 cursor-pointer overflow-hidden relative group">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-3 mb-4">
                    {story.description}
                  </p>
                  <div className="absolute bottom-4 left-6 right-6">
                    <p className="text-xs text-white/60">
                      Last activity: {formatLastActivity(story.lastActivityAt)}
                    </p>
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
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
