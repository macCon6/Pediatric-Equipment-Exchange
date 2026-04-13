import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {

  const supabase = await createClient();
  
  try {
    const { username, password, fullName, role } = await req.json();

    // Validate input
    if (!username || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // new check to ensure every user has a valid role 
    const allowedRoles = ["admin", "physical_therapist", "volunteer"]
    if(!allowedRoles.includes(role)) {
      return new Response (
        JSON.stringify({ error: "Invalid role"}),
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();
    const email = `${cleanUsername}@paec.com`;

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          username: cleanUsername,
          role: role || "volunteer",
          fullName,
        },
      });

    if (authError) {
      console.error("Auth error: ", authError.message);
      return new Response(
        JSON.stringify({ error: authError.message || "Auth error" }),
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not returned from Supabase" }),
        { status: 500 }
      );
    }

    // Insert into profiles table
    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: fullName,
          role: role || "volunteer",
          username: cleanUsername, // make sure this column exists
        })

    if (profileError) {
      return new Response(
        JSON.stringify({
          error: profileError.message || "Database error creating profile",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({success: true, userId}),
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500 }
    );
  }
}