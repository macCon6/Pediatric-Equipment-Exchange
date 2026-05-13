import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserAndRole } from "@/lib/data-access-layer";

export async function POST(req: Request) {

  const { user } = await getUserAndRole();

  // check on server side that they are logged in 
  if (!user) { 
    return NextResponse.json({ error: "Unauthorized"},
      {status: 401 });
  }

  try {
    const { email, full_name } = await req.json();

    const id = user.sub;

    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(id, {
        email,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("profiles") 
      .update({
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