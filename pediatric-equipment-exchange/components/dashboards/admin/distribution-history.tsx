"use client";

import { ReadableDistribution } from "@/field_interfaces";
import { useRouter, useSearchParams, usePathname} from "next/navigation";
import Link from "next/link"; // for the waiver

interface Props {
  all_distributions: ReadableDistribution[] | null
}

export default function DistributionHistory({all_distributions}:Props) {
  
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  if(all_distributions === null) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg animate-bounce"> Just a minute... </p>
      </div>
    );
  }

  return (
    <div className="w-full">

      {all_distributions.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
          <p className="text-gray-500"> No distributions found </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#5a9e3a] text-white text-xs md:text-sm tracking-wide">
              <tr>
                <th className="text-left p-4"> Item Name </th>
                <th className="text-left p-4"> Recipient </th>
                <th className="text-left p-4"> Caregiver </th>
                <th className="text-left p-4"> Clinic </th>
                <th className="text-left p-4"> Reserved By </th>
                <th className="text-left p-4"> Reserved At </th>
                <th className="text-left p-4"> Allocated By </th>
                <th className="text-left p-4"> Allocated At </th>
                <th className="text-left p-4"> Returned By </th>
                <th className="text-left p-4"> Returned At </th>
                <th className="text-left p-4"> Cancelled By </th>
                <th className="text-left p-4"> Cancellation Reason </th>
                <th className="text-left p-4"> Cancelled At </th>
                <th className="text-left p-4"> Signed Waiver </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
            
              {all_distributions.map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-amber-100 even:bg-green-100 odd:bg-green-50 hover:cursor-pointer"
                >
                 <td className="p-2 text-xs md:text-sm text-sky-500 underline"
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

                  <td className="p-4 italic">
                    {entry.reserved_by_name}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.reserved_at
                      ? new Date(entry.reserved_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 italic">
                    {entry.allocated_by_name? entry.allocated_by_name : "--"}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.allocated_at
                      ? new Date(entry.allocated_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 italic">
                    {entry.returned_by_name? entry.returned_by_name : "--"}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.returned_at
                      ? new Date(entry.returned_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 italic">
                    {entry.cancelled_by_name? entry.cancelled_by_name : "--"}
                  </td>

                  <td className="p-4 text-gray-700">
                    {entry.cancellation_reason? entry.cancellation_reason : "--"}
                  </td>

                  <td className="p-4 text-gray-500">
                    {entry.cancelled_at
                      ? new Date(entry.cancelled_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 text-red-500">
                    {entry.signed_waiver_url?
                      <Link href={entry.signed_waiver_url} className="text-sky-500 underline"> View Here </Link> : "None"}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center items-center space-x-6">
         <button
            className="bg-[#5a9e3a]  p-2 hover:cursor-pointer hover:opacity-50 mt-4 -translate-x-12 text-white rounded-2xl text-lg"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
        >
            Previous
        </button>

        <button 
            className="bg-[#5a9e3a]  p-2 hover:cursor-pointer hover:opacity-50 mt-4 translate-x-12 text-white rounded-2xl text-lg"
            onClick={() => goToPage(page + 1)}>
            Next Page
        </button>
      </div>
    </div>
  );
}