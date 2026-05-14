// from the NextJs docs: "We recommend creating a DAL to centralize your data requests and authorization logic.
// The DAL should include a function that verifies the user's session as they interact with your application.
// Create a separate file for your DAL that includes a verifySession() function. 
// Then use React's cache API to memoize the return value of the function during a React render pass."

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserAndRole = cache(async () => { // gets the authenticated user, profile, and caches it
    console.log("fetching user");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims(); // using getClaims since it is faster than getUser
    const user = data?.claims;
    console.log('user object is ', user);

    if (error || !user) {
      return { user: null, role: "guest", full_name: null, email: null};
    }
 
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.sub)
      .is("deleted_at", null)
      .single();
    
    if (profileError) {
        console.error("Profile fetch error: ", profileError);
    }
    
    // now any server component can call getUserAndRole to get this infos
    return {
        user: user,
        role: profile?.role ?? "guest",
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null
    }
});