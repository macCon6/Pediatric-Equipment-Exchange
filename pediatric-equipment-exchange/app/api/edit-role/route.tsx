import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserAndRole } from "@/lib/data-access-layer";

export async function POST(req: Request) {

  const { user, role } = await getUserAndRole();

  if (!user) { 
    return NextResponse.json({ error: "Unauthorized"},
        {status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" },
        { status: 403 }
    );
  }

  try {

    const { id, targetRole } = await req.json();

    if (!id || !targetRole) {
     return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const allowedRoles = ["admin", "therapist", "volunteer"];
    if (!allowedRoles.includes(targetRole)) {
      return NextResponse.json({ error: "Invalid target role" }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("profiles") 
      .update({
        role: targetRole
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