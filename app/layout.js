import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "TanyaHukum",
  description: "AI Chatbot Hukum",
};

export default function RootLayout({ children, modal }) {
  return (
    <html>
      <body className="bg-[#eaf1fb]">
        {children}
        {modal}
      </body>
    </html>
  );
}