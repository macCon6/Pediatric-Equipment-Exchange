"use client";

import EquipmentCard from "@/components/equipment-card";
import { ItemFields } from "@/mock-item-fields";
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
        const matchName = item.name.toLowerCase().includes(searchIgnoreCase);
        return matchName;
    });

    return (
            <>
            <div> 
                <div className = "px-4">
                    <input type="text" 
                        value = {searchTerm} // set the searchTerm variable to the user input
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search inventory..." />
                </div>

                {/* All equipment cards are being displayed in this grid */}
                <div className = "mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 bg-white p-6 border-whiet rounded-3xl">

                    {/* Creating an equipment-card component for each item */}
                    {itemMatches.map((item) => {
                        return (
                        <div key = {item.id}>
                        <EquipmentCard item ={item} /> 
                        </div> 
                        );
                    })
                    }
                </div> 
                </div>
            </>)
}