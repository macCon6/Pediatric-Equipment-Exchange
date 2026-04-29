// from the NextJs docs: "We recommend creating a DAL to centralize your data requests and authorization logic.
// The DAL should include a function that verifies the user's session as they interact with your application.
// Create a separate file for your DAL that includes a verifySession() function. 
// Then use React's cache API to memoize the return value of the function during a React render pass."
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

<<<<<<< HEAD
export const getUserAndRole = cache(async () => { // gets the authenticated user, profile, and caches it
    //rachel is having touble loggin in. put this here so i can edit pages
    //remember to delete this after edit is done
    const DEV_BYPASS = true;
    if(DEV_BYPASS) {
      return{
        user: {id: "dev-user"},
        role: "admin",
        username: "dev",
        full_name: "Dev User"
      };
    }*/
  
=======
export const getUserAndRole = cache(async () => {
>>>>>>> 1940cbdbbbb8b1e8b6853b856e9d0fae369461e8
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
