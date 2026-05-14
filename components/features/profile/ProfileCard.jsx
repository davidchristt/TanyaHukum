"use client";

import { useState } from "react";
import { uploadAvatar, updateProfile } from "@/src/lib/profile";
import ImageCropperModal from "@/components/features/shared/ImageCropperModal";
import ConfirmDeleteModal from "@/components/features/shared/ConfirmDeleteModal";

export default function ProfileCard({ user, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) return null;

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
    e.target.value = ""; // Reset input
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropImageUrl(null);
    setUploading(true);
    
    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const res = await uploadAvatar(file);
      if (res && res.user) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...stored, avatarUrl: res.user.avatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth-change"));
        setPreviewUrl(null); 
        if (onChange) onChange();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    try {
      await updateProfile({ avatarUrl: null });
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...stored, avatarUrl: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("auth-change"));
      setPreviewUrl(null);
      if (onChange) onChange();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus foto profil");
    } finally {
      setUploading(false);
      setShowDeleteModal(false);
    }
  };

  const displayAvatar = previewUrl || user.avatarUrl;

  return (
    <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="relative group">
        <div className={`w-20 h-20 rounded-full border-4 transition-all duration-500 overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner
          ${uploading ? "border-blue-400 animate-pulse" : "border-blue-100 dark:border-slate-700"}`}>
          
          {displayAvatar ? (
            <img src={displayAvatar} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            <div className="text-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          )}
        </div>

        <label
          htmlFor="upload-avatar-settings"
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-700 shadow-md rounded-full flex items-center justify-center cursor-pointer border border-gray-100 dark:border-slate-600 hover:scale-110 transition-all text-blue-500 dark:text-blue-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        </label>

        <input type="file" accept="image/*" id="upload-avatar-settings" className="hidden" onChange={handleFileSelect} disabled={uploading} />
      </div>

      <div>
        <h4 className="text-sm font-black text-gray-900 dark:text-white transition-colors">Foto Profil</h4>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Maksimal 2MB</p>
          {displayAvatar && (
            <button onClick={() => setShowDeleteModal(true)} disabled={uploading} className="text-[10px] text-red-500 dark:text-red-400 uppercase tracking-widest font-bold hover:underline">
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