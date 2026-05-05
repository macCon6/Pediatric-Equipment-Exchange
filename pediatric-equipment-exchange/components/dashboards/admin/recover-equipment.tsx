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

  const[recoveryChoice, setRecoveryChoice]=useState<"recover" | "delete">("recover");
  const[chosenEquipment, setChosenEquipment]=useState<{id: string, name: string, status: string}>();
  const[confirmationPopupOpen, setConfirmationPopupOpen] = useState(false); 
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  
  const handleClose = () => {
    setRecoveryChoice("recover");
    setConfirmationPopupOpen(false);
    router.refresh();
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

  
  if(deleted_items === null) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg animate-bounce"> Just a minute... </p>
      </div>
    );
  }


  return (
    <div className="w-full">

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

      {deleted_items.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
          <p className="text-gray-500"> No recoverable items </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#5a9e3a] text-white text-xs md:text-sm tracking-wide">
              <tr>
                <th className="text-left p-3"> Item Name </th>
                <th className="text-left p-4"> Deleted By </th>
                <th className="text-left p-4"> Deleted At </th>
                <th className="text-left p-4"> Recover </th>
                <th className="text-left p-4"> Hard Delete </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
            
              {deleted_items.map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-amber-100 even:bg-green-100 odd:bg-green-50 hover:cursor-pointer"
                 
                >
                  <td className="p-2 text-xs md:text-sm text-sky-500 underline"
                    onClick={() => router.push(`/items/${entry.id}`)}>
                    {entry.name}
                  </td>

                  <td className="p-4 italic">
                    {entry.deleted_staff.full_name}
                  </td>
                 
                  <td className="p-4 text-gray-500">
                    {entry.deleted_at
                      ? new Date(entry.deleted_at).toLocaleString()
                      : "--"}
                  </td>

                  <td className="p-4 text-gray-700">
                    <button className="flex-1 bg-[#5a9e3a] hover:opacity-50 hover:cursor-pointer border rounded-3xl text-white text-sm md:text-lg p-3"
                        onClick={() => handleChoice("recover", entry.id, entry.name, entry.status)}
                    >
                        Recover Item
                    </button>
                  </td>

                  <td className="p-4 text-gray-700">
                    <button className="flex-1 bg-red-600 hover:opacity-50 hover:cursor-pointer border rounded-3xl text-white text-sm md:text-lg p-3"
                         onClick={() => handleChoice("delete", entry.id, entry.name, entry.status)}
                    >
                        Hard Delete
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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