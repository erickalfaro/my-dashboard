"use client";

import { supabase } from "../lib/supabase";

export const AuthButtons: React.FC = () => {
  const getBaseUrl = () => {
    // Use window.location.origin in the browser, fallback to NEXT_PUBLIC_BASE_URL
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    console.log("AuthButtons baseUrl:", baseUrl); // Debug
    return baseUrl;
  };

  const signInWithGoogle = async () => {
    const baseUrl = getBaseUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?next=/`,
      },
    });
    if (error) console.error("Error signing in with Google:", error);
  };

  const signInWithTwitter = async () => {
    const baseUrl = getBaseUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?next=/`,
      },
    });
    if (error) console.error("Error signing in with Twitter:", error);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={signInWithGoogle}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Login with Google
      </button>
      <button
        onClick={signInWithTwitter}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Login with Twitter
      </button>
    </div>
  );
};