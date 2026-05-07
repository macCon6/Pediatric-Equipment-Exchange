"use client";

import { useState } from "react";
import UsersList from "@/components/dashboards/admin/user-list";
import Toast from "@/components/popups/toast";

export default function EditUsers() {

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  const [fullName, setFullName] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const [refreshUsers, setRefreshUsers] = useState(0);


  const handleCreateUser = async () => {
    
    let role = "volunteer";

    if(isAdmin) {
      role = "admin";
    }
    
    if(isTherapist) {
      role = "therapist";
    }

    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //  REQUIRED for auth
      body: JSON.stringify({
        email,
        username,
        password,
        fullName,
        role,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setToastType("success");
      setToastMessage("User added successfully!");

      // Clear form
      setEmail("");
      setUserName("");
      setPassword("");
      setFullName("");
      setIsAdmin(false);

      // Refresh user list instantly
      setRefreshUsers((prev) => prev + 1);

    } else {
      setToastType("error");
      if (res.status === 401) {
        setToastMessage("You must be logged in to create a user.");
      } else {
        setToastMessage(`${data.error || "Something went wrong"}`);
      }
    }
  };

  return (
  <>
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Create User Box */}
          <div className="bg-white rounded-lg p-4 flex flex-col gap-3 text-black">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm">Full Name:</label>
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm">Email:</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col">
              <label className="text-sm">Username:</label>
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            {/* Password */}
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

            {/* Admin Toggle */}
            <div className="flex gap-3 items-center">
              <label className="text-sm">Make Admin?</label>
              <button
                onClick={() => { setIsAdmin(!isAdmin); setIsTherapist(false)}}
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

            {/*therapist Toggle */}
            <div className="flex gap-3 items-center">
              <label className="text-sm">Make Therapist?</label>
              <button
                onClick={() => { setIsTherapist(!isTherapist), setIsAdmin(false)}}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  isTherapist ? "bg-[#5a9e3a]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    isTherapist ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            
            <p className="text-sm italic"> *Activating neither will give this user the Volunteer role. </p>
            {/* Submit */}
            <button
              onClick={handleCreateUser}
              disabled={!email || !password || !fullName}
              className="bg-[#5a9e3a] disabled:opacity-50 text-black rounded-full px-5 p-2 mt-2"
            >
              Create User
            </button>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg p-4 flex flex-col gap-3 text-black">
            <UsersList refreshTrigger={refreshUsers} />
          </div>

  
    </div>
    </>
  );
}