// maybe use this component to let them edit their profile info?
"use client";
   
import { useState } from "react";
import Toast from "@/components/popups/toast";
import { useRouter } from "next/navigation";
   
interface Props {
  user: any;
  full_name: string;
  role: string;
  email: string
}
   
export default function ProfileInfo({user, full_name, role, email}: Props) {
  
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
   
  const [name, setName] = useState(full_name);
  const [updatedEmail, setUpdatedEmail] = useState(email);
  const [loading, setLoading] = useState(false);

  const[toastMessage, setToastMessage] = useState("");
  const[toastType, setToastType] = useState<"success" | "error">("error");

  const handleCancel = () => {
    setName(full_name);
    setUpdatedEmail(email);
    setIsEditing(false);
  };
   
  const handleSave = async () => {
    setLoading(true);
   
    const res = await fetch("/api/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: name,
        email: updatedEmail,
      }),
    });
   
    const data = await res.json();
   
    if (data.error) {
      console.error(data.error);
      setToastType("error");
      setToastMessage(data.error);
    } else {
      router.refresh();
      setIsEditing(false);
      setToastType("success");
      setToastMessage("Profile updated successfully!");

    }
    setLoading(false);
  };
   
  return (
    <div className="flex flex-col mt-auto items-center"> 
      <div className="border max-w-xl md:max-w-2xl w-full mx-auto bg-white p-6 rounded-2xl shadow-md">
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
         <h1 className="text-3xl text-center mb-4"> Welcome, <span className="italic">{full_name}</span> </h1>
   
      <div className="flex flex-col items-center bg-amber-50 pb-3 pt-5 gap-2 border-2 border-dashed border-amber-300 rounded-3xl px-2">
         {/* NAME */}
         <div className="mt-3 mb-3 text-center">
           <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
   
           {isEditing ? (
             <input
               disabled={loading}
               className="border p-2 w-full rounded text-center"
               value={name}
               onChange={(e) => setName(e.target.value)}
             />
           ) : (
             <p className="font-semibold">{name}</p>
           )}
         </div>
   
         {/* EMAIL */}
         <div className="mb-3 text-center">
           <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
   
           {isEditing ? (
             <input
               disabled={loading}
               className="border p-2 w-full rounded text-center"
               value={updatedEmail}
               onChange={(e) => setUpdatedEmail(e.target.value)}
             />
           ) : (
             <p>{updatedEmail}</p>
           )}
         </div>
   
         {/* ROLE (LOCKED) */}
         <div className="text-center">
           <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
           <p className="capitalize">{role}</p>
         </div>
   
         {/* BUTTONS */}
         <div className="flex gap-3 mt-4 mb-3 justify-center">
   
           {isEditing ? (
             <>
               <button
                 onClick={handleSave}
                 disabled={loading}
                 className="bg-green-500 text-white px-4 py-2 rounded hover:cursor-pointer hover:opacity-50"
               >
                 {loading ? "Saving..." : "Save"}
               </button>
   
               <button
                 disabled={loading}
                 onClick={handleCancel}
                 className="bg-gray-300 px-4 py-2 rounded hover:cursor-pointer hover:opacity-50"
               >
                 Cancel
               </button>
             </>
           ) : (
             <button
               disabled={loading}
               onClick={() => setIsEditing(true)}
               className="bg-[#5a9e3a] px-4 py-2 rounded-xl font-semibold text-white hover:cursor-pointer hover:opacity-50"
             >
               Edit Profile
             </button>
           )}
           </div>
        </div>
      </div>

      {role === "admin" && <>

        <div className="flex flex-col bg-white rounded-2xl p-3 shadow-lg mt-3 items-center max-w-lg border-2 border-dashed"> 
          <h2 className="text-lg font-semibold text-center mb-1"> In this dashboard, you can... </h2>
          <p className="text-center text-tiny italic mt-1"> Scroll the tab bar on mobile! </p>
          <ul className="list-disc p-4 space-y-2 text-base">
            <li> View and update your profile info in the <strong className="text-green-600"> Profile Tab </strong></li>
            <li> View, add, and delete users in the <strong className="text-green-600">  Users Tab </strong> </li>
            <li> View & filter currently allocated equipment in the <strong className="text-green-600"> Allocations Tab </strong> </li>
            <li> View & filter active reservations in the <strong className="text-green-600"> Reservations Tab </strong> </li>
            <li> View & filter all distribution history in the <strong className="text-green-600"> History Tab </strong> </li>
            <li> View and update the active waiver in the <strong className="text-green-600"> Waiver Tab </strong> </li>
            <li> Recover soft deleted equipment in the <strong className="text-green-600"> Recovery Tab </strong> </li>
          </ul>
        </div>
            </>
      }
    </div>
      
     );
   }