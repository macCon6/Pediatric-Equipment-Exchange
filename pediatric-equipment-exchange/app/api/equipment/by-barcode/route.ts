import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const supabase = await createClient();

    // Extract barcode from query params
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get("barcode");

    console.log("[DEBUG][api/equipment/by-barcode] incoming barcode:", barcode);

    if (!barcode || barcode.trim() === "") {
        console.log("[DEBUG][api/equipment/by-barcode] barcode is empty");
        return new Response(JSON.stringify({ error: "barcode required" }), { status: 400 });
    }

    const { data, error } = await supabase
        .from("equipment")
        .select("id")
        .eq("barcode_value", barcode)
        .maybeSingle();

    console.log("[DEBUG][api/equipment/by-barcode] query error:", error?.message ?? null);
    console.log("[DEBUG][api/equipment/by-barcode] found equipment id:", data?.id ?? null);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
        return new Response(JSON.stringify({ error: "Equipment not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ id: data.id }), { status: 200 });
}
