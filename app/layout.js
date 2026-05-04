import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnimatedBackground from "@/components/shared/AnimatedBackground";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "TanyaHukum",
  description: "AI Chatbot Hukum",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${poppins.className} bg-white`}>
        <AnimatedBackground />

        {/* ⬇️ WAJIB DI DALAM BODY */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />

        <main className="relative z-10">
          {children}
        </main>

      </body>
    </html>
  );
}