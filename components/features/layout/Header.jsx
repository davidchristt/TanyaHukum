"use client";

export default function Header({ user, onOpenSubscription, onOpenAuth }) {
  const isPro = user?.tier === "PRO";

  return (
    <div className="w-full flex items-center justify-between px-4 py-3">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img src="/icons/logo.svg" className="w-12 h-12" alt="Logo" />
        <h1 className="text-lg font-semibold text-gray-900">
          TanyaHukum
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* ================= NOT LOGIN ================= */}
        {!user && (
          <button
            onClick={() => onOpenAuth && onOpenAuth("login")}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg 
            hover:bg-gray-100 transition"
          >
            Login
          </button>
        )}

        {/* ================= USER FREE ================= */}
        {user && !isPro && (
          <>
            {/* LIMIT */}
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              Sisa:{" "}
              <span className="font-semibold text-gray-900">
                {user.promptLimit ?? 0}
              </span>
            </div>

            {/* BUTTON PRO */}
            <button
              onClick={onOpenSubscription}
              className="flex items-center gap-2 
              bg-[#7FAFD4] hover:bg-[#6c9cc2] transition 
              text-white px-4 py-2 rounded-xl shadow text-sm font-medium"
            >
              <img src="/icons/bintangPro.svg" className="w-4 h-4" />
              Konsultasi Pro
            </button>
          </>
        )}

        {/* ================= USER PRO ================= */}
        {user && isPro && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
            bg-gradient-to-r from-yellow-400 to-yellow-500 
            text-white text-sm font-semibold shadow"
          >
            <img src="/icons/bintangPro.svg" className="w-4 h-4" />
            PRO Member
          </div>
        )}

      </div>
    </div>
  );
}