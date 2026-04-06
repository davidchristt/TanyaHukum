import DataSidebar from "@/components/features/data/DataSidebar";
import DataList from "@/components/features/data/DataList";

export default function PusatDataPage() {
  return (
    <div className="h-screen bg-blue-100 p-6 flex gap-4">
      
      {/* Sidebar filter */}
      <div className="w-[280px]">
        <DataSidebar />
      </div>

      {/* List dokumen */}
      <div className="flex-1">
        <DataList />
      </div>

    </div>
  );
}