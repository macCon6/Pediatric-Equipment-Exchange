"use client";

import { ReadableDistribution } from "@/field_interfaces";
import { useRouter } from "next/navigation";

interface Props {
  reserved_items: ReadableDistribution[]
}

export default function ReservedEquipment({reserved_items}:Props) {
  
  const router = useRouter(); // for clicking the row to go to the items deatils page

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Active Reservations
      </h2>

      {reserved_items.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
          <p className="text-gray-500"> No reserved items </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs tracking-wide">
              <tr>
                <th className="text-left p-4"> Item Name </th>
                <th className="text-left p-4"> Reserved For </th>
                <th className="text-left p-4"> Caregiver </th>
                <th className="text-left p-4"> Clinic </th>
                <th className="text-left p-4"> Reserved By </th>
                <th className="text-left p-4"> Reserved At </th>
                <th className="text-left p-4"> Waiver Signed? </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
            
              {reserved_items.map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-gray-200 hover:cursor-pointer"
                  onClick={() => router.push(`/items/${entry.equipment_id}`)}
                >
                  <td className="p-4 font-medium text-gray-900">
                    {entry.equipment_name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {entry.recipient_name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {entry.contact_name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {entry.clinic_name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {entry.reserved_by_name}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.reserved_at
                      ? new Date(entry.reserved_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.signed_waiver_url?
                      "Yes" : "No"}
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