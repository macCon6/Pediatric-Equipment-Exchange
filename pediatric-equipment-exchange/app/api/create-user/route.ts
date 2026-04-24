import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; 
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  
  const supabase = await createClient();
  
  try {

    const { user, role: currentRole } = await getUserAndRole();

    if (!user) { 
      return NextResponse.json({ error: "Unauthorized"},
        {status: 401 });
    }

    if (currentRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    // 📦 3. GET REQUEST DATA
    const { email, username, password, fullName, role } = await req.json();

    // ✅ 4. VALIDATE INPUT
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedRoles = ["admin", "physical_therapist", "volunteer"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" },
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
      return NextResponse.json({ error: authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not returned" },
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
      return NextResponse.json({ error: profileInsertError.message },
        { status: 400 }
      );
    }

    // ✅ SUCCESS
    return NextResponse.json({ success: true, userId },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}