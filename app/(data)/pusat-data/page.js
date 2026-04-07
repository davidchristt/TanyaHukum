"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DataList from "@/components/features/data/DataList";
import SubscriptionList from "@/components/features/subscription/SubscriptionList";

export default function PusatDataPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);

  return (
    <div className="h-screen bg-[#D3E8F8] p-6 flex gap-4">

      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[80px]"}`}>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1">

        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">

          {/* Header */}
          <div className="border-b border-gray-200">
            <Header onOpenSubscription={() => setShowSubscription(true)} />
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-auto">
            <DataList />
          </div>

        </div>
      </div>

      {/* Modal */}
      {showSubscription && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative rounded-3xl shadow-2xl">
            
            <button 
              onClick={() => setShowSubscription(false)}
              className="absolute top-6 right-6 z-[10000] bg-white/80 p-2 rounded-full"
            >
              ✕
            </button>

            <SubscriptionList onComplete={() => setShowSubscription(false)} />
          </div>
        </div>
      )}
    </div>
  );
}