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

    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(id);

      console.log(authError);

    if (authError) {
      return NextResponse.json({ error: authError.message },
        { status: 400 }
      );
    }


    // dont delete from Profiles table that way we can preserve history just set deleted at
    const{error: profError} =await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    
      console.log(profError);
    return NextResponse.json({ success: true },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json({ error: err.message },
      { status: 500 }
    );
  }
}