"use client";

import { useRef, useState } from "react";

export default function AdminProfileCard({ userData, updateLocalUser }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // <-- State buat modal logout

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran gambar terlalu besar! Maksimal 2MB.", "error");
        return;
      }

      setIsUploading(true);
      try {
        const base64Image = await convertToBase64(file);

        const response = await fetch(`/api/admin/users/${userData.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userData.id}`
          },
          body: JSON.stringify({ avatarUrl: base64Image }),
        });

        if (response.ok) {
          updateLocalUser({ avatarUrl: base64Image });
          showToast("Foto profil berhasil diperbarui!");
        } else {
          showToast("Gagal mengunggah foto ke database.", "error");
        }
      } catch (error) {
        console.error("Error upload:", error);
        showToast("Terjadi kesalahan sistem.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Fungsi saat tombol Ya, Keluar diklik di dalam modal
  const confirmLogout = () => {
    // 1. Hapus semua sesi (tambahkan jika bos punya key localStorage lain)
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Jaga-jaga kalau bos pakai token

    window.location.href = "/chatbot"; 
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4 relative">
        
        {/* Notifikasi Cantik */}
        {toast && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.message}
          </div>
        )}

        <div className="w-20 h-20 rounded-full border-4 border-blue-400 flex items-center justify-center overflow-hidden shrink-0 bg-blue-50 relative">
          {userData.avatarUrl ? (
            <img src={userData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img src="/icons/profile.svg" alt="Default Profile" className="w-10 h-10 object-contain opacity-60" />
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="animate-spin text-blue-500 font-bold">↻</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {userData.nama || "Admin Superuser"}
          </h2>
          <p className="text-sm text-gray-500">
            {userData.email || "admin@tanyahukum.com"}
          </p>

          <div className="flex gap-2 mt-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp" 
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition shadow-sm ${
                isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500"
              }`}
            >
              {isUploading ? "Mengunggah..." : "Unggah Foto"}
            </button>
            
            {/* Tombol ini sekarang cuma ngebuka modal, bukan alert jelek lagi */}
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL LOGOUT CANTIK --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari halaman Admin? Anda akan diarahkan ke halaman Chatbot.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 shadow-md transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}