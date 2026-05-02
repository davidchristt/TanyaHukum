"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import ReactMarkdown from "react-markdown";

import {
  sendMessage,
  getCurrentConversation,
  createNewConversation,
  addMessage,
} from "@/src/lib/chat";

// RANDOM TEXT
const EMPTY_TITLES = [
  "Halo Sobat Indonesia!!",
  "Butuh Bantuan Hukum?",
  "Yuk Kita Bahas Masalahmu",
  "Tanya Hukum Tanpa Ribet",
  "Ngobrolin Hukum Jadi Mudah",
  "Cari Jawaban Hukum di Sini",
];

const EMPTY_PROMPTS = [
  "Lagi bingung soal hukum? Tanyakan di sini, biar jelas dan nggak salah langkah.",
  "Ada masalah hukum? Jelaskan situasimu, nanti aku bantu jelasin aturannya.",
  "Butuh pencerahan soal hukum? Tanya aja, kita bedah bareng sampai paham.",
  "Dari kasus ringan sampai serius, semua bisa kamu tanyakan di sini.",
  "Nggak ngerti pasal-pasal? Tenang, aku bantu jelasin dengan bahasa yang simpel.",
  "Curiga ada pelanggaran hukum? Coba ceritakan, kita analisis bareng.",
  "Mau tahu hak dan kewajibanmu secara hukum? Mulai dari sini.",
];

const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function ChatArea({ user, onOpenAuth, onOpenSubscription }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [emptyTitle, setEmptyTitle] = useState("");
  const [emptyText, setEmptyText] = useState("");

  const sendingRef = useRef(false);

  // ==============================
  // INIT CONVERSATION
  // ==============================
  useEffect(() => {
    let conv = getCurrentConversation();

    if (!conv) {
      conv = createNewConversation();
    }

    setMessages(conv.messages);

    setEmptyTitle(getRandomItem(EMPTY_TITLES));
    setEmptyText(getRandomItem(EMPTY_PROMPTS));
  }, []);

  // ==============================
  // SWITCH CONVERSATION
  // ==============================
  useEffect(() => {
    const loadConversation = () => {
      const conv = getCurrentConversation();

      if (conv) {
        setMessages(conv.messages);
      }

      if (!conv || conv.messages.length === 0) {
        setEmptyTitle(getRandomItem(EMPTY_TITLES));
        setEmptyText(getRandomItem(EMPTY_PROMPTS));
      }
    };

    window.addEventListener("load-conversation", loadConversation);
    return () =>
      window.removeEventListener("load-conversation", loadConversation);
  }, []);

  // ==============================
  // SEND MESSAGE
  // ==============================
  const handleSend = async () => {
    if (!message.trim()) return;

    // 🔥 LOGIN CHECK
    if (!user) {
      onOpenAuth("login");
      return;
    }

    if (user?.tier !== "PRO" && user?.promptLimit <= 0) {
      onOpenSubscription();
      return;
    }

    if (loading || sendingRef.current) return;
    sendingRef.current = true;

    const text = message;

    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    addMessage(userMessage);

    setMessage("");
    setLoading(true);

    try {
      const data = await sendMessage({
        message: text,
        userId: user.id,
      });

      if (user?.tier !== "PRO") {
        const updatedUser = {
          ...user,
          promptLimit: Math.max(0, (user.promptLimit || 1) - 1),
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("auth-change"));
      }

      const aiMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
      addMessage(aiMessage);

      window.dispatchEvent(new Event("auth-change"));

    } catch (err) {
      const errorMsg = {
        role: "assistant",
        content: "Terjadi kesalahan.",
      };

      setMessages((prev) => [...prev, errorMsg]);
      addMessage(errorMsg);

    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/70 backdrop-blur-md rounded-2xl shadow-lg">

      {/* HEADER */}
      <div className="border-b border-gray-200">
        <Header
          user={user}
          onOpenAuth={onOpenAuth}
          onOpenSubscription={onOpenSubscription}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">

            <h1 className="text-4xl font-semibold text-gray-900 mb-2 text-center">
              {emptyTitle}
            </h1>

            <p className="text-gray-600 text-lg mb-10 text-center max-w-xl">
              {emptyText}
            </p>

            {/* INPUT TENGAH */}
            <div className="w-full max-w-2xl flex border-2 border-blue-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik Pertanyaan Hukum Anda di sini..."
                className="flex-1 px-6 py-4 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 hover:bg-blue-50"
              >
                <img src="/icons/sendChat.svg" className="w-6 h-6" />
              </button>

            </div>
          </div>

        ) : (
          <>
            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-4">

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-6 py-5 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 shadow-sm"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      )}
                    </div>

                    {/* ACTION */}
                    {msg.role === "assistant" && (
                      <div className="flex gap-3 mt-2 ml-1">

                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="opacity-60 hover:opacity-100"
                        >
                          <img src="/icons/copy.svg" className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            const lastUser = messages[i - 1];
                            if (lastUser?.role === "user") {
                              setMessage(lastUser.content);
                              setTimeout(() => handleSend(), 0);
                            }
                          }}
                          className="opacity-60 hover:opacity-100"
                        >
                          <img src="/icons/regenerate.svg" className="w-4 h-4" />
                        </button>

                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="bg-gray-200 px-4 py-3 rounded-2xl text-sm w-fit">
                    Mengetik...
                  </div>
                )}

              </div>
            </div>

            {/* INPUT BAWAH */}
            <div className="p-6 border-t bg-white">
              <div className="w-full flex border-2 border-blue-100 rounded-2xl overflow-hidden bg-white">
                
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik Pertanyaan Hukum Anda di sini..."
                  className="flex-1 px-6 py-4 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 hover:bg-blue-50"
                >
                  <img src="/icons/sendChat.svg" className="w-6 h-6" />
                </button>

              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}