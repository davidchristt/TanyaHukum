"use client";

import { useState } from "react";
import Sidebar from "@/components/features/chat/Sidebar";
import ChatArea from "@/components/features/chat/ChatArea";

export default function ChatbotPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen bg-blue-100 p-6 flex gap-4">
      
      {/* Sidebar (collapse support) */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* Chat */}
      <div className="flex-1">
        <ChatArea />
      </div>

    </div>
  );
}