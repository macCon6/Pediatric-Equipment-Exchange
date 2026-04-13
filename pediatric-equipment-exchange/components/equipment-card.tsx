import { ItemFields } from "@/field_interfaces"
import Image from "next/image"
import Link from "next/link"

// All equipment in the gallery page is displayed using its own card component

export default function EquipmentCard({item}: {item: ItemFields}) {
     // give different statuses different colors
    const getStatusColor = () => {
        switch(item.status) {
            case "Available": return "bg-green-400";
            case "Reserved":  return "bg-yellow-500";
            case "Allocated": return "bg-red-800";
            case "In Processing": return "bg-sky-400";
        }
    }
    return (
        <>
        <Link href={`/items/${item.id}`}>

            <div className="hover:scale-105 cursor-pointer hover:shadow-2xl shadow-xl transition duration-100 border border-[#FFC94A] rounded-3xl p-4 bg-[#FFE09A] h-full">
                <Image 
                    src = {item.image_urls?.[0] ? item.image_urls[0]: "/missing-image.png"}
                    alt={item.name}
                    width = {180}
                    height = {100}
                    className="rounded-lg mx-auto"
                    priority 
                />
                <h1 className = "text-lg font-semibold text-center text-[#132540] leading-none mt-3 mb-3"> {item.name} </h1>
            
                <div className={`inline-flex flex-1 shadow-md rounded-4xl mt-2 ${getStatusColor()}`}> 
                    <p className = {`text-center text-sm font-bold m-2 text-white font-mono tracking-wide`}> {item.status} </p>
                </div>
                <p className = "px-2 text-sm text-[#132540] italic mt-3"> {item.condition} </p>
            </div>
        
        </Link>
        </>
    )
}