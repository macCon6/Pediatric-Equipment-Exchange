// get the active distribution for a piece of equipment, if there is one
// aka the row in the distribution table where == equipment_id & returned_at = null 

// updated to also grab the recipient info instead of a creating a new route for GET recipient
// also allocated by and reserved by statff names for the distribution details popup

import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, details: { params: any }) {

    const supabase = await createClient();

    const { id } = await details.params; // unwrap the Promise

    const equipment_id = id; 

    const { data, error } = await supabase
        .from("readable_distribution")
        .select("*") 
        .eq("equipment_id", equipment_id)
        .is("returned_at", null)
        .maybeSingle(); // if there's no distribution, it'll just return null. Otherwise returns the single active one
        
    if (error) {
        return new Response(JSON.stringify({error: error.message}), {status:500});
    }

    return new Response(JSON.stringify(data), {status:200});
}