// this will be the api route to update everything except the Status in the item details
// just in case thye want to change the name, condition, etc.

import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const supabase = await createClient();

  const { user } = await getUserAndRole();
  
  if (!user) { 
    return NextResponse.json({ error: "Unauthorized"},
      {status: 401 });
  }
  
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
      location: newFieldsForm.location,
      barcode_value: normalizedBarcode === "" ? null : normalizedBarcode
    })
    .eq ("id", equipment_id)
    .select()
    .single();

    if (error?.code === "23505") { // Unique violation error code from Supabase/PostgreSQL when barcode_value conflicts with another item.
      return NextResponse.json({ success: false, error: "Barcode is already attached to another item." },
        { status: 409 }
      );
    }

    if (error) { return NextResponse.json({success: false, error: error.message}, {status: 400}); }

    return NextResponse.json({success: true}, {status: 200});
  
} 