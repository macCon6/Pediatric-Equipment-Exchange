import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getUserAndRole } from "@/lib/data-access-layer";

export async function DELETE(req: Request) {

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

  const supabase = await createClient();

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing user id" },
        { status: 400 }
      );
    }

    // ✅ Delete from Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return NextResponse.json({ error: authError.message },
        { status: 400 }
      );
    }

    // ✅ Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json({ error: err.message },
      { status: 500 }
    );
  }
}