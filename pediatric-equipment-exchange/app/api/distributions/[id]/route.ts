// get the active distribution for a piece of equipment, if there is one
// aka the row in the distribution table where == equipment_id & returned_at = null 

// updated to also grab the recipient info instead of a creating a new route for GET recipient

import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! //server only
);

export async function GET(req: Request, details: { params: any }) {

    const { id } = await details.params; // unwrap the Promise

    const equipment_id = id; 

    const { data, error } = await supabase
        .from("distributions")
        .select("*, recipient:recipient_id(*)") //can get the recipient cause recipient_id is a foreign key
        .eq("equipment_id", equipment_id)
        .is("returned_at", null)
        .maybeSingle(); // if there's no distribution, it'll just return null. Otherwise returns the single active one

    console.log("rows:", data, "error:", error);
        
    if (error) {
        return new Response(JSON.stringify({error: error.message}), {status:500});
    }

    return new Response(JSON.stringify(data), {status:200});
}