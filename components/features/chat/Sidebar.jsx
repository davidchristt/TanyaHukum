export default function Sidebar() {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col justify-between">
      
      {/* Top */}
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <img src="/icons/logo.svg" className="w-13 h-13" />
          <img src="/icons/sidebar.svg" className="w-6 h-6" />
        </div>

        {/* Menu */}
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-xl 
          hover:bg-blue-50 hover:border-blue-400 transition">
            <img src="/icons/newChat.svg" className="w-5 h-5" />
            <span className="text-gray-800">Obrolan Baru</span>
          </button>

          <button className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-xl 
          hover:bg-blue-50 hover:border-blue-400 transition">
            <img src="/icons/dashboardStatistik.svg" className="w-5 h-5" />
            <span className="text-gray-800">Dashboard Statistik</span>
          </button>

          <button className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-xl 
          hover:bg-blue-50 hover:border-blue-400 transition">
            <img src="/icons/pusatDataSidebar.svg" className="w-5 h-5" />
            <span className="text-gray-800">Pusat Data Hukum</span>
          </button>
        </div>

        {/* Chat Section */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600 text-sm">Obrolan Anda</p>
        </div>

        <div className="space-y-2">
          {[
            "Apa Itu Hukum Perdata?",
            "Apa itu Hukum Pidana?",
            "Jelaskan Hukum Waris",
            "Penjelasan UUD 1945",
          ].map((item, i) => (
            <div
              key={i}
              className="p-2 border rounded-lg text-sm text-gray-700 
              hover:bg-gray-50 cursor-pointer"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="mt-6 p-3 border rounded-xl flex items-center gap-3">
        <img src="/icons/profile.svg" className="w-8 h-8" />
        <div>
          <p className="text-sm font-medium text-gray-900">David</p>
          <p className="text-xs text-gray-500">Gratis</p>
        </div>
      </div>
    </div>
  );
}