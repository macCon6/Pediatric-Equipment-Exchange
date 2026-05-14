import { supabaseAdmin } from "@/lib/supabase/admin"; 
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  
  try {
    const { user, role: currentRole } = await getUserAndRole();

    if (!user) { 
      return NextResponse.json({ error: "Unauthorized"}, {status: 401});
    }

    if (currentRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { email, fullName, role } = await req.json();

    if (!email || !fullName ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const allowedRoles = ["admin", "therapist", "volunteer"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        email_confirm: true,
        user_metadata: {
          role,
          fullName,
        },
      });

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

    
    const userId= authData.user?.id;


    if (!userId) {
      return NextResponse.json({ error: "User ID not returned" }, { status: 500 });
    }

    // send user email to reset their password 
    const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        redirectTo:
         "https://beyond-the-horizon-lending-library.vercel.app/auth/callback",
        data: {
          fullName,
         role,
        },
      }
    );

    if (inviteError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    const { error: profileInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        role,
        email: email.trim().toLowerCase(),
      });

    if (profileInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileInsertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}