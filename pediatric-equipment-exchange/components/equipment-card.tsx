import { ItemFields } from "@/mock-item-fields"
import Image from "next/image"

// All equipment in the gallery page is displayed using its own card component

export default function EquipmentCard({item}: {item: ItemFields}) {
    return (
        <div className="border border-teal-200 rounded-3xl p-4 bg-teal-200"> 
            <Image 
                src = {item.image_url}
                alt={item.name}
                width = {150}
                height = {150}
                className="rounded-lg mx-auto"
                priority 
                />
        <h1 className = "text-lg font-semibold mt-2"> {item.name} </h1>
        <p className = "text-sm"> {item.status} </p>
        </div>
    )
}