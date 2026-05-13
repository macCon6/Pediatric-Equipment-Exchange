"use client";

import { ClinicFields, ReadableDistribution } from "@/field_interfaces";
import { getStatusDisplay } from "@/utils/history-status-display";
import { useRouter, useSearchParams, usePathname} from "next/navigation";
import Link from "next/link"; 
import { useState } from "react";

interface Props {
  all_distributions: ReadableDistribution[] | null,
  clinics: ClinicFields[] | null,
  page: number,
  pageSize: number,
  totalCount: number
}

export default function DistributionHistory({all_distributions, clinics, page, pageSize, totalCount }:Props) {
  
  const router = useRouter();

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleNavigation = (equipment_id: string) => {
    window.scrollTo(0, 0);
    router.push(`/items/${equipment_id}`);
  }

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") ?? "");

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(key, value);
    params.set("page", "1"); // reset pagination

    router.push(`${pathname}?${params.toString()}`);
  };

  
  const clearFilters = () => {
    setSearchInput("");

    const params = new URLSearchParams(searchParams.toString());

    params.delete("searchTerm");
    params.delete("clinic");
    params.delete("status");

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =  searchParams.get("searchTerm") || searchParams.get("clinic") || searchParams.get("status");

  const applySearch = (value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const finalValue = value ?? searchInput;

    if (finalValue) {
      params.set("searchTerm", finalValue);
    } else {
      params.delete("searchTerm");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    applySearch("");
  }

  return (
    <div className="w-full px-2">
      
      {/* Search + Filters box */}
      <div className="flex flex-col gap-3 bg-white rounded-3xl p-4 mb-3 border">

        {/* Search bar */}
        <div className="w-full">
          <div className="bg-gray-50 border-2
           border-[#132540] rounded-3xl w-full">
            <input
              type="text"
              className="w-full p-2 bg-transparent rounded-3xl text-xs tracking-tighter md:text-base tracking-tight focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔎 Search by equipment name or barcode"
            />
          </div>
          <button onClick={() => applySearch()} className="bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50 ">
              Apply Search
          </button> 
          <button onClick={() => handleClearSearch()} className="ml-3 bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50 ">
              Clear Search
          </button> 
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-base font-semibold text-[#132540] mr-1">Filter & Sort:</span>

            {/* Clinic filter dropdown */}
            <div className="relative">
              <select
                value={searchParams.get("clinic") ?? ""}
                onChange={(e) => updateFilter("clinic", e.target.value)}
                className="border-2 border-[#132540] rounded-2xl px-3 py-2 bg-white text-[#132540] text-sm focus:outline-none cursor-pointer"
              >
                <option value=""> All Clinics </option>

                {clinics?.map((clinic) => (
                  <option key={clinic.id} value={clinic.name}> {clinic.name} </option>
                ))}
              </select>
            </div>

            {/* Status filter dropdown */}
            <div className="relative">
              <select
                value={searchParams.get("status") ?? ""}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="border-2 border-[#132540] rounded-2xl px-3 py-2 bg-white text-[#132540] text-sm focus:outline-none cursor-pointer"
              >
                <option value=""> All Statuses </option>
                <option value="active"> Active </option>
                <option value="cancelled"> Cancelled </option>
                <option value="returned"> Returned </option>

              </select>
            </div>
            
           {hasActiveFilters && (
              <button onClick={clearFilters}
                className="border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-full px-3 py-1 text-sm transition-colors cursor-pointer"
              > Clear All
              </button>
          )}
          
          {/* Results count */}
          <span className="text-sm text-gray-500 ml-auto">
              Showing Page <span className="font-semibold">{page}</span> of{" "} <span className="font-semibold">{totalPages}</span>
              {" "}({totalCount} total results)
          </span>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      
      {all_distributions?.length === 0 ? (
        <div className="col-span-full flex-col flex justify-center items-center h-40 bg-white rounded-xl border">
          <p className="text-gray-500 text-base lg:text-lg">
            {hasActiveFilters? "No results match your filters" : "No distributions found"}
          </p>
           {hasActiveFilters && 
             <button className="bg-[#5a9e3a] p-2 hover:cursor-pointer hover:opacity-50 mt-4 text-white rounded-2xl text-lg"
             onClick={clearFilters}> 
              Reset filters </button>
           }
        </div>
      ) : ( <> 
        {all_distributions?.map((entry) => (
          
          <div key={entry.id} className="p-4 hover:scale-105 cursor-pointer hover:shadow-2xl hover:bg-yellow-50 shadow-md border transition duration-100 rounded-3xl bg-white"
            onClick={() => handleNavigation(entry.equipment_id)}>

            <div className="flex flex-col gap-1 text-sm">
              <p className="font-bold tracking-wide bg-[#D8EBDB] text-center mb-2 py-2 rounded-xl">{entry.equipment_name}</p>

              <p><span className="font-semibold"> Barcode:</span> {entry.equipment_barcode}</p>

              <p><span className="font-semibold"> Recipient:</span> {entry.recipient_name}</p>

              <p><span className="font-semibold"> Caregiver:</span> {entry.contact_name}</p>

               <p><span className="font-semibold">Caregiver Phone:</span> {entry.contact_phone}</p>

              <p><span className="font-semibold">Caregiver Email:</span> {entry.contact_email}</p>

              <p><span className="font-semibold"> Clinic:</span> {entry.clinic_name}</p>

              <p><span className="font-semibold"> Reserved By:</span> {entry.reserved_by_name} </p>

              <p><span className="font-semibold"> Reserved At:</span> <span className="text-gray-500"> {entry.reserved_at
                  ? new Date(entry.reserved_at).toLocaleString() : "--"} </span> </p>

              <p><span className="font-semibold"> Allocated By:</span>  {entry.allocated_by_name? entry.allocated_by_name : "--"} </p>

              <p><span className="font-semibold"> Allocated At:</span> <span className="text-gray-500"> {entry.allocated_at
                  ? new Date(entry.allocated_at).toLocaleString() : "--"} </span> </p>
              
              <p><span className="font-semibold"> Returned By:</span> {entry.returned_by_name? entry.returned_by_name : "--"} </p>

              <p><span className="font-semibold"> Returned At:</span> <span className="text-gray-500"> {entry.returned_at
                  ? new Date(entry.returned_at).toLocaleString() : "--"} </span> </p>
              
              <p><span className="font-semibold"> Cancelled By:</span> {entry.cancelled_by_name? entry.cancelled_by_name : "--"} </p>

              <p><span className="font-semibold"> Cancellation Reason:</span> {entry.cancellation_reason? entry.cancellation_reason : "--"} </p>
              
              <p><span className="font-semibold"> Cancelled At:</span> <span className="text-gray-500"> {entry.cancelled_at
                  ? new Date(entry.cancelled_at).toLocaleString() : "--"} </span> </p>
              
              <span className="inline-flex items-center gap-1"> <span className="font-semibold">Waiver:</span> {entry.signed_waiver_url ? (
                  <Link href={entry.signed_waiver_url}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        className="text-blue-500 underline hover:text-blue-700"
                  >
                    Open in new tab
                  </Link> ) : ( <span className="text-gray-400"> Missing </span>)}
              </span>
              
              <p className="font-semibold bg-green-50 mt-2 p-3 rounded-xl border"> Status:<span className={getStatusDisplay(entry).color}> {getStatusDisplay(entry).text} </span> </p>

            </div>
          </div>
        ))}
        </>
      )}
      </div>
      
      <div className="flex justify-center items-center space-x-6">
         <button
            className="bg-[#5a9e3a]  p-2 hover:cursor-pointer hover:opacity-50 mt-4 -translate-x-3 text-white rounded-2xl text-lg"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || totalCount === 0}
        >
            Previous
        </button>

        <div className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of{" "} <span className="font-semibold">{totalPages}</span>
        </div>

        <button 
            className="bg-[#5a9e3a]  py-2 px-6 hover:cursor-pointer hover:opacity-50 mt-4 translate-x-3 text-white rounded-2xl text-lg"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || totalCount === 0}>
            Next
        </button>
      </div>
    </div>
  );
}