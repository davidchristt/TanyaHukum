export async function registerUser({ email, password }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Register gagal");
  }

  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include", // 🔥 penting untuk cookie JWT
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login gagal");
  }

  return data;
}

export async function loginWithGoogle({ credentialToken }) {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    credentials: "include", // 🔥 penting
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credentialToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login Google gagal");
  }

  return data;
}

export async function requestPasswordReset({ email }) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal kirim reset");
  }

  return data;
}

export async function resetPassword({ token, newPassword }) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal reset password");
  }

  return data;
}