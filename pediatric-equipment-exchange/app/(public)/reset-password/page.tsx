"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
  const check = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("session:", data.session);
    console.log("error:", error);
  };

  check();
}, []);

  const handleReset = async () => {
    setErrorMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut(); 

    setTimeout(() => {
      router.replace("/login-page");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFC94A]">
      <main className="flex flex-col gap-6 bg-[#FFE09A] rounded-2xl shadow-2xl p-10 w-[90%] max-w-md">

        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg px-4 py-3 text-sm text-center">
            Password updated! Redirecting to login...
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
            {errorMessage}
            <button
              onClick={() => router.push("/login-page")}
              className="block w-full mt-3 text-center text-[#5a9e3a] hover:underline cursor-pointer"
            >
              ← Request a new reset link
            </button>
          </div>
        )}

        { !success && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a9e3a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a9e3a]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleReset}
              className={`w-full rounded-xl py-3 text-lg font-semibold text-white transition-colors 
                bg-[#5a9e3a] hover:bg-[#4a8a2e] cursor-pointer`}
            >
              Update Password
            </button>

            <button
              onClick={() => router.push("/login-page")}
              className="text-sm text-center text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
            >
              ← Back to Login
            </button>
          </>
        )}

      </main>
    </div>
  );
}