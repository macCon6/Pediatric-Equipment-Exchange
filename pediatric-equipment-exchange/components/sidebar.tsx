
"use client";
import Link from "next/link";
import Image from "next/image";

export default function SideBar() {
    return (
        <>
           <aside className = "w-28 min-h-screen flex flex-col border p-4 bg-white"> 
               <ul className = "flex flex-col space-y-2 gap-6 sticky top-5">
                <li className="hover:scale-105 hover:opacity-50"> 
                    <Link href = "/equipment-gallery" className= "flex flex-col items-center gap-1"> 
                        <Image src ="/Icons/ItemGalleryIcon.png" alt="" width={40} height={40} />
                        <span className="text-xs text-center text-black">Equipment</span> 
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

                <li className="hover:scale-105 hover:opacity-50"> <Link href = "/admin-page" className= "flex flex-col items-center gap-1">
                        <Image src="/Icons/AdminIcon.png" alt="" width={40} height={40} />
                        <span className="text-xs text-center text-black"> Admin Page </span>
                    </Link> 
                </li>

                <li> <Link 
            className="flex h-8 w-full items-center justify-center rounded-full bg-rose-400 px-5 transition-colors hover:border-transparent hover:bg-rose-300  md:w-[80px] text-m text-black"
            href="/"
          >
            Signout
          </Link></li>
             </ul>
        </aside>
    </>
    )
}