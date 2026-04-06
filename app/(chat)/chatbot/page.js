"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/features/chat/ChatArea";
import SubscriptionList from "@/components/features/subscription/SubscriptionList";

export default function ChatbotPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);

  return (
    <div className="h-screen bg-blue-100 p-6 flex gap-4 relative">
      
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[80px]"}`}>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <ChatArea onOpenSub={() => setShowSubscription(true)} />
      </div>

      {/* Modal Subscription */}
      {showSubscription && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
            
            <button 
              onClick={() => setShowSubscription(false)}
              className="absolute top-6 right-6 z-[10000] bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <SubscriptionList onComplete={() => setShowSubscription(false)} />
          </div>
        </div>
      )}
    </div>
  );
}