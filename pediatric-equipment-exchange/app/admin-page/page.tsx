"use client"

import SideBar from "@/components/sidebar";
import { useState } from 'react';
import UsersList from "@/components/user-list";
import AllocatedEquipment from "@/components/allocated-equipment";
import { ItemFields } from "@/field_interfaces";

interface Props {
  items: ItemFields[];
}

export default function AdminPage({ items }: Props) {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleCreateUser = async () => {
    const role = isAdmin ? "admin" : "volunteer";
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        fullName,
        role,
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FFC94A]">

      <SideBar  />

      {/* Main Content */}
      <main className="flex-1 p-8 py-15 mb-10 w-full h-full">
        <h1 className="text-white text-2xl mb-8 text-center bg-[#5a9e3a] font-mono">
          Admin Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Create User Box */}
          <div className="bg-white rounded-lg p-4 flex flex-col gap-3 text-black">

            <div className="flex flex-col">
              <label className="text-sm">Full Name:</label>
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm">Username:</label>
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm">Password:</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="flex gap-3 items-center">
              <label className="text-sm">Make Admin?</label>
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  isAdmin ? "bg-[#5a9e3a]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    isAdmin ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleCreateUser}
              className="bg-[#5a9e3a] text-black rounded-full px-5 p-2 mt-2"
            >
              Create User
            </button>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg p-4 flex flex-col gap-3 text-black">
            <UsersList />
          </div>

          {/* Allocated Items (spans 2 columns) */}
          <div className="bg-white rounded-lg p-4 h-[50vh] overflow-y-auto md:col-span-2">
            <AllocatedEquipment items={items}/>
          </div>

        </div>
      </main>
    </div>
  );
}
