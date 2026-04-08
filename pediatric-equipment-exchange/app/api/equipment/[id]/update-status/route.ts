// For updating an item's status
// This will update a status, and may also add entries in the distributions or recipients table depending on the transition
// And may edit an entry in the distributions table depending on the transition

// NOTE: This route has been changed to NOT handle changing a status to "Allocated"
// Instead, that will be done after a waiver has been successfully signed

import {createClient} from "@supabase/supabase-js";
import { Status } from "@/item-field-options";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! //server only
);

export async function POST(req: Request) {

  const {equipment_id, target_status, current_status, distribution_id, staff_member, reservationFormData} = await req.json();

  // helper functions

  // update status in equipment table
  const updateEquipmentStatus = async (target_status: Status) => {
    const { data, error } = await supabase
      .from("equipment")
      .update({ status: target_status })
      .eq("id", equipment_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // create an entry in recipient table
  const createRecipient = async (reservationFormData: any) => {
    if (!reservationFormData) throw new Error("Reservation form empty");
    const { data: recipient, error } = await supabase
      .from("recipient")
      .insert({
        name: reservationFormData.name,
        contact_name: reservationFormData.contact_name,
        organization: reservationFormData.organization,
        email: reservationFormData.email,
        phone: reservationFormData.phone
      })
      .select()
      .single();
    if (error) throw error;
    return recipient.id; // need this for creating/editing an entry in the Distributions table
  };

  // create an entry in distributions table (item is reserved)
  const createDistribution = async (recipient_id: string) => {
    const { data, error } = await supabase
      .from("distributions")
      .insert({
        equipment_id,
        recipient_id,
        staff_member,
        notes: reservationFormData?.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // update returned_at status in Distributions table
  const updateReturnedAt = async () => {
    if (!distribution_id) throw new Error("Cannot return item, entry in distributions table not found");
    const { data, error } = await supabase
      .from("distributions")
      .update({ returned_at: new Date().toISOString() })
      .eq("id", distribution_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

   /* VALID TRANSITIONS:
    AVAILABLE:
        -> Reserved = reserving an item, must start an entry in Distributions and Recipients tables
        -> In Processing = maintenance, just update status
        *NOTE: available items cannot go straight to Allocated because the Reserved status handles entering recipient info

    RESERVED:
        -> Available = item wasn't picked up, complete the entry in Distributions table (update returned_at)

        // !! NO LONGER VALID - HANDLED IN SIGN-WAIVER ROUTE INSTEAD !!
        -> Allocated = Item was picked up, update Distributions table (update allocated_at). REQUIRES WAIVER SIGNATURE

    ALLOCATED:
        -> Available = item has been returned, complete the entry in Distributions table (update returned_at)
        -> In Processing = item has been returned but needs maintenance, complete the entry in Distributions table (update returned_at)

    IN PROCESSING:
        -> Available = maintenance done, just update status  */
  try {
    let result: any;
    switch (target_status) { // decide what to do depending on what the target status is 

    case "Available":
      // if allocated -> available or reserved -> available, it means the item is being returned
      if (current_status === "Allocated" || current_status === "Reserved") {
        try {
          result = await updateEquipmentStatus("Available");
          await updateReturnedAt(); // only gets here if updateEquipmentStatus doesn't throw
        } catch(error) {
          console.log("Failed to update returned_at field, rolling back to original status");
          await updateEquipmentStatus(current_status); // rollback to original status
        }
      }
      else {
        result = await updateEquipmentStatus("Available"); // in processing -> available
      }
      break;

    case "In Processing":
      if (current_status === "Available") { // available -> in processing
        result = await updateEquipmentStatus("In Processing");
      } else if (current_status === "Allocated") { // allocated -> in processing means the item is being returned
          try {
            result = await updateEquipmentStatus("In Processing");
            await updateReturnedAt(); // only gets here if updateEquipmentStatus doesn't throw
          } catch(error) {
            console.log("Failed to update returned_at field, rolling back to original status");
            await updateEquipmentStatus(current_status);
        }
      } else {
        throw new Error( `Cannot go from Reserved to In Processing, make item Available first`);
      }
      break;

    case "Reserved":
      if (current_status === "Available") { // available -> reserved, create recipient data based on reservation form info & start distribution entry

        // handle deleting the recipient/distribution information if one of them fails
        let created_recipient:any=null;
        let created_distribution:any=null;
        try {
          await updateEquipmentStatus("Reserved");
          created_recipient = await createRecipient(reservationFormData); //only creates if updateEquipmentStatus doesn't throw error
          result = await createDistribution(created_recipient); // only creates if createRecipient doesn't throw error
          created_distribution = result.id;
        } catch(error) {
            console.log("Error reserving item, rolling back to original status");
            await updateEquipmentStatus(current_status);
            if(created_recipient) { // pass the newly created id's to the table to delete them since an erorr happened
              await supabase.from("recipient").delete().eq("id", created_recipient);
            }
            if(created_distribution) {
              await supabase.from("distributions").delete().eq("id", created_distribution);
            }
        }
      } else {
        throw new Error(`Only Available items can be Reserved`);
      }
      break;

    // the Allocated case has been deleted as that is no longer a valid target status
      
    } // end of switch

    return new Response(JSON.stringify({success: true, result}), {status: 200});
  } // end of try block

  catch (error: any) {
    return new Response(JSON.stringify({success: false, error: error.message}), {status: 400}); }
}