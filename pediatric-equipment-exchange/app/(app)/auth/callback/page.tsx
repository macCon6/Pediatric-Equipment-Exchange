"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);

      const code = url.searchParams.get("code");

      // PKCE flow 
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

      //  recovery/hash flow
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