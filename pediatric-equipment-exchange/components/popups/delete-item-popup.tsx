
"use client";

import { useState } from "react";
import Popup from "@/components/popups/popup"; 
import Confirm from "@/components/user-confirmation";

interface DeleteItemProps {
    equipment_id: string;
    current_status: string,
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
    showToast: (message: string, type: "success" | "error") => void
}

export default function DeleteItemPopup({equipment_id, current_status, isOpen, onClose, showToast}: DeleteItemProps) {

   const[mode, setMode] = useState<"confirm" | "choose">("choose");
   const[deletionType, setDeletionType] = useState<"soft" | "hard">("soft");

   const handleChoice = (deletionType: "soft" | "hard") => {
    setDeletionType(deletionType);
    setMode("confirm");
   }

   const handleClose = () => {
    onClose();  // close popup
    setDeletionType("soft");
    setMode("choose");
   };

   const confirmDelete = async (deletionType: string) => {
        try {
            const res = await fetch(`/api/equipment/${equipment_id}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deletion_type: deletionType,
                    current_status: current_status   
                }) 
            });

            if (!res.ok) {
                const result = await res.json();
                if (!res.ok) { throw new Error(result.error || "Failed to delete item"); }
            } else {
                handleClose();
                showToast("Item deleted successfully!", "success");
                setTimeout(() => { window.location.href = "/equipment-gallery"; }, 1200);
            }

        } catch (err: any) {
            console.error("Delete failed:", err);
            handleClose();
            showToast(err.message, "error");     
        }
    };      

    return (

        
        <Popup isOpen={isOpen} onClose ={handleClose} 
               sizingClassName={"max-w-sm md:max-w-lg w-full"}> 

           {/* Check which type of deletion */}

            {mode === "choose" && 
            <>
                <h2 className="text-2xl font-bold text-center text-[#132540]"> Soft or hard delete? </h2>

                <div className="mt-3 flex flex-col gap-4 w-full">
                    <p className="mt-2 mb-2"> Soft delete will preserve the item's distribution history. It will be visible and recoverable in the admin dashboard. </p>
                    <p className="mb-2"> Hard delete will completely remove the item and its history. It will not be recoverable. </p>

                    <button className="flex-1 bg-gray-400 hover:bg-gray-500 hover:cursor-pointer border rounded-3xl text-white text-lg p-3"
                        onClick={() => handleChoice("hard")}
                    >
                        Hard Delete
                    </button>

                    <button className="flex-1 bg-[#5a9e3a] hover:bg-[#4a8a2e] hover:cursor-pointer border rounded-3xl text-white text-lg p-3"
                        onClick={() => handleChoice("soft")}
                    >
                        Soft Delete
                    </button>

                </div>
            </>
        }

      {/* Confirm their choice */}

      {mode === "confirm" && deletionType === "hard" && 

        <Confirm title="Hard Delete"
            message={"Are you sure that you want to completely remove this item?"}
            submessage={"All distribution history will be removed. This cannot be undone!"}
            onConfirm= {async () => {
                await confirmDelete(deletionType);
            }}
            greenButtonText={"Remove it"}
            redButtonText={"Cancel"}
            onCancel={handleClose}
        />
      }

      {mode === "confirm" && deletionType === "soft" && 

        <Confirm title="Soft Delete"
            message={"Are you sure that you want soft delete this item?"}
            submessage={"The item will be recoverable through the admin dashboard."}
            onConfirm= {async () => {
                await confirmDelete(deletionType);
            }}
            greenButtonText={"Delete"}
            redButtonText={"Cancel"}
            onCancel={handleClose}
        />
      }

      </Popup>
    );
}