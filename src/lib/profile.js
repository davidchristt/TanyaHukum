// ==============================
// GET PROFILE
// ==============================
export async function getProfile() {
  const res = await fetch("/api/profile", {
    method: "GET",
    credentials: "include", // 🔥 WAJIB
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal mengambil data profile");
  }

  return data;
}

// ==============================
// UPDATE PROFILE (PATCH)
// ==============================
export async function updateProfile({
  name,
  email,
  newPassword,
  avatarUrl,
}) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    credentials: "include", // 🔥 WAJIB
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      newPassword,
      avatarUrl,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal update profile");
  }

  return data;
}

// ==============================
// UPLOAD AVATAR
// ==============================
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/profile/upload", {
    method: "POST",
    credentials: "include", // 🔥 WAJIB
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal upload avatar");
  }

  return data;
}

// ==============================
// LOGOUT
// ==============================
export async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}

  // 🔥 clear local state
  localStorage.removeItem("user");

  // 🔥 trigger global update
  window.dispatchEvent(new Event("auth-change"));

  // 🔥 stay di chatbot (no redirect ke login)
  window.location.href = "/chatbot";
}