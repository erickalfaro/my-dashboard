"use client";

import { supabase } from "../lib/supabase";

export const AuthButtons: React.FC = () => {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/`,
      },
    });
    if (error) console.error("Error signing in with Google:", error);
  };

  const signInWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/`,
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