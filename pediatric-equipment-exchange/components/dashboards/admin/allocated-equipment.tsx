"use client";

import { ReadableDistribution } from "@/field_interfaces";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  allocated_items: ReadableDistribution[] | null
}

export default function AllocatedEquipment({allocated_items}:Props) {
  
  const router = useRouter(); // for clicking the row to go to the items deatils page
  
  if(allocated_items === null) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg animate-bounce"> Just a minute... </p>
      </div>
    );
  }


  return (
    <div className="w-full">

      {allocated_items.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
          <p className="text-gray-500"> No allocated items </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
             <thead className="bg-[#5a9e3a] text-white text-xs md:text-sm tracking-wide">
              <tr>
                <th className="text-left p-4"> Item Name </th>
                <th className="text-left p-4"> Allocated To </th>
                <th className="text-left p-4"> Caregiver </th>
                <th className="text-left p-4"> Clinic </th>
                <th className="text-left p-4"> Allocated At </th>
                <th className="text-left p-4"> Signed Waiver </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
            
              {allocated_items.map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-amber-100 even:bg-green-100 odd:bg-green-50 hover:cursor-pointer"
                >
                  <td className="p-4 text-xs md:text-sm text-sky-500 underline"
                    onClick={() => router.push(`/items/${entry.equipment_id}`)}>
                    {entry.equipment_name}
                  </td>

                  <td className="p-4 text-gray-900">
                    {entry.recipient_name}
                  </td>

                  <td className="p-4 text-gray-900">
                    {entry.contact_name}
                  </td>

                  <td className="p-4 text-gray-900">
                    {entry.clinic_name}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.allocated_at
                      ? new Date(entry.allocated_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 text-red-500">
                    {entry.signed_waiver_url?
                      <Link href={entry.signed_waiver_url} className="text-blue-500 underline"> View Here </Link> : "None"}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}