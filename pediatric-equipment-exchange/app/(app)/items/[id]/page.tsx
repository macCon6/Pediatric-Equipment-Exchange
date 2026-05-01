import EquipmentDetails from "@/components/equipment-details";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";

export default async function Item(details: { params: any }) {

  const supabase = await createClient();

  const { id } = await details.params; // unwrap the Promise

  // To know what mode to be in in the equipment details page
  const { role } = await getUserAndRole();

  // Attempt to find the item by barcode first, then by ID, and finally by legacy ID  
  const lookupValue = decodeURIComponent(id); 
  let item = null;

  const { data: barcodeMatch, error: barcodeError } = await supabase // Lookup by barcode 
    .from("equipment")
    .select("*")
    .eq("barcode_value", lookupValue)
    .maybeSingle();

  if (!barcodeError && barcodeMatch) { // If a barcode match is found, use it as the item. If there's an error (other than no match), we ignore it and proceed to ID lookup.
    item = barcodeMatch;
  }

  const isUuid = // Check if the lookup value is in UUID format
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      lookupValue
    );

  // if no item found by barcode and UUID is valid, attempt to find by ID.  
  if (!item && isUuid) {
    const { data: idMatch } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", lookupValue)
      .maybeSingle();

    item = idMatch;
  }

  if (!item) {
    const { data: legacyMatch } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .maybeSingle();

    item = legacyMatch;
  }

  // Use the new "readable distribution" View to fetch all the necessary data joined from all the tables
  // So that the "reservation/allocation" details page can have all information
  // And the Admin page can reuse this View for its tabs
  const { data: distribution, error: distributionError } = await supabase
    .from("readable_distribution")
    .select("*")
    .eq("equipment_id", id)
    .is("returned_at", null)
    .maybeSingle();
  
  console.log("Server fetched distribution: ", distribution);
  console.log("Server error fetching distribution: ", distributionError);
  console.log("Role: ", role);

  if (!item) {
    return (
      <div className="flex flex-1 bg-[#FFC94A] h-screen justify-center items-center"> 
        <div className="-translate-y-18 flex bg-orange-100 p-6 border border-gray-100 shadow-lg  rounded-3xl w-3/4 mb-10 md:mr-20 md:mb-20 h-1/2 items-center justify-center"> 
          <p className="text-4xl text-orange-600 tracking-wide text-center "> Item not found </p>
        </div>
      </div>
    )
  }

  return <EquipmentDetails item={item} distribution={distribution} role={role} />;
}