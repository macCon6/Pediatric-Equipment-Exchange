import EquipmentDetails from "@/components/equipment-details";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default async function Item({ params }: { params: { id: string } }) {
  const { data: item, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", Number(params.id))
    .single();

  if (!item) {
    return <div>Item not found</div>;
  }

  return <EquipmentDetails item={item} />;
}