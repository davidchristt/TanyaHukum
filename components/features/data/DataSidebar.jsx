export default function DataSidebar() {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
      
      <h2 className="font-semibold text-gray-900 mb-4">
        Filter Dokumen
      </h2>

      <div className="space-y-3">
        <button className="w-full p-2 border rounded-lg text-left">
          Semua
        </button>

        <button className="w-full p-2 border rounded-lg text-left">
          Hukum Pidana
        </button>

        <button className="w-full p-2 border rounded-lg text-left">
          Hukum Perdata
        </button>

        <button className="w-full p-2 border rounded-lg text-left">
          UUD & Regulasi
        </button>
      </div>
    </div>
  );
}