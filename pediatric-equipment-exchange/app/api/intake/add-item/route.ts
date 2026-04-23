import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) { // only allow intake if logged in
    return NextResponse.json(
        ({ error: "Must be logged in to add items!" }),
        { status: 401 }
    );
  }

  try {
    
    const body = await req.json();
    
    if (!body.barcode_value) { 
      return NextResponse.json(
        ({ error: "Please attach a barcode!" }),
        { status: 400 }
      );
    }

    const normalizedBarcode = typeof body.barcode_value === "string" ? body.barcode_value.trim() : ""; // Normalize the barcode value by trimming whitespace. If it's not a string, default to an empty string.

    const { data, error } = await supabase
      .from("equipment")
      .insert([
        {
          name: body.name,
          category: body.category,
          subcategory: body.subcategory,
          condition: body.condition,
          description: body.description,
          size: body.size,
          color: body.color,
          status: body.status,
          donor: body.donor,
          image_urls: Array.isArray(body.image_urls)
            ? body.image_urls
            : null,
          location: body.location,
          barcode_value: normalizedBarcode === "" ? null : normalizedBarcode,
        },
      ])
      .select("id")
      .single();

    if (error) throw error; // throw the supabase error 

    return NextResponse.json({ message: "Item added!", id: data.id });

  } catch (error: any) {

    // catch Supabase errors

    if (error.code === "23505") { // Unique violation error code from Supabase/PostgreSQL when barcode_value conflicts with another item.
        return NextResponse.json(
          { error: "Barcode is already attached to another item." },
          { status: 409 }
        );
      }
    
    return NextResponse.json( 
      { error: error.message || "Database error" },
      { status: 500 }
    );
  }
}