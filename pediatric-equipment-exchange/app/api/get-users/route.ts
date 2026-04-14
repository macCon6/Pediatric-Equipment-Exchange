
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*");

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({ users: data }), // ✅ IMPORTANT
    { status: 200 }
  );
}