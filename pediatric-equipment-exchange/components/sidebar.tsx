
"use client";
import Link from "next/link";

export default function SideBar() {
    return (
        <>
           <aside className = "w-28 min-h-screen flex flex-col border p-4 bg-white"> 
               <ul className = "flex flex-col space-y-2 gap-6">
                <li> <Link href = {"/equipment-gallery"}> Equipment Gallery </Link> </li>    
                <li> <Link href = {"/scanner"}> Scanner </Link> </li>
                <li> <Link href = {"/item-intake"}> Add Item </Link> </li>
                <li> <Link href = {"/admin-page"}> Admin Page </Link> </li>
                <li> <Link href = {"/"}> Sign Out </Link> </li>
             </ul>
        </aside>
    </>
    )
}