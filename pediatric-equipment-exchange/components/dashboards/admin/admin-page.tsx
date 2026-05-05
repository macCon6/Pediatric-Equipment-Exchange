
// server page changes the url based on which tab is clicked, and fetches the
// relevant data only when that tab is clicked

import { createClient } from "@/lib/supabase/server";
import AdminTabs from "@/components/dashboards/admin/admin-tabs";
import { ReadableDistribution, RecoverableItem, WaiverTemplateFields } from "@/field_interfaces";

interface Props {
  user: any;
  role: string;
  this_username: string;
  full_name: string;
}

export default async function AdminPage({ user, role, this_username, full_name, searchParams}: Props & {
  searchParams: Promise<{ tab?: string; page?: string }>;
})  {

  const supabase = await createClient();

  const params = await searchParams;
  const tab = params?.tab ?? "profile";

  let allocated_items: ReadableDistribution[] | null = null;
  let reserved_items: ReadableDistribution[] | null = null;
  let all_distributions: ReadableDistribution[]| null = null;
  let deleted_items: RecoverableItem[] | null = null;
  let waiver_templates: WaiverTemplateFields[] | null = null;

  // fetch only necessaruy rows From the Readable Distributiuon View for allocations tab
  if (tab === "allocations") {
    const { data: distributions, error } = await supabase
      .from("readable_distribution")
      .select(`id, equipment_id, equipment_name, equipment_status, recipient_name, contact_name, clinic_name, allocated_at, signed_waiver_url`)
      .not("allocated_at", "is", null)
      .is("returned_at", null)
      .is("cancelled_at", null);
    
    console.log("fetched for allocations: ", distributions);
    if (error) {
      console.error("Error fetching for allocations:", error);
    }
  
    allocated_items = distributions ?? [];
  }

  // fetch onyl necessary rows From the Readable Distributiuon View for reservations tab
  if (tab === "reservations") {
    const { data: distributions, error } = await supabase
      .from("readable_distribution")
      .select("id, equipment_id, equipment_name, recipient_name, contact_name, clinic_name, reserved_by_name, reserved_at, signed_waiver_url")
      .not("reserved_at", "is", null)
      .is("allocated_at", null)
      .is("returned_at", null)
      .is("cancelled_at", null);
  
    console.log("fetched for reservations: ", distributions);
    if (error) {
      console.error("Error fetching for reservations:", error);
    }

    reserved_items = distributions ?? []; 
  }

   // fetch From the Readable Distributiuon View for history tab
  if (tab === "history") {
    
    const page = Number(params?.page ?? 1);
    const pageSize = 8;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: distributions, error } = await supabase
      .from("readable_distribution")
      .select("*")
      .range(from, to)
  
    console.log("fetched for history: ", distributions);
    if (error) {
      console.error("Error fetching for history:", error);
    }

    all_distributions = distributions ?? []; 
  }

  if (tab === "waiver") {
    const { data: waiverTemplates, error } = await supabase
      .from("waiver_templates")
      .select("*")
  
    console.log("fetched for waiver templates: ", waiverTemplates);

    if (error) {
      console.error("Error fetching for waiver templates:", error);
    }

    waiver_templates = waiverTemplates ?? [];
  }

  if (tab === "recovery") {
    const { data: deletions, error } = await supabase
      .from("equipment")
      .select("id, name, status, deleted_at, deleted_staff:deleted_by(full_name)")
      .not("deleted_at", "is", null)
      .overrideTypes<Array<{ deleted_staff: { full_name: string } }>>(); // so it doesn't return an array
  
    console.log("fetched for deleted items: ", deletions);

    if (error) {
      console.error("Error fetching for deleted items:", error);
    }

    deleted_items = deletions ?? [];
  }

  return (
    <AdminTabs
      user={user} role={role} this_username={this_username} full_name={full_name}
      active_tab={tab}
      allocated_items={allocated_items}
      reserved_items={reserved_items}
      all_distributions = {all_distributions} 
      waiver_templates = {waiver_templates}
      deleted_items = {deleted_items} />
  );
}