"use client";

import { createClient } from "@supabase/supabase-js";
import SideBar from "@/components/sidebar";
import { useForm, SubmitHandler } from "react-hook-form";
import { ItemFields } from "@/mock-item-fields";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  COLOR_OPTIONS,
} from "@/item-field-options";
import { useState } from "react";

//  Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ItemIntake() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFields>();

  const [open, setOpen] = useState(false);

  // Form submit → inserts into Supabase
  const onSubmit: SubmitHandler<ItemFields> = async (data) => {
    console.log("Form data:", data);

    const { error } = await supabase.from("equipment").insert([
      {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        condition: data.condition,
        description: data.description,
        size: data.size,
        color: data.color,
        status: data.status,
        donor: data.donor,
        image_url: "",
        qr_code_url: "",
      },
    ]);

    if (error) {
      console.error("Error inserting:", error.message);
    } else {
      console.log("Item added successfully!");
      reset(); // clears form after submit
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#51b6b6]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <SideBar isOpen={open} onClose={() => setOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col md:flex-row w-full gap-3 px-10 py-10">
        {/* Left side */}
        <div className="flex-1 flex-col gap-3 md:flex">
          <div className="flex-1 border-2 rounded-2xl border-teal-800 bg-white p-3">
            <p className="text-2xl text-center">Upload images</p>
          </div>

          <div className="flex-1 border-2 rounded-2xl border-teal-800 bg-white p-3">
            <p className="text-2xl text-center">
              Click to generate QR code
            </p>
            <div className="w-40 h-40 mx-auto border rounded-lg bg-white flex items-center justify-center"></div>
          </div>
        </div>

        {/* Form section */}
        <div className="flex-1 md:w-[400px] max-w-full border-2 border-teal-800 bg-white rounded-2xl overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 w-full p-4"
          >
            <input
              placeholder="*Item Name*"
              className="bg-rose-400 border border-rose-900 rounded-3xl text-black text-center px-6 py-2 text-2xl"
              {...register("name", { required: "Name is required!" })}
            />
            <p className="text-red-600 text-sm">
              {errors.name?.message}
            </p>

            <select
              {...register("category", {
                required: "Category is required!",
              })}
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <p className="text-red-600 text-sm">
              {errors.category?.message}
            </p>

            <select
              {...register("subcategory")}
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
            >
              <option value="">Select a subcategory</option>
              {SUBCATEGORY_OPTIONS.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>

            <select
              {...register("condition", {
                required: "Condition is required!",
              })}
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
            >
              <option value="">Select condition</option>
              {CONDITION_OPTIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>

            <p className="text-red-600 text-sm">
              {errors.condition?.message}
            </p>

            <input
              placeholder="Item description"
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
              {...register("description")}
            />

            <input
              placeholder="Size"
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
              {...register("size")}
            />

            <select
              {...register("color", {
                required: "Color is required!",
              })}
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
            >
              <option value="">Select a color</option>
              {COLOR_OPTIONS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <p className="text-red-600 text-sm">
              {errors.color?.message}
            </p>

            <select
              {...register("status", {
                required: "Status is required!",
              })}
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
            >
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <p className="text-red-600 text-sm">
              {errors.status?.message}
            </p>

            <input
              placeholder="Donor name"
              className="bg-rose-400 border border-black rounded-3xl text-center px-6 py-2"
              {...register("donor")}
            />

            <input
              type="submit"
              value="Submit"
              className="bg-rose-400 border border-black rounded-3xl px-6 py-2 text-xl cursor-pointer hover:bg-rose-300"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
