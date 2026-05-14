"use client";

import { ReadableDistribution } from "@/field_interfaces";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface Props {
  allocated_items: ReadableDistribution[] | null
}

export default function AllocatedEquipment({allocated_items}:Props) {
  
  const router = useRouter(); // for clicking the row to go to the items deatils page

  const handleNavigation = (equipment_id: string) => {
    window.scrollTo(0, 0);
    router.push(`/items/${equipment_id}`);
  }

  // search and filtering
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClinics, setSelectedClinics] = useState<string[]>([]);
  
  // get clinics from data
  const clinics = [...new Set(allocated_items?.map(item => item.clinic_name ?? "").filter(c => c !== ""))]
  
  // Toggle a value in a multi-select filter
  const toggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }
  
  // Filter items based on all active filters
  const itemMatches = (allocated_items ?? []).filter((item) => {
  
    // for search bar
    const searchIgnoreCase = searchTerm.toLowerCase();
    const nameMatches = item.equipment_name?.toLowerCase().includes(searchIgnoreCase);
    const recipientNameMatches = item.recipient_name?.toLowerCase().includes(searchIgnoreCase);
    const caregiverNameMatches =  item.contact_name?.toLowerCase().includes(searchIgnoreCase);
  
    // for dropdowns
    const clinicMatches =  selectedClinics.length === 0 || selectedClinics.includes(item.clinic_name? item.clinic_name : "");
       
    return (nameMatches || recipientNameMatches || caregiverNameMatches) && clinicMatches;
  });
  
  const hasActiveFilters = selectedClinics.length > 0 || searchTerm;
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClinics([]);
  };
  
  // All active filter tags combined
  const allActiveTags = [
      ...selectedClinics.map(v => ({ value: v, type: "clinic" })),
  ];
  
  const removeTag = (value: string, type: string) => {
    if (type === "clinic") setSelectedClinics(selectedClinics.filter(v => v !== value)); 
  };
  

  if (allocated_items?.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg"> No allocated items </p>
      </div>
    );
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
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="🔎 By equipment, recipient, or caregiver name"
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-base font-semibold text-[#132540] mr-1">Filter & Sort:</span>


            {/* Clinic dropdown */}
            <div className="relative">
              <select
                onChange={e => {
                  if (e.target.value) { 
                    toggleFilter(e.target.value, selectedClinics, setSelectedClinics);
                    e.target.value = "";
                }}}
                className="border-2 border-[#132540] rounded-2xl px-3 py-2 bg-white text-[#132540] text-sm focus:outline-none cursor-pointer"
              >
              
                <option value=""> Clinic {selectedClinics.length > 0 ? `(${selectedClinics.length})` : ""} </option>
                  {clinics.map(clinic => (
                    <option key={clinic} value={clinic}
                      style={{ fontWeight: selectedClinics.includes(clinic) ? "bold" : "normal" }}>
                                    {selectedClinics.includes(clinic) ? "✓ " : ""}{clinic}
                    </option>
                  ))}
              </select>
            </div>

          {/* Results count */}
          <span className="text-sm text-gray-500 ml-auto">
              Showing {itemMatches?.length} of {allocated_items?.length} allocations
          </span>
        </div>

        {/* Active filter tags */}
        {allActiveTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {allActiveTags.map(tag => (
              <span key={`${tag.type}-${tag.value}`}
                className="flex items-center gap-1 bg-[#132540] text-white text-sm px-3 py-1 rounded-full"
              >
                <span className="text-xs text-gray-300 capitalize">{tag.type}:</span>
                  {tag.value}
                  <button onClick={() => removeTag(tag.value, tag.type)}
                          className="ml-1 hover:text-red-300 cursor-pointer"
                  > ✕
                  </button>
              </span>
            ))}

            {/* Clear all button */}
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-full px-3 py-1 text-sm transition-colors cursor-pointer"
              > Clear All
              </button>
            )}
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

        {itemMatches.map((entry) => (
          
          <div key={entry.id} className="p-4 hover:scale-105 cursor-pointer hover:shadow-2xl hover:bg-yellow-50 shadow-md border transition duration-100 rounded-3xl bg-white"
            onClick={() => handleNavigation(entry.equipment_id)}>
              
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-bold tracking-wide bg-[#D8EBDB] text-center mb-2 py-2 rounded-xl">{entry.equipment_name}</p>

                <p><span className="font-semibold"> Barcode:</span> {entry.equipment_barcode}</p>

                <p><span className="font-semibold"> Allocated To:</span> {entry.recipient_name}</p>

                <p><span className="font-semibold"> Caregiver:</span> {entry.contact_name}</p>

                <p><span className="font-semibold"> Caregiver Phone:</span> {entry.contact_phone}</p>

                <p><span className="font-semibold"> Caregiver Email:</span> {entry.contact_email}</p>

                <p><span className="font-semibold"> Clinic:</span> {entry.clinic_name}</p>

                 <p><span className="font-semibold"> Reserved By:</span> {entry.reserved_by_name} </p>

                  <p><span className="font-semibold"> Allocated By:</span> {entry.allocated_by_name} </p>

                <p><span className="font-semibold"> Allocated At:</span> <span className="text-gray-500"> {entry.allocated_at
                  ? new Date(entry.allocated_at).toLocaleString() : "--"} </span> </p>
              
                <span className="inline-flex items-center gap-1"> <span className="font-semibold">Waiver:</span> {entry.signed_waiver_url ? (
                  <Link href={entry.signed_waiver_url}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        className="text-blue-500 underline hover:text-blue-700"
                  >
                    Open in new tab
                  </Link> ) : ( <span className="text-gray-400"> Missing </span>)}
                </span>
                      
              </div>
          </div>
        ))}

       </div>
    </div>
  );
}