import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Double-check on the server that they're actually an admin
  const { role } = await getUserAndRole();

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase
    .from("equipment")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}