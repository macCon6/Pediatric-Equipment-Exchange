import { ItemFields } from "@/mock-item-fields"
import Image from "next/image"
import Link from "next/link"

// All equipment in the gallery page is displayed using its own card component

export default function EquipmentCard({item}: {item: ItemFields}) {
    return (
        <>
        <Link href={`/items/${item.id}`}>
        <div className="hover:scale-105 hover:cursor-pointer hover:shadow-xl transition duration-100 border border-[#99d9d9] rounded-3xl p-4 bg-[#99d9d9]"> 
            <Image 
                src = {item.image_url}
                alt={item.name}
                width = {150}
                height = {150}
                className="rounded-lg mx-auto"
                priority 
                />
        <h1 className = "text-lg font-semibold mt-2 text-[#132540]"> {item.name} </h1>
        <p className = "text-sm text-[#132540]"> {item.status} </p>
        <p className = "text-sm text-[#132540]"> {item.condition} </p>
        </div>
        </Link>
        </>
    )
}