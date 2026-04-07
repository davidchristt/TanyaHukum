"use client";

import { useRouter } from "next/navigation";
import SubscriptionList from "@/components/features/subscription/SubscriptionList";

export default function SubscriptionPage() {
  const router = useRouter();

  // mock user (tetap dipakai)
  const mockLoggedInUser = {
    name: "David",
    email: "david@student.unpad.ac.id",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm"
    >
      {/* WRAPPER */}
      <div className="relative">
        
        {/* CONTENT */}
        <SubscriptionList user={mockLoggedInUser} />

        {/* CLOSE BUTTON */}
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