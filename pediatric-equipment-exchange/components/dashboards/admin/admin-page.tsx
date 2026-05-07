
// server page changes the url based on which tab is clicked, and fetches the
// relevant data only when that tab is clicked

import { createClient } from "@/lib/supabase/server";
import AdminTabs from "@/components/dashboards/admin/admin-tabs";
import { ReadableDistribution, RecoverableItem, WaiverTemplateFields, ClinicFields } from "@/field_interfaces";
import { BuildHistoryQuery } from "@/utils/build-history-query";

interface Props {
  user: any;
  role: string;
  this_username: string;
  full_name: string;
  email: string
}

export type HistoryData = {
  all_distributions: ReadableDistribution[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export default async function AdminPage({ user, role, this_username, full_name, email, searchParams}: Props & {
  searchParams: Promise<{ tab?: string; page?: string }>;
})  {

  const supabase = await createClient();

  const params = await searchParams;
  const tab = params?.tab ?? "profile";

  let allocated_items: ReadableDistribution[] | null = null;
  let reserved_items: ReadableDistribution[] | null = null;
  let deleted_items: RecoverableItem[] | null = null;
  let waiver_templates: WaiverTemplateFields[] | null = null;
  let history_data: HistoryData | null = null;
  let clinics: ClinicFields[] = [];

  // fetch only necessaruy rows From the Readable Distributiuon View for allocations tab
  if (tab === "allocations") {
    const { data: distributions, error } = await supabase
      .from("readable_distribution")
      .select(`id, equipment_id, equipment_barcode, equipment_name, equipment_status, reserved_by_name, recipient_name, contact_name, clinic_name, allocated_at, allocated_by_name, signed_waiver_url`)
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
      .select("id, equipment_id, equipment_barcode, equipment_name, recipient_name, contact_name, clinic_name, therapist_notes, reserved_by_name, reserved_at, signed_waiver_url")
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

   // fetch us9ing hte buildHistory helper for history tab
  if (tab === "history") {

    const { data } = await supabase
      .from("clinics")
      .select("id, name")
      .order("name")
    
    clinics = data ?? [];
       
    console.log("fetched clinics for history tab", clinics)

    history_data = await BuildHistoryQuery(params);

    console.log("fetched history");
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
      .select("id, name, status, barcode_value, deleted_at, deleted_staff:deleted_by(full_name)")
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
      user={user} role={role} this_username={this_username} full_name={full_name} email={email}
      active_tab={tab}
      allocated_items={allocated_items}
      reserved_items={reserved_items}
      history_data={history_data}
      clinics = {clinics}
      waiver_templates = {waiver_templates}
      deleted_items = {deleted_items} />
  );
}