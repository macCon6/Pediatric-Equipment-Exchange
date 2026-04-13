import EquipmentDetails from "@/components/equipment-details";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Item(details: { params: any }) {

  const { id } = await details.params; // unwrap the Promise

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

  if (!item) {
    return (
      <div className="flex flex-1 bg-teal-700 h-screen justify-center items-center"> 
        <div className="flex bg-white w-1/2 h-1/2 items-center justify-center"> 
          <p className="text-6xl text-red-400 text-center font-mono"> Item not found! ☹ </p>
        </div>
      </div>
    )
  }

  return <EquipmentDetails item={item} />;
}