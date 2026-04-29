import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserAndRole = cache(async () => {
    console.log("fetching user");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const user = data?.claims;
    console.log('user object is ', user);

    if (error || !user) {
      return { user: null, role: "guest", username: null, full_name: null};
    }
 
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, username, full_name")
      .eq("id", user.sub)
      .single();
    
    if (profileError) {
        console.error("Profile fetch error: ", profileError);
    }
    
    return {
        user: user,
        role: profile?.role ?? "guest",
        username: profile?.username ?? null,
        full_name: profile?.full_name ?? null
    }
});
