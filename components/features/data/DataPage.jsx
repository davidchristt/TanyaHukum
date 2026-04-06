"use client";

import Header from "@/components/layout/Header";

export default function DataPage() {
  return (
    <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">
      
      {/* Header */}
      <div className="border-b border-gray-200">
        <Header />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-auto">

        <div className="max-w-4xl mx-auto space-y-6">

          {/* SEARCH */}
          <div className="bg-white/80 rounded-2xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Pencarian JDIHN
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Cari Undang-undang, Peraturan Pemerintah, Putusan MA
            </p>

            <input
              type="text"
              placeholder="Misal, Hukum mengenai saksi kejahatan tahun 2025"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none 
              focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* LIST */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Dokumen Terpopuler
            </h3>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white/80 rounded-2xl p-4 shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Undang-Undang Nomor 1 Tahun 2025
                    </p>
                    <p className="text-sm text-gray-500">
                      Perubahan mengenai UU ITE 2021
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      Baca
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      Unduh
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}