// from the NextJs docs: "We recommend creating a DAL to centralize your data requests and authorization logic.
// The DAL should include a function that verifies the user's session as they interact with your application.
// Create a separate file for your DAL that includes a verifySession() function. 
// Then use React's cache API to memoize the return value of the function during a React render pass."

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserAndRole = cache(async () => { // gets the authenticated user, profile, and caches it
    //rachel is having touble loggin in. put this here so i can edit pages
    //remember to delete this after edit is done
    const DEV_BYPASS = true;
    if(DEV_BYPASS) {
      return{
        user: {id: "dev-user"},
        role: "therapist",
        username: "dev",
        full_name: "Dev User"
      };
    }
  
  console.log("fetching user");
    const supabase =  await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, role: "guest", username: null, full_name: null}; // if no user, their role is guest
    }
 
    // fetch role & profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, username, full_name") // to display on their profile pages
      .eq("id", user.id)
      .single();
    
    if (profileError) {
        console.error("Profile fetch error: ", profileError);
    }
    
    // Now any server component can call getUserAndRole() and get this info
    return {
        user: user,
        role: profile?.role ?? "guest",
        username: profile?.username ?? null,
        full_name: profile?.full_name ?? null
    }
});