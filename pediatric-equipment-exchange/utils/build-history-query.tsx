// since the History tab in the Admin dash uses searchParams, due to needing pagination to avoid a giant fetch
// must filter on the server side before sending it to the client

import { createClient } from "@/lib/supabase/server";

// possible filters to build the url
export interface Props {
    page?: string,
    clinic?: string,
    status?: string,
    searchTerm?: string,
}

export async function BuildHistoryQuery( searchParams: Props ) {
  
  const supabase = await createClient();

  //for pagination
  const page = Number(searchParams?.page ?? 1);
  const pageSize = 8;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("readable_distribution")
    .select("*", {
        count: "exact", // for pagination total count
    });
  
  // filters
  if (searchParams.clinic) {
    query = query.eq("clinic_name", searchParams.clinic);
  }

  if (searchParams.status === "active") {
    query = query.is("returned_at", null);
  }

  if (searchParams.status === "cancelled") {
    query = query.not("cancelled_at", "is", null);
  }

  if (searchParams.status === "returned") {
    query = query.not("returned_at", "is", null).is("cancelled_at", null);
  }

  if (searchParams.searchTerm) {
     query = query.or(
        `equipment_barcode.ilike.%${searchParams.searchTerm}%, equipment_name.ilike.%${searchParams.searchTerm}%`
    );
  }

  query = query.range(from, to); // getting this slice of pages

  const { data: distributionRows, error: queryBuildError, count } = await query;

  if (queryBuildError) {
    console.error("History query failed:", queryBuildError);
  }

  return {
    all_distributions: distributionRows ?? [],
    page,
    pageSize,
    totalCount: count ?? 0, // total number of rows in table/filtered table
  };
}