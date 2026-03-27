"use client"

import { ItemFields } from "@/mock-item-fields";
import Image from "next/image";
import SideBar from "@/components/sidebar";
import { useState } from 'react';

export default function EquipmentDetails({ item }: { item: ItemFields })  {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#51b6b6]">

        {/* Mobile Menu Button*/}
        <button 
            onClick={() => setOpen(true)}
            className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow">
            ☰
        </button>

        {/* Overlay (click to close) */}
        {open && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setOpen(false)}
            />
        )}
        <SideBar isOpen={open} onClose={() => setOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 p-6">

        <h1 className="text-white text-2xl mb-4 text-center">Equipment Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-auto md:grid-rows-2 gap-4">
        
          {/* Top Left - Image */}
          <div className="bg-white rounded-lg flex items-center justify-center">
            <Image 
             src={item.image_url}
              alt={item.name}
              width={250}
              height={150}
              className="rounded-lg"
              priority 
            />
          </div>

          {/* Bottom Left - QR Placeholder */}
          <div className="bg-white rounded-lg flex items-center justify-center">
            <p className="text-gray-500">BarCode Here</p>
          </div>

          {/* Right Side - Details (spans 2 rows) */}
          <div className="bg-white rounded-lg p-4 md:col-span-2">
            <ul className="text-[#132540] space-y-2">
              <li className="flex gap-10">
                <span><strong>Item Name:</strong> {item.name} </span> 
                <span><strong>Testing:</strong> {item.name} </span>
              </li>

              <li><strong>Status:</strong> {item.status}</li>
              <li><strong>Description:</strong> {item.description}</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}