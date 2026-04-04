import Link from "next/link";

export default function RegisterForm() {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Daftar Akun
      </h2>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
            text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kata Sandi</label>

          <div className="relative">
            <input
              type="password"
              placeholder="Masukkan Kata Sandi Anda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              text-gray-800 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              👁️
            </span>
          </div>
        </div>

        {/* Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium shadow-md">
          Buat Akun
        </button>

        {/* Google */}
        <button className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg font-medium">
          Buat Akun dengan Google
        </button>

        {/* Login */}
        <p className="text-center text-sm text-gray-500">
          Sudah Punya Akun?{" "}
          <Link href="/login" className="text-blue-600">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}