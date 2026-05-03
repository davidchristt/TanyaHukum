"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminProfileCard from "@/components/features/profileAdmin/AdminProfileCard";
import AdminProfileForm from "@/components/features/profileAdmin/AdminProfileForm";

export default function AdminProfilePage() {
  const [isOpen, setIsOpen] = useState(true);
  
  // State untuk menyimpan data user yang sedang login
  const [userData, setUserData] = useState({
    id: "",
    nama: "",
    email: "",
    avatarUrl: "",
    role: ""
  });

  // Tarik data dari localStorage saat halaman pertama kali dibuka
  useEffect(() => {
    const localDataString = localStorage.getItem("user");
    if (localDataString) {
      const localData = JSON.parse(localDataString);
      setUserData({
        id: localData.id || "",
        nama: localData.nama || localData.name || "Admin",
        email: localData.email || "",
        avatarUrl: localData.avatarUrl || "",
        role: localData.role || "ADMIN"
      });
    }
  }, []);

  // Fungsi untuk update data di state dan localStorage sekaligus
  const handleUpdateUserData = (newData) => {
    const updatedUser = { ...userData, ...newData };
    setUserData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="h-screen bg-[#eaf1fb] p-6 flex gap-4">
      <div className={`transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[80px]"}`}>
        <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      <div className="flex-1">
        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">
          <div className="border-b border-gray-200">
            <AdminHeader />
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-auto">
            <div className="w-full max-w-xl space-y-4">
              {/* Kirim data user ke Card dan Form melalui Props */}
              <AdminProfileCard userData={userData} updateLocalUser={handleUpdateUserData} />
              <AdminProfileForm userData={userData} updateLocalUser={handleUpdateUserData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}