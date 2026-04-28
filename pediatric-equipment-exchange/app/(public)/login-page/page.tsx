"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { set } from "react-hook-form";

export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword]=useState("");
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    // check if fields are empty
    if (!email && !password){
      setErrorMsg("Missing information: Please enter both email and password.");
      return;
    }
    if (!email) {
      setErrorMsg("Missing information: Please enter your email.");
      return;
    }
    if (!password) {
      setErrorMsg("Missing information: Please enter your password.");
      return;
    }

    // try logging in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    // handle incorrect credentials
    if (error) {
      setErrorMsg("Incorrect email or password.");
      return;
    }

    router.push("/equipment-gallery"); //go to gallery on successful login
    router.refresh();
    
  };

  return (
    /* Full screen background */
    <div className="relative z-50 flex min-h-screen w-full items-center justify-center bg-[#91B472]">

      {/* Middle box */}
      <main className="flex w-full max-w-md flex-col items-center justify-center p-6 bg-[#FBF5DB] rounded-2xl shadow-md">
        <h1 className= "text-3xl font-semibold mb-6 text-center w-full"> Login </h1>

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          
          <div>
            <ul className="flex w-full flex-col gap-5 text-lg"> 
              
              <li className="border border-black rounded-lg p-2"> <input value={email} onChange={(e) => {setEmail(e.target.value); setErrorMsg(null); }} placeholder="Enter your email" /> </li>
              <li className="border border-black rounded-lg p-2"> <input type ="password" value= {password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }} placeholder="Enter your password"/>  </li>
            </ul>
          </div>

          <button
            type = "button"
            className="inline-flex items-center justify-center h-8 px-6 rounded-full bg-[#5a9e3a] text-white text-lg transition-colors hover:bg-[#4a8a2e] w-full md:w-auto hover:cursor-pointer"
            onClick={handleLogin}
          >
           Login
          </button>
          {errorMsg && (
            <p className= "text-red-600 text-sm mt-2 text-center w-full">
              {errorMsg}
            </p>
          )}

          <Link 
            className="inline-flex items-center justify-center h-8 px-6 rounded-full bg-[#5a9e3a] text-white text-lg transition-colors hover:bg-[#4a8a2e] w-full md:w-auto hover:cursor-pointer"
            href="/equipment-gallery"
          >
           View as Guest
          </Link>
        </div>
      </main>
    </div>
  );
}