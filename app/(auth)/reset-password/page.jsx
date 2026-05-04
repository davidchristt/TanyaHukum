import { Suspense } from "react";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | TanyaHukum",
  description: "Update kata sandi Anda dengan aman di TanyaHukum.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#e6eef8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="mb-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex items-center gap-3">
          <img src="/icons/logo.svg" className="w-16 h-16 shadow-lg rounded-2xl" alt="TanyaHukum Logo" />
          <h1 className="text-2xl font-bold text-gray-900">TanyaHukum</h1>
        </div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Menyiapkan halaman...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-12 text-gray-400 text-sm animate-in fade-in duration-1000">
        &copy; 2024 TanyaHukum. Semua Hak Dilindungi.
      </div>
    </div>
  );
}