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