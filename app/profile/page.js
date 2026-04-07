"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ProfileCard from "@/components/features/profile/ProfileCard";
import ProfileForm from "@/components/features/profile/ProfileForm";
import { useState } from "react";

export default function ProfilePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen bg-[#eaf1fb] p-6 flex gap-4">

      {/* SIDEBAR */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">

        {/* HEADER */}
        <div className="border-b border-gray-200">
          <Header />
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex items-center justify-center px-6 py-6">

          <div className="w-full max-w-xl space-y-4">

            <ProfileCard />
            <ProfileForm />

          </div>

        </div>
      </div>

    </div>
  );
}