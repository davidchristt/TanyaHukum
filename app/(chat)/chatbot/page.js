import Sidebar from "@/components/features/chat/Sidebar";
import ChatArea from "@/components/features/chat/ChatArea";

export default function ChatbotPage() {
  return (
    <div className="h-screen bg-blue-100 p-6 flex gap-4">

      {/* Sidebar */}
      <div className="w-[280px]">
        <Sidebar />
      </div>

      {/* Chat */}
      <div className="flex-1">
        <ChatArea />
      </div>

    </div>
  );
}