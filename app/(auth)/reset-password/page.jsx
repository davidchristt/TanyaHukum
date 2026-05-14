import { Suspense } from "react";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | TanyaHukum",
  description: "Update kata sandi Anda dengan aman di TanyaHukum.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#e6eef8] dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"></div>
      
      <div className="mb-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center border border-white/20 dark:border-slate-800 transition-colors">
            <img src="/icons/logo.svg" className="w-10 h-10" alt="TanyaHukum Logo" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">TanyaHukum</h1>
        </div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] transition-colors">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-100 dark:border-slate-800 border-t-blue-600 mb-4"></div>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-bold animate-pulse">Menyiapkan halaman...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-12 text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-1000 transition-colors">
        &copy; 2024 TanyaHukum. Semua Hak Dilindungi.
      </div>
    </div>
  );
}