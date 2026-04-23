// For updating an item's status
// All of the logic for validating transitions have been moved into Supabase functions.
// They functions perform updates/inserts atomically, so no need for rollback logic here.

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const supabase = await createClient();

  // check that the user is logged in 
  const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return NextResponse.json(
        ({ error: "Must be logged in to edit items!" }),
        { status: 401 }
      );
    }
  
  // get the info of the user and throw error early if no profile / correct role
  // but, the rpc function itself will check user role and id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      ({ error: "Forbidden: Could not fetch profile" }),
      { status: 403 }
    );
  }


  const {distribution_id, equipment_id, target_status, reservationFormData, cancellationReason} = await req.json();

   /* VALID TRANSITIONS:

    AVAILABLE:
        -> Reserved (Needs Signature) = reserving an item, must start an entry in Distributions and Recipients tables
            * Therapist & Admin only!!
        -> In Processing = maintenance, just update status

        *NOTE: available items cannot go straight to Allocated because the Reserved status handles entering recipient info

    RESERVED - NEEDS SIGNATURE:
        -> Available = cancelled reservation, complete the entry in Distributions table (update returned_at)
            * Admin & Therapist who reserved it only!!

        -> Reserved (Ready for Pickup) = Waiver was signed, update waiver fields in Distributions table
            * Admin & Therapist who reserved it only!!
    
    RESERVED - READY FOR PICKUP:
        -> Available = item wasn't picked up, complete the entry in Distributions table (update returned_at)
            * Admin & Therapist who reserved it only!!

        -> Allocated = Item was picked up, update Distributions table (update allocated_at). REQUIRES WAIVER SIGNATURE
            * Admin, Therapists, Volunteers

    ALLOCATED:
        -> Available = item has been returned, complete the entry in Distributions table (update returned_at)
            * Admin, Therapists, Volunteers
        -> In Processing = item has been returned but needs maintenance, complete the entry in Distributions table (update returned_at)
            * Admin, Therapists, Volunteers

    IN PROCESSING:
        -> Available = maintenance done, just update status  */

    const { data: newStatus, error: transitionError } = await supabase.rpc("update_status", {
      p_distribution_id: distribution_id ?? null,
      p_equipment_id: equipment_id,
      p_target_status: target_status,
      p_reservation_data: reservationFormData ?? null,
      p_cancellation_reason: cancellationReason ?? null,
      p_waiver_template_id: null,
      p_signed_waiver_url: null
    });

    if (transitionError) { 
      console.error("Status transition failed:", transitionError);
      switch(transitionError.code) {

        case "P0001": // 400 bad request error
          return NextResponse.json({ error: transitionError.message }, { status: 400 }); 

        case "P0002": // 404 not found error
          return NextResponse.json({ error: transitionError.message }, { status: 404 });
      
        case "42501": // 403 permission denied error
          return NextResponse.json({ error: transitionError.message }, { status: 403 });
        
        default: // server error
          return NextResponse.json({ error: transitionError.message }, { status: 500 })

      }
    }
    
    return NextResponse.json({ message: `Status updated to ${newStatus}!` }, { status: 200 });  
}