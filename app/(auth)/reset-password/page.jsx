import { Suspense } from "react"; // 1. Import Suspense
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      {/* 2. Bungkus form-nya di sini */}
      <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
