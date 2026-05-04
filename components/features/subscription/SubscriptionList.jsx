"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import SubscriptionSelect from "./SubscriptionSelect";
import SubscriptionSummary from "./SubscriptionSummary";

import { createCheckout } from "@/src/lib/payment";

export default function SubscriptionList({ user, onComplete }) {
  const [selected, setSelected] = useState("basic");
  const [step, setStep] = useState("select");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Guard: prevent calling snap.pay while popup is already open
  const isSnapOpen = useRef(false);

  const router = useRouter();

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Gratis!",
      benefits: [
        "Prompt chatbot terbatas",
        "Pencarian dokumen terbatas",
        "Memori maksimal di seluruh obrolan",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "Rp 49.900,00",
      benefits: [
        "Prompt chatbot tanpa batas",
        "Pencarian dokumen tanpa batas",
        "Memori diperluas di seluruh obrolan",
      ],
    },
  ];

  const selectedPlan = plans.find((p) => p.id === selected);

  // =========================
  // HANDLE CHECKOUT
  // =========================
  const handleCheckout = async () => {
    // Prevent duplicate calls while Snap popup is already active
    if (isSnapOpen.current || isLoading) return;

    try {
      if (!user?.id) {
        alert("User tidak ditemukan");
        return;
      }

      if (selected !== "pro") return;

      setIsLoading(true);
      const data = await createCheckout(user.id);
      setIsLoading(false);

      isSnapOpen.current = true;

      window.snap.pay(data.token, {
        onSuccess: function () {
          isSnapOpen.current = false;

          // =========================
          // UPDATE USER TO PRO
          // =========================
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = { ...stored, tier: "PRO", promptLimit: null };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            window.dispatchEvent(new Event("auth-change"));
            if (onComplete) onComplete();
          }, 2000);
        },

        onPending: function () {
          isSnapOpen.current = false;
          alert("Selesaikan pembayaran Anda");
        },

        onError: function () {
          isSnapOpen.current = false;
          alert("Pembayaran gagal");
        },

        onClose: function () {
          isSnapOpen.current = false;
        },
      });
    } catch (err) {
      isSnapOpen.current = false;
      setIsLoading(false);
      console.error(err);
      alert("Gagal memulai pembayaran");
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleClose = () => {
    if (onComplete) onComplete();
    else router.back();
  };

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative w-full max-w-2xl flex justify-center">

          {step === "select" && (
            <SubscriptionSelect
              plans={plans}
              selected={selected}
              setSelected={setSelected}
              setStep={setStep}
              user={user}
              onClose={handleClose}
            />
          )}

          {step === "summary" && (
          <SubscriptionSummary
              user={user}
              selectedPlan={selectedPlan}
              onBack={() => setStep("select")}
              onPay={handleCheckout}
              isLoading={isLoading}
            />
          )}

        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-6 right-6 z-[9999] animate-fadeIn">
          <div className="bg-white border border-green-200 shadow-xl rounded-xl px-6 py-4 flex items-center gap-3">

            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Pembayaran Berhasil
              </p>
              <p className="text-xs text-gray-500">
                Akun Anda sekarang PRO
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}