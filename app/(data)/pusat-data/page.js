import Sidebar from "@/components/layout/Sidebar";
import DataPage from "@/components/features/data/DataPage";

export default function Page() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#9BB6A1] to-[#EAE3C3]">
      <Sidebar />

      <div className="flex-1 p-4">
        <DataPage />
      </div>
    </div>
  );
}