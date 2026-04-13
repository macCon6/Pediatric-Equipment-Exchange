import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
          qr_code_url: "",
        },
      ])
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") { // Unique violation error code from Supabase/PostgreSQL when barcode_value conflicts with another item.
        return NextResponse.json(
          { error: "Barcode is already attached to another item." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item added!", id: data.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}