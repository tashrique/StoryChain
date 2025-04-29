"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import StoryList from "./components/StoryList";
import CreateStoryModal from "./components/CreateStoryModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

interface Story {
  _id: string;
  title: string;
  slug: string;
  description: string;
  lastActivityAt: string;
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data);
      setError("");
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to load stories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (data: {
    title: string;
    description: string;
    starterText: string;
  }) => {
    const response = await fetch(`${API_URL}/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create story");
    }

    await fetchStories();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />

        {error && (
          <div className="w-full max-w-2xl mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <StoryList
            stories={stories}
            onCreateStory={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStory}
      />
    </div>
  );
}
