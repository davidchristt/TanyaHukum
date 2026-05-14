"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionList from "@/components/features/subscription/SubscriptionList";

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
  }, []);

  if (!user) return null;

  return (
    <main>
      <SubscriptionList user={user} />
      
      {/* Floating Close Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 right-6 z-[10001] w-10 h-10 rounded-full 
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl flex items-center justify-center 
        hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 
        border border-white/20 dark:border-slate-700/50 transition-all active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </main>
  );
}