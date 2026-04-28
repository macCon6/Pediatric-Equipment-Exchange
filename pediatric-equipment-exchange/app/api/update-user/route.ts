import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { id, email, username, full_name } = await req.json();

    // ✅ 1. Update email in Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(id, {
        email,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // ✅ 2. Update your profiles table (FIXED HERE)
    const { error: dbError } = await supabaseAdmin
      .from("profiles") // ✅ changed from "users"
      .update({
        username,
        full_name,
         email, 
      })
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}