import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; 

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    // 🔐 1. REQUIRE LOGGED-IN USER
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // 🔒 2. REQUIRE ADMIN ROLE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admins only" }),
        { status: 403 }
      );
    }

    // 📦 3. GET REQUEST DATA
    const { email, username, password, fullName, role } = await req.json();

    // ✅ 4. VALIDATE INPUT
    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const allowedRoles = ["admin", "physical_therapist", "volunteer"];
    if (!allowedRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400 }
      );
    }

    const cleanUsername = username?.toLowerCase().trim();

    // 👤 5. CREATE AUTH USER
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: {
          username: cleanUsername,
          role,
          fullName,
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not returned" }),
        { status: 500 }
      );
    }

    // 🧾 6. INSERT INTO PROFILES TABLE
    const { error: profileInsertError } =
      await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        role,
        username: cleanUsername,
        email: email.trim(),
      });

    if (profileInsertError) {
      return new Response(
        JSON.stringify({ error: profileInsertError.message }),
        { status: 400 }
      );
    }

    // ✅ SUCCESS
    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500 }
    );
  }
}