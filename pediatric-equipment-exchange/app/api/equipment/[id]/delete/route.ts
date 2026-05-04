import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE( request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  // Double-check on the server that they're actually an admin
  const { user, role } = await getUserAndRole();

  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();
  const { id } = await params;

  const {deletion_type, current_status} = await request.json();

  if (current_status !== "Available") { 
    return NextResponse.json(
      ({ error: "Only Available items can be deleted" }),
        { status: 400 }
    );
  }

   if (!(deletion_type === "hard" || deletion_type === "soft")) { 
    return NextResponse.json(
      ({ error: "Invalid request" }),
        { status: 400 }
    );
  }

  // completely remove item
  if(deletion_type === "hard") {
    const { error: hardDeleteError } = await supabase
      .from("equipment")
      .delete()
      .eq("id", id);

    if (hardDeleteError) {
      console.error("Hard Delete error:", hardDeleteError);
      return NextResponse.json({ error: hardDeleteError.message }, { status: 500 });
    }
  }
 
  // soft delete only fills in the "deleted by" & "deleted at" fields
  if(deletion_type === "soft") {

    const { error: softDeleteError } = await supabase
      .from("equipment")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.sub
      })
    .eq ("id", id)
    
    if (softDeleteError) {
      console.error("Soft Delete error:", softDeleteError);
      return NextResponse.json({ error: softDeleteError.message }, { status: 500 });
    }

  }

  return NextResponse.json({ success: true }, {status: 200});
}