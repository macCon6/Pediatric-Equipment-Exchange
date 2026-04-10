import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabase.from("equipment").insert([
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
        barcode_number:body.barcode_number
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item added!" });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}