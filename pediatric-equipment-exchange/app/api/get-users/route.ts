import { createClient } from "@/lib/supabase/server";

export async function GET() {

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }

  return new Response(JSON.stringify(data), { status: 200 });
}