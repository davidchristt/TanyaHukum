"use client";

import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import ProfileForm from "./ProfileForm";

export default function ProfileModal() {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={() => router.back()}
    >
      <div
        className="w-full max-w-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <ProfileCard />
        <ProfileForm />
      </div>
    </div>
  );
}