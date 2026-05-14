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

    const { email, username, password, fullName, role, sendInvite } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!sendInvite && !password) {
      return NextResponse.json({ error: "Password is required when not sending invite" }, { status: 400 });
    }

    const allowedRoles = ["admin", "therapist", "volunteer"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const cleanUsername = username?.toLowerCase().trim();
    let userId: string;

    if (sendInvite) {
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim(), {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
          data: {
            username: cleanUsername,
            role,
            fullName,
          },
        });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      userId = authData.user?.id;

    } else {
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
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      userId = authData.user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID not returned" }, { status: 500 });
    }

    const { error: profileInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: fullName,
        role,
        username: cleanUsername,
        email: email.trim(),
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
