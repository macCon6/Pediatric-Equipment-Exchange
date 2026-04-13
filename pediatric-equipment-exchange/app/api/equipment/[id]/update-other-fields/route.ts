// this will be the api route to update everything except the Status in the item details
// just in case thye want to change the name, condition, etc.

import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! //server only
);

export async function POST(req: Request) {

  const {equipment_id, newFieldsForm} = await req.json();
  const normalizedBarcode = typeof newFieldsForm.barcode_value === "string" ? newFieldsForm.barcode_value.trim() : ""; // Normalize the barcode value by trimming whitespace. If it's not a string, default to an empty string.

  const { error } = await supabase
    .from("equipment")
    .update({
      name: newFieldsForm.name,
      category: newFieldsForm.category,
      subcategory: newFieldsForm.subcategory,
      condition: newFieldsForm.condition,
      size: newFieldsForm.size,
      color: newFieldsForm.color,
      description: newFieldsForm.description,
      barcode_value: normalizedBarcode === "" ? null : normalizedBarcode
    })
    .eq ("id", equipment_id)
    .select()
    .single();

    if (error?.code === "23505") { // Unique violation error code from Supabase/PostgreSQL when barcode_value conflicts with another item.
      return new Response(
        JSON.stringify({ success: false, error: "Barcode is already attached to another item." }),
        { status: 409 }
      );
    }

    if (error) { return new Response(JSON.stringify({success: false, error: error.message}), {status: 400}); }

    return new Response(JSON.stringify({success: true}), {status: 200});
  
} 