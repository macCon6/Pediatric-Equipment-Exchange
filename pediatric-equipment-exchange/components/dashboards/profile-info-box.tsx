// maybe use this component to let them edit their profile info?

"use client";

import { useState } from "react";

interface Props {
  user: any;
  role: string;
  username: string;
  full_name: string;
}

export default function ProfileInfo({
  user,
  role,
  username,
  full_name,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: username || "",
    full_name: full_name || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const res = await fetch("/api/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id || user.sub, // handles supabase auth
          username: formData.username,
          fullName: formData.full_name,
          email: formData.email,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setIsEditing(false);
      window.location.reload(); // simple refresh

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-white border rounded-3xl p-6">
      <h1 className="text-3xl text-center">
        Welcome, <span className="italic">{formData.username}</span>
      </h1>

      <div className="rounded-3xl p-6 text-center">
        <h2 className="text-xl mb-6">Profile Info</h2>

        {isEditing ? (
          <div className="flex flex-col gap-3 items-center">
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="border p-2 rounded w-64"
            />

            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="border p-2 rounded w-64"
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 rounded w-64"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>Username: {formData.username}</p>
            <p>Full Name: {formData.full_name}</p>
            <p>Email: {formData.email}</p>
            <p>Role: {role}</p>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}