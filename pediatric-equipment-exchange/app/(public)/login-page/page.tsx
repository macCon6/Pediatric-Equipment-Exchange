"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword]=useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      return;
    }

    router.push("/equipment-gallery"); //go to gallery on successful login
    router.refresh();
  }

  return (
    /* Full screen background */
    <div className="flex min-h-screen items-center justify-center bg-[#FFC94A] font-sans">

      {/* Middle box */}
      <main className="flex min-h-screen w-4/6 max-w-screen flex-col items-center justify-center py-8 px-16 bg-[#FFE09A] sm:items-start">

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          
          <div>
            <ul className="flex flex-col gap-5 text-3xl"> 
              <li className="border border-black"> <input onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" /> </li>
              <li className="border border-black"> <input onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"/>  </li>
            </ul>
          </div>

          <button
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white
            hover:cursor-pointer"
            onClick={handleLogin}
          >
           Login
          </button>

          <Link 
            className="flex h-12 w-full justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white"
            href="/equipment-gallery"
          >
           View as Guest
          </Link>
        </div>
      </main>
    </div>
  );
}