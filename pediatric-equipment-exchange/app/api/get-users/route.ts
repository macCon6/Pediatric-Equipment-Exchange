
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ users: data },
    { status: 200 }
  );
}
