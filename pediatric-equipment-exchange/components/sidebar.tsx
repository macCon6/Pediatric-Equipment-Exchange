"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUI } from "@/app/providers/ui-provider";
import { useState, useEffect } from "react";

export default function SideBar() {

    const { sideBarOpen, setSideBarOpen } = useUI(); // using a global context since the hamburger icon is now on the Header

    // authentication, signout, and redirect
    const [user, setUser] = useState<any | null | undefined>(undefined);
    const supabase = createClient();
    const router = useRouter();
       
    const handleSignOut = async () => {
        const {error} = await supabase.auth.signOut();
        
        console.log("Sign out error:", error);

        if (error) {
            alert("sign out failed");
            return;
        }

        router.replace("/login-page");  
    };

    
    // fetch the user once on mount. this is only to know whether to show
    // the guest or authenticated user sidebar. all role specific UI is checked with the DAL
    useEffect(() => {
        const supabase = createClient();
        async function getUser() {
            const { data } = await supabase.auth.getClaims();
            setUser(data?.claims ?? null);
        }
        getUser();
    }, []); 

    // for when getClaims is loading
    if(user === undefined) {
        return (
            <aside className={`fixed left-0 top-14 w-28 h-[clamp(360px,55vh,500px)] bg-white z-40 transform transition-transform duration-300 shadow-lg
            ${sideBarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col lg:translate-x-0 lg:static border-2 rounded`}>
                <div className="flex flex-col flex-1 min-h-0">
                    <ul className="flex flex-col items-center gap-8 pt-[clamp(12px,4vh,72px)]">
                    </ul>
                </div>
            </aside>
        );
    }

    return (
        <>
         {/* Overlay (click to close) */}
        {sideBarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setSideBarOpen(false)} />
        )}
                                     
        <aside className = {`fixed left-0 top-14 w-28 h-[clamp(360px,55vh,500px)] bg-white z-40 transform transition-transform duration-300 shadow-lg
            ${sideBarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col lg:translate-x-0 lg:static border-2 rounded
            `}> 
            
            {/* Sidebar for a logged in user */}
            {user && 
                <div className="flex flex-col flex-1 min-h-0">
                    <ul className = "flex flex-col items-center gap-8 pt-[clamp(12px,4vh,72px)]">

                        <li className="hover:scale-105 hover:opacity-50"> 
                            <Link href = "/equipment-gallery" className= "flex flex-col items-center gap-1" onClick={() => setSideBarOpen(false)}> 
                                <Image src ="/Icons/ItemGalleryIcon.png" alt="Gallery Icon" 
                                    width={40}
                                    height={40}
                                    className="w-[clamp(20px,4vh,40px)] h-auto"/>
                                <span className="text-xs text-center text-black"> Gallery </span> 
                            </Link> 
                        </li>    

                        <li className="hover:scale-105 hover:opacity-50"> 
                            <Link href = "/scanner" className= "flex flex-col items-center gap-1" onClick={() => setSideBarOpen(false)}>
                                <Image src ="/Icons/QRcodeIcon.png" alt="Scanner Icon"
                                    width={40}
                                    height={40}
                                    className="w-[clamp(20px,4vh,40px)] h-auto"/>
                                <span className="text-xs text-center text-black"> Scanner </span>
                            </Link> 
                        </li>

                        <li className="hover:scale-105 hover:opacity-50">
                            <Link href = "/item-intake" className= "flex flex-col items-center gap-1" onClick={() => setSideBarOpen(false)}>
                                <Image src="/Icons/AddItemIcon.png" alt="Add Item Icon"
                                    width={40}
                                    height={40}
                                    className="w-[clamp(20px,4vh,40px)] h-auto"/>
                                <span className="text-xs text-center text-black"> Add Item </span>
                            </Link> 
                        </li>

                        <li className="hover:scale-105 hover:opacity-50">
                            <Link href = "/dashboard" className= "flex flex-col items-center gap-1" onClick={() => setSideBarOpen(false)} >    
                                <Image src="/Icons/AdminIcon.png" alt="Admin Icon"
                                    width={40}
                                    height={40}
                                    className="w-[clamp(20px,4vh,40px)] h-auto"/> 
                
                                <span className="text-xs text-center text-black"> Dashboard </span>
                            </Link> 
                        </li>
                    </ul>

                    <div className="mt-auto p-2">
                        <button className="w-full py-[clamp(4px,1vh,8px)] text-center text-sm rounded-full bg-[#5a9e3a] text-white hover:bg-[#4a8a2e]"
                            onClick={handleSignOut}> Signout
                        </button>
                    </div>
                </div>
            }

            {/* Sidebar for a guest user */}
            {user === null && 
                <>
                <ul className = "flex flex-col items-center gap-8 pt-[clamp(12px,4vh,72px)]">
                    <li className="hover:scale-105 hover:opacity-50"> 
                        <Link href = "/equipment-gallery" className= "flex flex-col items-center gap-1" onClick={() => setSideBarOpen(false)}> 
                            <Image src ="/Icons/ItemGalleryIcon.png" alt="Gallery Icon" 
                                width={40}
                                height={40}
                                className="w-[clamp(20px,4vh,40px)] h-auto"/>
                            <span className="text-xs text-center text-black"> Equipment Gallery </span> 
                        </Link> 
                    </li>  
                </ul>
                
                <div className="mt-auto text-center p-4 text-sm">
                    <p> Thank you for visiting! </p>
                </div>

                <div className="mt-auto p-2 flex flex-col gap-4">
                    <Link href="https://www.camp-horizon.com/">
                        <button className="w-full py-2 text-center text-sm rounded-full text-blue-500 hover:cursor-pointer hover:opacity-50 underline">
                            Back to Camp Horizon
                        </button>
                    </Link>
                    
                    <button className="w-full py-2 text-center text-sm rounded-full bg-[#5a9e3a] text-white hover:bg-[#4a8a2e]"
                        onClick={() => router.push("/login-page")}> Login
                    </button>
                </div>
                </>
            }
        </aside> 
        </>
    )
}