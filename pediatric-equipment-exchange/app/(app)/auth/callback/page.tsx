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
        await supabase.auth.exchangeCodeForSession(code);
      }

      // give supabase time to hydrate
      await new Promise((r) => setTimeout(r, 300));

      // verify session exists and retry again before redirecting
      const { data: session1 } = await supabase.auth.getSession();

      if (!session1.session) {
        await new Promise((r) => setTimeout(r, 500));

        const { data: session2 } = await supabase.auth.getSession();

        if (!session2.session) {
          router.replace("/login-page");
          return;
        }
      }

      router.replace("/reset-password");
    };

    run();
  }, [router, supabase]);

  return <p>Verifying secure link...</p>;
}