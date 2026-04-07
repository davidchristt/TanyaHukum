"use client";

export default function Header({ isPro = false, onOpenSubscription }) {
  return (
    <div className="w-full flex items-center justify-between px-2 py-2">
      
      {/* LEFT: Logo & Brand */}
      <div className="flex items-center gap-3">
        <img src="/icons/logo.svg" className="w-14 h-14" alt="Logo TanyaHukum" />
        <h1 className="text-lg font-semibold text-gray-900">
          TanyaHukum
        </h1>
      </div>

      {/* RIGHT: Button Pro */}
      {!isPro && (
        <button
            // onClick sekarang menjalankan fungsi yang dikirim dari parent (ChatArea/DataList)
            onClick={onOpenSubscription}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition 
            text-white px-4 py-2 rounded-xl shadow-md text-sm font-medium mr-2"
        >
          <img src="/icons/bintangPro.svg" className="w-4 h-4" alt="Pro Icon" />
          Konsultasi Pro
        </button>
      )}
    </div>
  );
}