"use client";

import { RecoverableItem } from "@/field_interfaces";
import { useRouter } from "next/navigation";
import Popup from "@/components/popups/popup";
import Confirm from "@/components/user-confirmation";
import { useState } from "react";
import Toast from "@/components/popups/toast";

interface Props {
  deleted_items: RecoverableItem[] | null
}

export default function RecoverEquipment({deleted_items}:Props) {

  const router = useRouter();

  const handleNavigation = (equipment_id: string) => {
    window.scrollTo(0, 0);
    router.push(`/items/${equipment_id}`);
  }


  const[recoveryChoice, setRecoveryChoice]=useState<"recover" | "delete">("recover");
  const[chosenEquipment, setChosenEquipment]=useState<{id: string, name: string, status: string}>();
  const[confirmationPopupOpen, setConfirmationPopupOpen] = useState(false); 
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  
  const handleClose = () => {
    setRecoveryChoice("recover");
    setConfirmationPopupOpen(false);
    setTimeout(() => { router.refresh(); }, 1000);
  };

  const handleChoice = (recovery_choice: "recover" | "delete", equipment_id: string, equipment_name: string, equipment_status: string) => {
    setRecoveryChoice(recovery_choice);
    setChosenEquipment({id: equipment_id, name: equipment_name, status: equipment_status});
    setConfirmationPopupOpen(true);
  }

  const handleDeleteOrRecovery = async (recovery_choice: string, equipment_id: string, equipment_status: string) => {

    if (recovery_choice === "delete") {
      try {
        const res = await fetch(`/api/equipment/${equipment_id}/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deletion_type: "hard",
              current_status: equipment_status
          }) 
        });

        if (!res.ok) {
          const result = await res.json();
          if (!res.ok) { throw new Error(result.error || "Failed to delete item"); }
        }
        setToastType("success");
        setToastMessage("Item deleted successfully!");
      
      } catch (err: any) {
        setToastType("error");
        setToastMessage(err.message || "Deletion failed");
      }
      finally {
        handleClose();
      }
    }

   else if(recovery_choice === "recover") {
      try {
        const res = await fetch(`/api/equipment/${equipment_id}/recover`, {
          method: "POST",
        });

        if (!res.ok) {
          const result = await res.json();
          if (!res.ok) { throw new Error(result.error || "Failed to recover item"); }
        } 
        setToastType("success");
        setToastMessage("Item recovered successfully!");
      } catch (err: any) {
        setToastType("error");
        setToastMessage(err.message || "Recovery failed");
      }
      finally {
        handleClose();
      }
   }
  };      

  if (deleted_items?.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg"> No recoverable items </p>
      </div>
    );
  }

  return (
    <div className="w-full px-2">

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

        {deleted_items?.map((entry) => (
          <div key={entry.id} className="p-4 hover:scale-105 cursor-pointer hover:shadow-2xl shadow-md border transition duration-100 rounded-3xl bg-white">

            <div className="flex flex-col gap-1 text-sm">
              <p className="font-bold tracking-wide bg-[#D8EBDB] text-center mb-2 py-2 rounded-xl">{entry.name}</p>

              <p className="text-center mb-3"><span className="text-blue-500 underline hover:text-blue-700" onClick={() => handleNavigation(entry.id)}> View Item Page </span> </p>

              <p><span className="font-semibold"> Barcode:</span> {entry.barcode_value}</p>

              <p><span className="font-semibold"> Deleted By:</span> {entry.deleted_staff.full_name}</p>

              <p><span className="font-semibold"> Deleted At:</span> <span className="text-gray-500"> {entry.deleted_at
                ? new Date(entry.deleted_at).toLocaleString() : "--"} </span> </p>
              
              <div className="flex-1 mx-auto space-x-6 mt-3">
             
                    <button className="flex-1 bg-[#5a9e3a] hover:opacity-50 hover:cursor-pointer border rounded-3xl text-white text-sm md:text-lg p-3"
                        onClick={() => handleChoice("recover", entry.id, entry.name, entry.status)}
                    >
                        Recover Item
                    </button>
                
              
                    <button className="flex-1 bg-red-600 hover:opacity-50 hover:cursor-pointer border rounded-3xl text-white text-sm md:text-lg p-3"
                         onClick={() => handleChoice("delete", entry.id, entry.name, entry.status)}
                    >
                        Hard Delete
                    </button>
                </div>
                
            </div>
          </div>
        ))}
      </div>

      {confirmationPopupOpen &&
        <Popup isOpen={confirmationPopupOpen} onClose ={handleClose} 
          sizingClassName={"max-w-sm md:max-w-lg w-full"}> 

          <Confirm 
            title={`${recoveryChoice === "recover"? "Recover Item" :  "Remove Item Permanently"}`}
              message={`${recoveryChoice === "recover"? "Are you sure you want to recover " : "Are you sure you want to permanently remove "} ${chosenEquipment?.name}?`}
              submessage={`${recoveryChoice === "recover"? "It will be visible once again in the equipment gallery." : "All distribution history will be deleted. This cannot be undone."}`}
              onConfirm= {async () => {
                 if (!chosenEquipment) return;
                await handleDeleteOrRecovery(
                  recoveryChoice,
                  chosenEquipment.id,
                  chosenEquipment.status
              );}}
              greenButtonText={"Confirm"}
              redButtonText={"Cancel"}
              onCancel={()=>{setConfirmationPopupOpen(false)}}
          />

        </Popup>
      }
    </div>
  );
}