// components/GenAISummary.tsx
"use client";

import React, { useEffect, useState } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
import { PostData } from "../types";
import { SUMMARY_PROMPT } from "../lib/constants"; // Import the prompt

interface GenAISummaryProps {
  postsData: PostData[];
  loading: boolean;
  selectedStock: string | null;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const GenAISummary: React.FC<GenAISummaryProps> = ({ postsData, loading, selectedStock }) => {
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateSummary = async () => {
      if (!postsData.length || !selectedStock) {
        setSummary(`No posts available to summarize for ${selectedStock || "no ticker"}.`);
        return;
      }

      setSummaryLoading(true);
      const combinedText = postsData.map((post) => post.text).join(" ");
      const promptWithTicker = SUMMARY_PROMPT.replace(/{ticker}/g, selectedStock);

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: promptWithTicker,
            },
            {
              role: "user",
              content: combinedText,
            },
          ],
        });

        const summaryText = completion.choices[0]?.message?.content || "Failed to generate summary.";
        setSummary(summaryText);
      } catch (error) {
        console.error("Error generating summary:", error);
        setSummary("Error generating summary.");
      } finally {
        setSummaryLoading(false);
      }
    };

    generateSummary();
  }, [postsData, selectedStock]);

  return (
    <div className="mt-6 GenAISummary">
      <div className="container-header">
        GenAI Summary {loading || summaryLoading ? "(Loading...)" : ""}
      </div>
      <div className="container-content p-4 relative">
        {summaryLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--container-bg)] bg-opacity-75">
            <div className="spinner"></div>
          </div>
        )}
        <div className="w-full h-full overflow-auto text-sm GenAISummary-content">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};