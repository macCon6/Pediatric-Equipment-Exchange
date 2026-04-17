// i have changed this to be a server component and directly pull from supabase 
// instead of using an API for getting the equipment
// because duplicate tabs and pressing the back button caused an infinite spinner

import GalleryGrid from "@/components/gallery-grid";
import SideBar from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function EquipmentGallery() {

    const supabase = await createClient();

    const { data:items, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

        if (error) {
            throw new Error("Could not fetch equipment: " + error.message);
        }

    return (
        <div className = "flex min-h-screen w-full bg-[#FFC94A]">
            <SideBar />
            <main className = "flex-1 bg-[#FFC94A]">
                <div className ="text-2xl p-3"> Gallery Here </div>
                    {/* Passes the itmes to the gallery-logic component */}
                    <div className = "flex-1 p-6">
                        <GalleryGrid items ={items}/>
                    </div>
                </main>
            </div>  
        );
}