// ==============================
// STORAGE KEY
// ==============================
const KEY = "conversations";
const ACTIVE_KEY = "active_conversation_id";

// ==============================
// GET ALL
// ==============================
export function getConversations() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

// ==============================
// SAVE ALL
// ==============================
function saveConversations(convs) {
  localStorage.setItem(KEY, JSON.stringify(convs));
}

// ==============================
// CREATE NEW CONVERSATION
// ==============================
export function createNewConversation() {
  const convs = getConversations();

  const newConv = {
    id: Date.now().toString(),
    title: "Obrolan Baru",
    messages: [],
    createdAt: Date.now(),
  };

  convs.push(newConv);
  saveConversations(convs);

  localStorage.setItem(ACTIVE_KEY, newConv.id);

  return newConv;
}

// ==============================
// GET CURRENT
// ==============================
export function getCurrentConversation() {
  const convs = getConversations();
  const activeId = localStorage.getItem(ACTIVE_KEY);

  return convs.find((c) => c.id === activeId) || null;
}

// ==============================
// SET ACTIVE
// ==============================
export function setActiveConversation(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ==============================
// ADD MESSAGE
// ==============================
export function addMessage(message) {
  const convs = getConversations();
  const activeId = localStorage.getItem(ACTIVE_KEY);

  const conv = convs.find((c) => c.id === activeId);
  if (!conv) return;

  conv.messages.push(message);

  // auto title dari message pertama
  if (conv.messages.length === 1) {
    conv.title = message.content.slice(0, 40);
  }

  saveConversations(convs);

  // trigger sync
  window.dispatchEvent(new Event("storage"));
}

// ==============================
// SEND MESSAGE (API)
// ==============================
export async function sendMessage({ message, userId }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, userId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}