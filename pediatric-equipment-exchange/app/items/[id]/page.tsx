import EquipmentDetails from "@/components/equipment-details";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Item(details: { params: any }) {

   const { id } = await details.params; // unwrap the Promise

  const equipment_id = id; 

  const { data: item, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", equipment_id)
    .single();

  if (!item) {
    return <div>Item not found</div>;
  }

  return <EquipmentDetails item={item} />;
}