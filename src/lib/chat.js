// ==============================
// STORAGE KEY (Legacy & Session)
// ==============================
const ACTIVE_KEY = "active_conversation_id";

// ==============================
// GET ALL CHATS (BACKEND)
// ==============================
export async function getConversations(userId) {
  if (!userId) return [];
  const res = await fetch(`/api/chat?userId=${userId}&type=list`);
  const data = await res.json();
  return data.chats || [];
}

// ==============================
// CREATE NEW CONVERSATION (LOCAL RESET)
// ==============================
export function createNewConversation() {
  localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event("load-conversation"));
  return { id: null };
}

// ==============================
// GET CURRENT ACTIVE ID
// ==============================
export function getCurrentConversationId() {
  return localStorage.getItem(ACTIVE_KEY);
}

// ==============================
// SET ACTIVE
// ==============================
export function setActiveConversation(id) {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

// ==============================
// GET MESSAGES FOR CHAT (BACKEND)
// ==============================
export async function getChatMessages(userId, chatId) {
  if (!userId || !chatId) return [];
  const res = await fetch(`/api/chat?userId=${userId}&chatId=${chatId}`);
  const data = await res.json();
  return (data.history || []).map(m => ({
    role: m.role.toLowerCase() === "ai" ? "assistant" : "user",
    content: m.content
  }));
}

// ==============================
// RENAME CHAT (BACKEND)
// ==============================
export async function renameChat(chatId, title) {
  const res = await fetch("/api/chat", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, title }),
  });
  return await res.json();
}

// ==============================
// DELETE CHAT (BACKEND)
// ==============================
export async function deleteChat(chatId) {
  const res = await fetch(`/api/chat?chatId=${chatId}`, {
    method: "DELETE",
  });
  return await res.json();
}

// ==============================
// SEND MESSAGE (API)
// ==============================
export async function sendMessage({ message, userId, chatId }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, userId, chatId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}