import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: Request) {
  const supabase = await createClient();

  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing user id" }),
        { status: 400 }
      );
    }

    // ✅ Delete from Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      );
    }

    // ✅ Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}