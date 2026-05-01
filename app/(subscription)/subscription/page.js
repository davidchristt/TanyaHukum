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
      console.log("USER FROM STORAGE:", parsed); // debug
      setUser(parsed);
    }
  }, []);

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm"
    >
      <div className="relative">
        
        <SubscriptionList user={user} />

        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 w-10 h-10 rounded-full 
          bg-white shadow flex items-center justify-center hover:bg-gray-100"
        >
          ✕
        </button>

      </div>
    </div>
  );
}