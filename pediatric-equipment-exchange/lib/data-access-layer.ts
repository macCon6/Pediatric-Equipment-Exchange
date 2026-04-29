// from the NextJs docs: "We recommend creating a DAL to centralize your data requests and authorization logic.
// The DAL should include a function that verifies the user's session as they interact with your application.
// Create a separate file for your DAL that includes a verifySession() function. 
// Then use React's cache API to memoize the return value of the function during a React render pass."
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserAndRole = cache(async () => {
    // updated to use getClaims instead because its faster
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
