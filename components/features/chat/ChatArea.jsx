"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import LegalResponse from "./LegalResponse";

import {
  sendMessage,
  createNewConversation,
  getCurrentConversationId,
  getChatMessages,
  setActiveConversation
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
  // INIT & SWITCH CONVERSATION
  // ==============================
  useEffect(() => {
    const loadConversation = async () => {
      const activeId = getCurrentConversationId();
      
      if (activeId && user) {
        setLoading(true);
        try {
          const history = await getChatMessages(user.id, activeId);
          setMessages(history);
        } catch (err) {
          console.error("Failed to load messages:", err);
          setMessages([]);
        } finally {
          setLoading(false);
        }
      } else {
        setMessages([]);
        setEmptyTitle(getRandomItem(EMPTY_TITLES));
        setEmptyText(getRandomItem(EMPTY_PROMPTS));
      }
    };

    loadConversation();

    window.addEventListener("load-conversation", loadConversation);
    return () =>
      window.removeEventListener("load-conversation", loadConversation);
  }, [user]);

  // ==============================
  // SEND MESSAGE
  // ==============================
  const handleSend = async () => {
    if (!message.trim()) return;

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
    const currentChatId = getCurrentConversationId();

    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const data = await sendMessage({
        message: text,
        userId: user.id,
        chatId: currentChatId
      });

      // Update chatId if it was a new chat
      if (!currentChatId && data.chatId) {
        setActiveConversation(data.chatId);
        window.dispatchEvent(new Event("refresh-chats"));
      }

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
      window.dispatchEvent(new Event("auth-change"));

    } catch (err) {
      const errorMsg = {
        role: "assistant",
        content: err.error || "Terjadi kesalahan.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="h-full flex flex-col min-h-0 relative">

      {/* HEADER */}
      <div className="flex-none border-b border-gray-200">
        <Header
          user={user}
          onOpenAuth={onOpenAuth}
          onOpenSubscription={onOpenSubscription}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-h-0">

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">

            <h1 className="text-4xl font-semibold text-gray-900 mb-2 text-center animate-fade-down">
              {emptyTitle}
            </h1>

            <p className="text-gray-600 text-lg mb-10 text-center max-w-xl animate-fade-down delay-75">
              {emptyText}
            </p>

            {/* INPUT TENGAH */}
            <div className="w-full max-w-2xl flex border-2 border-blue-100 rounded-2xl overflow-hidden bg-white shadow-sm animate-fade-down delay-150 focus-ring premium-glow">
              
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
                id="send-btn-center"
                onClick={handleSend}
                disabled={loading}
                className="px-6 hover:bg-blue-50"
              >
                <img src="/icons/sendChat.svg" className="w-6 h-6 hover:animate-pulse-soft" />
              </button>

            </div>
          </div>

        ) : (
          <>
            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 scroll-smooth">
              <div className="flex flex-col gap-4">

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    } group mb-6 transition-all duration-300`}
                  >
                    <div
                      className={`relative max-w-[95%] sm:max-w-[85%] px-7 py-6 rounded-[2rem] text-[15.5px] leading-[1.75] tracking-tight ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10 rounded-tr-none border border-blue-400/20"
                          : "bg-white border border-gray-100 shadow-md shadow-gray-200/50 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <LegalResponse content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap font-medium">
                          {msg.content}
                        </div>
                      )}

                      {/* ACTIONS (TOP-RIGHT) */}
                      {msg.role === "assistant" && (
                        <div className="absolute -top-3 -right-3 flex gap-1 opacity-40 group-hover:opacity-100 transition-all duration-300 bg-white border border-gray-200 p-1 rounded-xl shadow-md z-10 scale-90 group-hover:scale-100">
                          <ActionButton
                            icon="/icons/copy.svg"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              const btn = document.getElementById(`copy-${i}`);
                              if (btn) btn.innerText = "✓";
                              setTimeout(() => { if (btn) btn.innerText = ""; }, 2000);
                            }}
                            tooltip="Copy"
                            id={`copy-${i}`}
                          />
                          <ActionButton
                            icon="/icons/regenerate.svg"
                            onClick={() => {
                              const lastUserIdx = messages.slice(0, i).findLastIndex(m => m.role === "user");
                              if (lastUserIdx !== -1) {
                                const lastUserText = messages[lastUserIdx].content;
                                setMessage(lastUserText);
                                setTimeout(() => {
                                  const sendBtn = document.getElementById("send-btn");
                                  if (sendBtn) sendBtn.click();
                                }, 0);
                              }
                            }}
                            tooltip="Regenerate"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex flex-col items-start mb-4">
                    <div className="bg-white border border-gray-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50/50">
              <div className="w-full flex border border-blue-200 rounded-[1.5rem] overflow-hidden bg-white shadow-xl shadow-blue-500/5 focus-ring transition-all">
                
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
                  id="send-btn"
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 hover:bg-blue-50"
                >
                  <img src="/icons/sendChat.svg" className="w-6 h-6 hover:animate-pulse-soft" />
                </button>

              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function ActionButton({ icon, onClick, tooltip, id }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 min-w-[28px] justify-center"
      title={tooltip}
    >
      <img src={icon} className="w-3.5 h-3.5 opacity-60" />
      <span id={id} className="text-[10px] font-bold text-blue-600"></span>
    </button>
  );
}