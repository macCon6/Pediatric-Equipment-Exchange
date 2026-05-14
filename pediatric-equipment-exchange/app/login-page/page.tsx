"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter your email and password");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/equipment-gallery");
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    if (!email) {
      setErrorMessage("Please enter your email address first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFC94A]">

      {/* Card */}
      <main className="flex flex-col gap-6 bg-[#FFE09A] rounded-2xl shadow-2xl p-10 w-[90%] max-w-md">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {forgotMode ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {forgotMode ? "Enter your email to receive a reset link" : "Sign in to your account"}
          </p>
        </div>

        {/* Success message for reset */}
        {resetSent && (
          <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg px-4 py-3 text-sm text-center">
            Password reset email sent! Check your inbox.
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Email Address</label>
          <div className="relative">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a9e3a]"
            />
            {/* Info icon — only show in forgot mode */}
            {forgotMode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="relative group">
                  <button
                    type="button"
                    className="w-5 h-5 rounded-full bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    i
                  </button>
                  <div className="absolute bottom-8 right-0 w-64 bg-gray-700 text-white text-xs rounded-xl px-3 py-2 shadow-lg invisible group-hover:visible z-50">
                   *** <strong>NEW</strong> users must change password after setting up an account with Physical Therapist/Admin. ***     
                    
                   *<strong>IMPORTANT</strong>* The reset email may land in your <strong>spam or junk folder</strong>. If you don't see it in your inbox, please check there and mark it as safe. The email should return to main inbox, click the link in the email to continue reset password. If 'Auth Session Missing' error appears please repeat 'forgot password' process again!
                    <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-gray-700 rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password — hidden in forgot mode */}
        {!forgotMode && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">Password</label>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setErrorMessage(""); setResetSent(false); }}
                className="text-xs text-[#5a9e3a] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
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
        )}

        {/* Login or Reset Button */}
        {!forgotMode ? (
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-[#5a9e3a] py-3 text-lg font-semibold text-white transition-colors hover:bg-[#4a8a2e] cursor-pointer"
          >
            Login
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleForgotPassword}
              className="w-full rounded-xl bg-[#5a9e3a] py-3 text-lg font-semibold text-white transition-colors hover:bg-[#4a8a2e] cursor-pointer"
            >
              Send Reset Link
            </button>
            <button
              onClick={() => { setForgotMode(false); setErrorMessage(""); setResetSent(false); }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* Divider and Guest — hidden in forgot mode */}
        {!forgotMode && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <Link
              href="/equipment-gallery"
              className="w-full rounded-xl border-2 border-[#5a9e3a] py-3 text-lg font-semibold text-[#5a9e3a] text-center transition-colors hover:bg-[#5a9e3a] hover:text-white"
            >
              View as Guest
            </Link>
          </>
        )}

      </main>
    </div>
  );
}