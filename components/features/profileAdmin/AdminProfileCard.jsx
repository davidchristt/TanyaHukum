"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProfileCard({ userData, updateLocalUser }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi mengubah gambar jadi teks Base64 biar bisa masuk Database
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
      // Validasi ukuran gambar maksimal 2MB biar database ga jebol
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
        return;
      }

      setIsUploading(true);
      try {
        const base64Image = await convertToBase64(file);

        // Langsung tembak ke API untuk update avatarUrl di database
        const response = await fetch(`/api/admin/users/${userData.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userData.id}`
          },
          body: JSON.stringify({ avatarUrl: base64Image }),
        });

        if (response.ok) {
          // Update tampilan di layar dan localStorage
          updateLocalUser({ avatarUrl: base64Image });
          alert("Foto profil berhasil diperbarui!");
        } else {
          alert("Gagal mengunggah foto ke database.");
        }
      } catch (error) {
        console.error("Error upload:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = () => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin keluar dari halaman Admin?");
    if (isConfirm) {
      localStorage.removeItem("user"); // Hapus sesi
      router.push("/"); 
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4">
      <div className="w-20 h-20 rounded-full border-4 border-blue-400 flex items-center justify-center overflow-hidden shrink-0 bg-blue-50 relative">
        {userData.avatarUrl ? (
          <img src={userData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-blue-400 font-bold text-2xl">
            {userData.nama ? userData.nama.charAt(0).toUpperCase() : "A"}
          </span>
        )}
        
        {/* Loading overlay saat upload */}
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
          
          <button 
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}