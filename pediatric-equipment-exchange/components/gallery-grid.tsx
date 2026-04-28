"use client";

import EquipmentCard from "@/components/equipment-card";
import { ItemFields } from "@/field_interfaces";
import { useState } from "react";

interface Props {
    items: ItemFields[];
}

export default function GalleryGrid( {items}: Props) {

    // useState React Hook makes a state variable, searchTerm
    const[searchTerm, setSearchTerm] = useState<string>("");
    
    // find the items whose name/description match the search term
    const itemMatches = items.filter((item) => {
        const searchIgnoreCase = searchTerm.toLowerCase();
        const nameMatches = item.name.toLowerCase().includes(searchIgnoreCase);
        return nameMatches;
    });

    return (
            
        <div className="flex flex-col min-h-0 w-full">
            {/* Search bar */}
            <div className="w-full flex rounded-3xl p-1">
                <div className="w-full max-w-[16rem] md:max-w-md lg:max-w-2xl xl:max-w-3xl">
                    <div className="bg-white border-2 border-[#132540] rounded-3xl w-full h-10">
                        <input type="text" 
                            className="w-full px-3 py-2"
                            value = {searchTerm} // set the searchTerm variable to the user input
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder = "Search inventory..." />
                     </div>
                </div>
            </div>
             
            {/* All equipment cards are being displayed in this grid  */}
            
            <div className = "mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white p-4 rounded-3xl">
                {items.length===0 &&
                    <div className = "flex flex-col gap-6 bg-orange-100 border p-6 border border-gray-100 shadow-lg rounded-3xl col-span-4 m-10 justify-self-center">
                        <span className="text-orange-700 font-semibold underline text-xl text-center"> No Items Found!  </span>
                        <span className="text-orange-700 text-center text-xl tracking-wide"> Use the "Add Item" tab to add equipment! </span>
                    </div>
                    
                }
                {/* Creating an equipment-card component for each item */}
                {itemMatches.map((item) => (
                    <EquipmentCard key={item.id} item ={item}/>
                ))}
            </div>     
        </div>
    )
}