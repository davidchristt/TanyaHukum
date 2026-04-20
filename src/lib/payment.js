export async function createCheckout(userId) {
  try {
    const res = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Gagal checkout");
    }

    return data; // { token, redirect_url }

  } catch (err) {
    console.error("Checkout error:", err);
    throw err;
  }
}