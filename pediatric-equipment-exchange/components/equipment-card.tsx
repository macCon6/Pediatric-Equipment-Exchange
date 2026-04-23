import { ItemFields } from "@/field_interfaces"
import Image from "next/image"
import Link from "next/link"

// All equipment in the gallery page is displayed using its own card component

export default function EquipmentCard({item}: {item: ItemFields}) {
     // give different statuses different colors
    const getStatusColor = () => {
        switch(item.status) {
            case "Available": return "bg-green-400";
            case "Reserved - Needs Signature":  return "bg-yellow-400";
            case "Reserved - Ready for Pickup":  return "bg-yellow-600";
            case "Allocated": return "bg-red-800";
            case "In Processing": return "bg-sky-400";
        }
    }
    return (
        <>
        <Link href={`/items/${item.id}`}>

            <div className="hover:scale-105 cursor-pointer hover:shadow-2xl shadow-xl transition duration-100 border border-[#FFC94A] rounded-3xl bg-[#FFE09A] h-full">
            
            <div> 
                <Image 
                    src = {item.image_urls?.[0] ? item.image_urls[0]: "/missing-image-placeholder.png"}
                    alt={item.name}
                    width = {350}
                    height = {250}
                    //on desktop make smaller width, on mobile full width
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="mx-auto p-4 border rounded-3xl aspect-3/4 "
                    loading="lazy"
                />
            </div>

                {/* Make titles clamp at 2 lines */}
                <h1 className = "px-1 py-1 text-md font-semibold text-center text-[#132540] line-clamp-2"> {item.name} </h1>
             
                {/* Box for makig the status/condition layout fit */}
                <div className="flex flex-col gap-3 p-2 items-center "> 
                    <div className={`px-4 py-2 rounded-full shadow-md text-sm text-center font-bold text-white tracking-wide font-mono ${getStatusColor()}`}> 
                        {item.status}
                    </div>
                    <p className = "text-sm text-[#132540] italic text-center"> {item.condition} </p>
                </div>
            </div>
        
        </Link>
        </>
    )
}