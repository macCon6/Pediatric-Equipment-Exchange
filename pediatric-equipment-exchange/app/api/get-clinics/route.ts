
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  
  const supabase = await createClient();

  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(clinics, 
    { status: 200 }
  );
}
