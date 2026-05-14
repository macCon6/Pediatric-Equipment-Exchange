"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace("/login-page");
          return;
        }

        router.replace("/reset-password");
        return;
      }

      router.replace("/reset-password");
    };

    run();
  }, []);

  return <p>Verifying secure link...</p>;
}