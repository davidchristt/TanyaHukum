export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col justify-between">
      
      {/* Top */}
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <img src="/logo.png" className="w-6 h-6" />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-blue-300 hover:bg-blue-50 transition"
          >
            <img src="/icons/sidebar.svg" className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-4">
          <MenuItem icon="/icons/newChat.svg" label="Obrolan Baru" isOpen={isOpen} />
          <MenuItem icon="/icons/dashboardStatistik.svg" label="Dashboard Statistik" isOpen={isOpen} />
          <MenuItem icon="/icons/pusatDataSidebar.svg" label="Pusat Data Hukum" isOpen={isOpen} />
        </div>

        {/* Chat list */}
        {isOpen && (
          <>
            <p className="text-sm text-gray-600 mt-6 mb-2">Obrolan Anda</p>

            <div className="space-y-2">
              <div className="p-2 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
                Apa Itu Hukum Perdata?
              </div>
              <div className="p-2 border rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
                Apa itu Hukum Pidana?
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="mt-6 flex items-center gap-3">
        <img src="/icons/profile.svg" className="w-8 h-8" />

        {isOpen && (
          <div>
            <p className="text-sm font-medium text-gray-900">David</p>
            <p className="text-xs text-gray-500">Gratis</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Component kecil */
function MenuItem({ icon, label, isOpen }) {
  return (
    <button className="w-full flex items-center justify-center md:justify-start gap-3 p-3 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
      <img src={icon} className="w-5 h-5" />
      {isOpen && <span className="text-gray-800 text-sm">{label}</span>}
    </button>
  );
}