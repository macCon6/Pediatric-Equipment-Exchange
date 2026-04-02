"use client";

import GalleryGrid from "@/components/gallery-logic";
import SideBar from "@/components/sidebar";
import { useState, useEffect } from "react";

export default function EquipmentGallery() {

    const [items, setItems] = useState([]);
    
    // useEffect ensures that the fetch is done before we get to the stuff in the return statemnt
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/equipment`);
                const data = await res.json();
                setItems(data);
                console.log(data);
            } catch(error) {
                throw new Error("COuld not fetch equipment")
            }
        }
        fetchItems(); 
    }, []);

    return (
        <div className = "flex min-h-screen w-full bg-[#51b6b6]">
            <SideBar />
            <main className = "flex-1 bg-[#51b6b6]">
                <div className ="text-2xl p-3"> Gallery Here </div>
                    {/* Passes the itmes to the gallery-logic component */}
                    <div className = "flex-1 p-6">
                        <GalleryGrid items ={items} />
                    </div>
                </main>
            </div>  
        );
}