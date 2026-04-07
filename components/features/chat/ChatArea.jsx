"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";

export default function ChatArea({ onOpenSub }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    // tambah user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // tambah AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);

    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">
      
      {/* Header */}
      <div className="border-b border-gray-150">
        <Header 
          isPro={false}
          onOpenSubscription={onOpenSub}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {messages.length === 0 ? (
          // ===== EMPTY STATE =====
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h1 className="text-4xl font-semibold text-gray-900 mb-2 text-center">
              Halo Sobat Indonesia!!
            </h1>
            <p className="text-gray-600 mb-10 text-center text-lg">
              Mau Tanya Hukum Apa Hari Ini??
            </p>
          </div>
        ) : (
          // ===== CHAT STATE =====
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-4">
              
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="bg-gray-200 px-4 py-3 rounded-2xl text-sm w-fit">
                  Mengetik...
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* INPUT */}
      <div className="p-6">
        <div className="w-full max-w-2xl mx-auto flex border-2 border-blue-100 rounded-2xl overflow-hidden focus-within:border-blue-400 bg-white transition-all shadow-sm">
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik Pertanyaan Hukum Anda di sini..."
            className="flex-1 px-6 py-4 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-6 flex items-center hover:bg-blue-50 transition border-l border-blue-50"
          >
            <img src="/icons/sendChat.svg" className="w-6 h-6" alt="Send" />
          </button>

        </div>
      </div>

    </div>
  );
}