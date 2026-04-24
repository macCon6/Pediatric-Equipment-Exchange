"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SideBar() {

    const [open, setOpen] = useState(false); // this will be used to know when to put the ☰ icon
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
            router.replace("/login-page");  
            router.refresh();            
    };

    return (
        <>
            {/* Mobile Menu Button*/}
            <button onClick={() => setOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow">
                ☰
            </button>
                                   
            {/* Overlay (click to close) */}
            {open && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden"
                     onClick={() => setOpen(false)}
                />
            )}
                                     
           <aside className = {`fixed top-0 left-0 w-28 h-[50vh] md:h-[50vh] bg-white border z-40 transform transition-transform duration-300 shadow-lg ring-1 ring-orange-300
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static
             flex flex-col overflow-hidden
            `}> 
               <ul className = "flex flex-col flex-1 gap-6 pt-18 sticky top-5">

                <li className="hover:scale-105 hover:opacity-50"> 
                    <Link href = "/equipment-gallery" className= "flex flex-col items-center gap-1"> 
                        <Image src ="/Icons/ItemGalleryIcon.png" alt="" width={40} height={40} />
                        <span className="text-xs text-center text-black"> Gallery </span> 
                    </Link> 
                </li>    

                <li className="hover:scale-105 hover:opacity-50"> 
                    <Link href = "/scanner" className= "flex flex-col items-center gap-1">
                        <Image src ="/Icons/QRcodeIcon.png" alt="" width={40} height={40} />
                        <span className="text-xs text-center text-black"> Scanner </span>
                    </Link> 
                </li>

                <li className="hover:scale-105 hover:opacity-50"> <Link href = "/item-intake" className= "flex flex-col items-center gap-1">
                        <Image src="/Icons/AddItemIcon.png" alt="" width={40} height={40} />
                        <span className="text-xs text-center text-black"> Add Item </span>
                    </Link> 
                </li>

                <li className="hover:scale-105 hover:opacity-50"> <Link href = "/dashboard" className= "flex flex-col items-center gap-1" >
                    <Image src="/Icons/AdminIcon.png" alt="" width={40} height={40} />
                    <span className="text-xs text-center text-black"> Dashboard </span>
                    </Link> 
                </li>

                <li className="mt-auto p-3"> <button 
                className="hover:cursor-pointer flex h-8 w-full items-center justify-center rounded-full bg-[#5a9e3a] 
                transition-colors hover:border-transparent hover:bg-[#4a8a2e] min-w-0 text-m text-white"
                onClick={handleSignOut}>
                    Signout
                </button>
                </li>
            </ul>
        </aside>
    </>
    )
}