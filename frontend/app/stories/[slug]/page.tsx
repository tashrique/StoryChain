"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import StoryDisplay from "../../components/StoryDisplay";
import NewLineInput from "../../components/NewLineInput";

// Fix API_URL to handle trailing slashes correctly
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

interface Story {
  _id: string;
  title: string;
  description: string;
  starterText: string;
}

interface StoryLine {
  _id: string;
  text: string;
  timestamp: string;
  isStarterText: boolean;
}

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [storyLines, setStoryLines] = useState<StoryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStory();
  }, [params.slug]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setCooldown(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown, cooldownTime]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories/${params.slug}`);

      if (response.status === 404) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch story");
      }

      const data = await response.json();
      setStory(data.story);
      setStoryLines(data.lines);
      setError("");
    } catch (err) {
      console.error("Error fetching story:", err);
      setError("Failed to load the story. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLine = async (text: string) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/stories/${params.slug}/lines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (response.status === 429) {
        // Rate limited
        setCooldown(true);
        setCooldownTime(60); // 1 minute cooldown
        setError("Please wait one minute before adding another line.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit line");
      }

      // Refresh the story after successful submission
      await fetchStory();

      // Set cooldown after successful submission
      setCooldown(true);
      setCooldownTime(60); // 1 minute cooldown
    } catch (err: Error | unknown) {
      console.error("Error submitting line:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit your line. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Stories
          </button>

          {story && (
            <>
              <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {story.description}
              </p>
            </>
          )}
        </motion.div>

        {error && (
          <div className="w-full max-w-2xl mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <StoryDisplay storyLines={storyLines} loading={loading} />

        <NewLineInput
          onSubmit={handleSubmitLine}
          isSubmitting={submitting}
          cooldownActive={cooldown}
          remainingTime={cooldownTime}
        />
      </div>
    </div>
  );
}
