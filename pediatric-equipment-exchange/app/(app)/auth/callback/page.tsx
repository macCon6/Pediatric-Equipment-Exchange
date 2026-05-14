"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login-page");
        return; 
      }

      router.replace("/reset-password");
    };

    run();
  }, []);

  return <p>Verifying secure link...</p>;
}