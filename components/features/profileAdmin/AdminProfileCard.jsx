"use client";

import { useState } from "react";
import { uploadAvatar } from "@/src/lib/profile";
import ImageCropperModal from "@/components/features/shared/ImageCropperModal";
import ConfirmDeleteModal from "@/components/features/shared/ConfirmDeleteModal";

export default function AdminProfileCard({ userData, updateLocalUser }) {
  const [uploading, setUploading] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDASI CLIENT SIDE
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Ukuran file terlalu besar. Maksimal 2MB.");
      return;
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => { setCropImageUrl(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropImageUrl(null);
    setUploading(true);
    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const res = await uploadAvatar(file);

      if (res && res.user) {
        updateLocalUser({ avatarUrl: res.user.avatarUrl });
      } else {
        alert("Gagal mengunggah foto ke Supabase.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan sistem saat upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    try {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userData.id}` },
        body: JSON.stringify({ avatarUrl: null }),
      });
      if (response.ok) {
        updateLocalUser({ avatarUrl: null });
      } else {
        alert("Gagal menghapus foto profil.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setUploading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="relative group">
        <div className={`w-20 h-20 rounded-full border-4 transition-all duration-500 overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner transition-colors
          ${uploading ? "border-blue-400 animate-pulse" : "border-blue-100 dark:border-slate-700"}`}>

          {userData?.avatarUrl ? (
            <img src={userData.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            // PERUBAHAN: Pakai SVG lokal bos
            <img src="/icons/profile.svg" className="w-10 h-10 object-contain opacity-60 transition-all" alt="Default Profile" />
          )}
        </div>

        <label
          htmlFor="upload-avatar-admin-settings"
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-900 shadow-md rounded-full flex items-center justify-center cursor-pointer border border-gray-100 dark:border-slate-700 hover:scale-110 transition-all text-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        </label>

        <input type="file" accept="image/*" id="upload-avatar-admin-settings" className="hidden" onChange={handleFileSelect} disabled={uploading} />
      </div>

      <div>
        <h4 className="text-sm font-black text-gray-900 dark:text-white transition-colors">Foto Profil</h4>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Maksimal 2MB</p>
          {userData?.avatarUrl && (
            <button onClick={() => setShowDeleteModal(true)} disabled={uploading} className="text-[10px] text-red-500 uppercase tracking-widest font-bold hover:underline">
              Hapus Foto
            </button>
          )}
        </div>
      </div>

      {cropImageUrl && (
        <ImageCropperModal
          imageUrl={cropImageUrl}
          onClose={() => setCropImageUrl(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAvatar}
        isProcessing={uploading}
        title="Hapus Foto Profil?"
        message="Anda yakin ingin menghapus foto profil? Foto akan diganti dengan avatar default."
      />
    </div>
  );
}