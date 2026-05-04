
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse, NextRequest } from "next/server";

export async function POST( request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    
  const { user, role } = await getUserAndRole();

  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();

  const { id } = await params;
  
  const { error } = await supabase
    .from("equipment")
    .update({
      deleted_at: null,
      deleted_by: null
    })
    .eq ("id", id)
    .select()
    .single();

    if (error) {
      console.error("Recovery error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({success: true}, {status: 200});
  
} 