"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/popups/toast";

interface User {
  id: string;
  full_name: string;
  username: string;
  role: string;
  email?: string;
}

export default function UsersList({ refreshTrigger }: { refreshTrigger: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null); // ✅ popup state

  const[toastMessage, setToastMessage] = useState("");
  const[toastType, setToastType] = useState<"success" | "error">("error");

  const fetchUsers = async () => {
    const res = await fetch("/api/get-users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  // ✅ Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;

    const res = await fetch("/api/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userToDelete }),
    });

    const data = await res.json();

    if (res.ok) {
      // remove from UI instantly
      setUsers(prev => prev.filter(user => user.id !== userToDelete));
      setToastType("success");
      setToastMessage("User deleted successfully");
    } else {
      console.error(data.error);
      setToastType("error");
      setToastMessage(`Failed to delete user: ${data.error}`);
    }

    setUserToDelete(null); // close popup
  };

  const cancelDelete = () => {
    setUserToDelete(null); // close popup
  };


  const copyEmails = async (role?: string) => {
    
    const filteredUsers = role? users.filter((u) => u.role === role) : users;

    const emailList = filteredUsers
      .map((u) => u.email)
      .filter(Boolean)
      .join(", "); // copy and pasting a list of emals joined by , in gmail works well

    try {
      await navigator.clipboard.writeText(emailList);
      setToastType("success");
      setToastMessage(`Copied ${role? role : ""} emails to your clipboard!`);
    } catch (err: any) {
      console.error(err);
      setToastType("error");
      setToastMessage(`Copy failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50" onClick={() => copyEmails()}> Copy All Emails </button>

        <button className="bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50" onClick={() => copyEmails("admin")}> Copy Admin Emails </button>

        <button className="bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50" onClick={() => copyEmails("therapist")}> Copy Therapist Emails </button>

        <button className="bg-amber-200 rounded-xl py-1 px-3 mt-2 border hover:cursor-pointer hover:opacity-50" onClick={() => copyEmails("volunteer")}> Copy Volunteer Emails </button>
      </div>

      {/* USERS */}
      {users.map((user) => (
        <div key={user.id} className="bg-gray-100 p-3 rounded relative">

          {/* ❌ Delete Button */}
          <button
            onClick={() => setUserToDelete(user.id)}
            className="absolute top-2 right-3 text-red-500 font-bold text-lg"
          >
            ✕
          </button>

          <p><b>Full Name:</b> {user.full_name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </div>
      ))}

      {/* ✅ CUSTOM POPUP */}
      {userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FFC94A]/80 backdrop-blur-sm z-50">

          <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-[300px]">

            <p className="text-lg font-semibold mb-4">
              Delete user: {users.find(u => u.id === userToDelete)?.full_name}?
            </p>

            <div className="flex gap-4 justify-center">

              {/* Confirm */}
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>

              {/* Cancel */}
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}