"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProfileCard() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // State untuk menampung gambar profil sementara
  const [profilePic, setProfilePic] = useState(null);

  // Fungsi menangkap file gambar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Bikin URL sementara biar gambarnya bisa langsung dilihat (preview)
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  // Fungsi Logout dengan konfirmasi
  const handleLogout = () => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin keluar dari halaman Admin?");
    if (isConfirm) {
      // Nanti arahkan ke halaman login yang sebenarnya, sementara ke "/"
      router.push("/"); 
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4">

      {/* AVATAR AREA */}
      <div className="w-20 h-20 rounded-full border-4 border-blue-400 flex items-center justify-center overflow-hidden shrink-0">
        {profilePic ? (
          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-blue-400 rounded-full" />
        )}
      </div>

      {/* TEXT & ACTION AREA */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Superuser
        </h2>
        <p className="text-sm text-gray-500">
          admin@tanyahukum.com
        </p>

        <div className="flex gap-2 mt-3">
          {/* Input file tersembunyi */}
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*" // Hanya menerima gambar
          />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-1.5 rounded-lg bg-blue-400 text-white text-sm font-medium hover:bg-blue-500 transition shadow-sm"
          >
            Unggah Foto
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