"use client";

export default function Header({ isPro = false }) {
  return (
    <div className="w-full flex items-center justify-between px-2 py-2">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img src="/icons/logo.svg" className="w-14 h-14" />
        <h1 className="text-lg font-semibold text-gray-900">
          TanyaHukum
        </h1>
      </div>

      {/* RIGHT */}
      {!isPro && (
        <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition 
            text-white px-4 py-2 rounded-xl shadow-md text-sm font-medium mr-2"
        >
          <img src="/icons/bintangPro.svg" className="w-4 h-4" />
          Konsultasi Pro
        </button>
      )}
    </div>
  );
}