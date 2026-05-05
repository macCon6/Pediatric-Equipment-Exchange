
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/data-access-layer";

export async function POST(req: Request) {

  const { user, role } = await getUserAndRole();

  if (!user) { 
    return NextResponse.json({ error: "Unauthorized"},
      {status: 401 });
  }
  
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  const supabase = await createClient();

  const { template_url } = await req.json();

  // check what version the last waiver was
  const { data: maxVersion } = await supabase
    .from("waiver_templates")
    .select("version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersion = (maxVersion?.version ?? 0) + 1; // add 1 to the latest version

  // mark active waiver(s) as inacitve
  const { error: changeActiveError } = await supabase
    .from("waiver_templates")
    .update({
      is_active: false
    })
    .eq ("is_active", true)
  
  if (changeActiveError) { return NextResponse.json({error: changeActiveError.message}, {status: 500}); }

  // insert this waiver with the new version and url, makr it as active
  const { error: insertError } = await supabase
    .from("waiver_templates")
    .insert({
      version: newVersion,
      is_active: true,
      template_url: template_url
    })

  if (insertError) { return NextResponse.json({error: insertError.message}, {status: 500}); }

  return NextResponse.json({ message: "Succesfully updated the active waiver"}, {status: 200});
}