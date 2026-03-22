import { ItemFields } from "@/mock-item-fields";
import Image from "next/image";

export default function EquipmentDetails({ item }: { item: ItemFields })  {

    return (
        <>
        
        <div className="flex min-h-screen min-w-screen bg-teal-800">
            <h1 className="text-white text-2xl"> Equipment Details </h1>
            <div> 
            <Image 
                src = {item.image_url}
                alt={item.name}
                width = {150}
                height = {150}
                className="rounded-lg mx-auto"
                priority 
                />
                </div>
            <ul className="text-white"> 
                <li> Item Name: {item.name} </li>
                <li> Item Status: {item.status} </li>
                <li> Item Description: {item.description} </li>
            </ul>
        </div>
        </>
    )
}
