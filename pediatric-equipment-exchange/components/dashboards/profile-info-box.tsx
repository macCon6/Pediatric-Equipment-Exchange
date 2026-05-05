// maybe use this component to let them edit their profile info?
/*
interface Props {
    user: any,
    role: string
    username: string,
    full_name: string
}

export default function ProfileInfo({user, role, username, full_name}: Props) {

    return (
        <>
        <div className="flex flex-col gap-5 bg-white border rounded-3xl p-6 "> 
            <h1 className="text-3xl text-center"> Welcome, <span className="italic">{username}</span> </h1>
            <div className="border-transparent rounded-3xl p-6 text-center"> 
                <h2 className="text-xl text-center mb-6"> Profile Info </h2>
                <p> <strong> Username: </strong> {username} </p>
                <p> <strong> Full Name: </strong> {full_name} </p>
                <p> <strong> Email: </strong> {user.email} </p>
                <p> <strong> Role: </strong> {role} </p>
            </div>
        </div>

        {role === "admin" &&
            <div className="p-4 flex flex-col items-center bg-white mt-3 border rounded-3xl"> 
                <h1 className="text-center text-lg font-bold"> In this dashboard, you can... </h1>
                <p className="text-center text-tiny italic mt-1"> Scroll the tab bar on mobile! </p>
                <ul className="list-disc p-4 space-y-3 text-base">
                    <li> View and update your profile info in the <strong className="text-green-600"> Profile Tab </strong></li>
                    <li> View, add, and delete users in the <strong className="text-green-600">  Users Tab </strong> </li>
                    <li> View & filter currently allocated equipment in the <strong className="text-green-600"> Allocations Tab </strong> </li>
                    <li> View & filter active reservations in the <strong className="text-green-600"> Reservations Tab </strong> </li>
                    <li> View & filter all distribution history in the <strong className="text-green-600"> History Tab </strong> </li>
                    <li> View and update the active waiver in the <strong className="text-green-600"> Waiver Tab </strong> </li>
                    <li> Recover soft deleted equipment in the <strong className="text-green-600"> Recovery Tab </strong> </li>
                </ul>
            </div>
        }
        </>
    );
}*/

   "use client";
   
   import { useState } from "react";
   
   interface Props {
     user: any;
     full_name: string;
     username: string;
     role: string;
   }
   
   export default function ProfileInfo({
     user,
     full_name,
     username,
     role,
   }: Props) {
     const [isEditing, setIsEditing] = useState(false);
   
     const [name, setName] = useState(full_name);
     const [email, setEmail] = useState(user?.email || "");
     const [userName, setUserName] = useState(username);
     const [loading, setLoading] = useState(false);
   
     const handleSave = async () => {
       setLoading(true);
   
       const res = await fetch("/api/update-user", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           id: user.id,
           full_name: name,
           username: userName,
           email,
         }),
       });
   
       const data = await res.json();
   
       if (data.error) {
         console.error(data.error);
       } else {
         setIsEditing(false);
       }
   
       setLoading(false);
     };
   
     return (
       <div className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto">
   
         <h2 className="text-lg font-bold mb-4 text-center">Profile</h2>
   
         {/* NAME */}
         <div className="mb-3">
           <label className="text-sm text-gray-500">Full Name</label>
   
           {isEditing ? (
             <input
               className="border p-2 w-full rounded"
               value={name}
               onChange={(e) => setName(e.target.value)}
             />
           ) : (
             <p className="font-semibold">{name}</p>
           )}
         </div>
   
         {/* USERNAME */}
         <div className="mb-3">
           <label className="text-sm text-gray-500">Username</label>
   
           {isEditing ? (
             <input
               className="border p-2 w-full rounded"
               value={userName}
               onChange={(e) => setUserName(e.target.value)}
             />
           ) : (
             <p>{userName}</p>
           )}
         </div>
   
         {/* EMAIL */}
         <div className="mb-3">
           <label className="text-sm text-gray-500">Email</label>
   
           {isEditing ? (
             <input
               className="border p-2 w-full rounded"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
           ) : (
             <p>{email}</p>
           )}
         </div>
   
         {/* ROLE (LOCKED) */}
         <div className="mb-4">
           <label className="text-sm text-gray-500">Role</label>
           <p className="capitalize">{role}</p>
         </div>
   
         {/* BUTTONS */}
         <div className="flex gap-3 mt-4 justify-center">
   
           {isEditing ? (
             <>
               <button
                 onClick={handleSave}
                 disabled={loading}
                 className="bg-green-500 text-white px-4 py-2 rounded"
               >
                 {loading ? "Saving..." : "Save"}
               </button>
   
               <button
                 onClick={() => setIsEditing(false)}
                 className="bg-gray-300 px-4 py-2 rounded"
               >
                 Cancel
               </button>
             </>
           ) : (
             <button
               onClick={() => setIsEditing(true)}
               className="bg-[#5a9e3a] px-4 py-2 rounded-xl font-semibold text-white"
             >
               Edit Profile
             </button>
           )}
   
         </div>
       </div>
     );
   }