"use client";

import SideBar from "@/components/sidebar";
import { useForm, SubmitHandler } from "react-hook-form";
import { ItemFields } from "@/field_interfaces";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  COLOR_OPTIONS,
} from "@/item-field-options";
import { useEffect, useRef, useState } from "react";
import Toast from "@/components/popups/toast";
import { createClient } from "@supabase/supabase-js";
import {
  Html5QrcodeScanType,
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

// Supabase client (ONLY for image upload)
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

  const [imageUrls, setImageUrls] = useState<string[]>([]); // allow multiple image uploads
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false); 
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const barcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Barcode scanner effect
  useEffect(() => { // Initialize barcode scanner when the scanner is opened. Cleanup on close or unmount.
    if (!barcodeScannerOpen) return;

    const scanner = new Html5QrcodeScanner( 
      "attach-barcode-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128, // currently used barcode format
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      },
      false
    );

    barcodeScannerRef.current = scanner;

    scanner.render( //
      async (decodedText) => {
        const normalizedCode = decodedText.trim();
        if (!normalizedCode) return;

        setBarcodeValue(normalizedCode);
        setBarcodeScannerOpen(false);

        try {
          await scanner.clear();
        } catch {
          // Ignore scanner clear errors on close.
        }
      },
      () => {
        // Expected while camera is searching.
      }
    );

    return () => {
      if (barcodeScannerRef.current) {
        void barcodeScannerRef.current.clear().catch(() => {
          // Ignore scanner clear errors on unmount.
        });
      }
    };
  }, [barcodeScannerOpen]);

  //  Upload image
  const handleImageUpload = async (e: any) => {
    const images = e.target.files;
    if (!images) return;
    setUploading(true);
    const uploadedUrls: string[]=[...imageUrls];

    for(const image of images) { // loop through to upload all of the images
      const fileName = `${Date.now()}-${image.name}`;
      const { error } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, image);

      if (error) {
        setToastType("error");
        setToastMessage("Upload error: " + error.message);
        setUploading(false);
        return;
      }

      // for displaying the images, get them from the storage
      const { data } = supabase.storage
        .from("equipment-images")
        .getPublicUrl(fileName);
      
      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }

      setImageUrls(uploadedUrls);
      setUploading(false);
    } // end of loop
  };

  // Submit → API
  const onSubmit: SubmitHandler<ItemFields> = async (data) => {
    try {
      const res = await fetch("/api/intake/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image_urls: imageUrls.length > 0? imageUrls : null,
          barcode_value: barcodeValue.trim() === "" ? null : barcodeValue.trim(),
        })
      });

      const result = await res.json();

      if (!res.ok) {
        setToastType("error");
        setToastMessage("Failed to add item");
      } else {
        setToastType("success");
        setToastMessage("Item added succesfully!");
        reset();
        setImageUrls([]);
        setBarcodeValue("");
        setBarcodeScannerOpen(false);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FFC94A]">
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
      <SideBar />
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row w-full gap-3 border-teal-800S px-10 py-10">

        {/* LEFT SIDE */}
        <div className="flex-1 flex-col gap-3 md:flex">

          {/*  Upload images */}
          <div className="flex-1 border-3 rounded-2xl border-teal-800 bg-white p-3 flex flex-col items-center justify-center">
            <p className="text-2xl text-center mb-3"> Upload images </p>

            {/* hidden input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="fileUpload"
              className="hidden"
              multiple
            />

            {/* styled button */}
            <label
              htmlFor="fileUpload"
              className="bg-[] border border-black rounded-3xl px-6 py-2 cursor-pointer hover:bg-[#4a8a2e]"
            >
              Choose Image
            </label>

            {uploading && (
              <p className="text-center mt-2">Uploading...</p>
            )}

            {imageUrls && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    className="mt-4 w-full h-64 object-cover rounded-lg"
                  /> 
                  ))
                } 
              </div>
            )}
          
            

          {/* Barcode attachment section */}
          <div className="flex-1 border-3 rounded-2xl border-teal-800 bg-white p-3">
            <p className="text-2xl text-center">Attach Barcode</p>
            <p className="mt-2 text-center text-sm text-gray-700">
              Scan a barcode label or type it manually.
            </p>

            <input
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
              placeholder="Barcode value"
              className="mt-4 w-full rounded-2xl border border-black px-4 py-2 text-center"
            />

            <div className="mt-3 flex gap-2"> 
              <button
                type="button"
                className="flex-1 rounded-2xl border border-black bg-rose-400 px-4 py-2 text-black hover:bg-rose-300"
                onClick={() => setBarcodeScannerOpen((current) => !current)}
              >
                {barcodeScannerOpen ? "Close Scanner" : "Scan Barcode"}
              </button>

              <button 
                type="button"
                className="rounded-2xl border border-black bg-white px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => setBarcodeValue("")}
              >
                Clear
              </button>
            </div>

            {barcodeScannerOpen && (
              <div className="mt-4 rounded-lg border bg-white p-2">
                <div id="attach-barcode-reader" className="w-full" />
              </div>
            )}

            <p className="mt-3 text-center text-sm text-[#132540]">
              Attached value: <span className="font-semibold">{barcodeValue.trim() === "" ? "None" : barcodeValue.trim()}</span>
            </p>
          </div>
        </div>

        {/* FORM SECTION (UNCHANGED STYLE) */}
        <div className="flex-1 flex-col md:w-[400px] max-w-full border-2 border-teal-800 bg-white rounded-2xl overflow-y-auto flex min-h-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-1 w-full p-4"
          >

            <input
              placeholder="*Item Name*"
              className="bg-[#5a9e3a] border border-[#4a8a2e] rounded-3xl placeholder-black text-black text-center px-6 py-2 text-3xl hover:shadow-xl"
              {...register("name", { required: "Name is required!" })}
            />
            <p className="text-red-600 text-sm">{errors.name?.message}</p>

            <select
              {...register("category", { required: "Category is required!" })}
              className="bg-[#5a9e3a] border border-black rounded-3xl text-black text-center px-6 py-2 hover:shadow-xl"
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category} className="bg-white">
                  {category}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.category?.message}</p>

            <select
              {...register("subcategory")}
              className="bg-[#5a9e3a] border border-black rounded-3xl text-black text-center px-6 py-2 hover:shadow-xl"
            >
              <option value="">Select a subcategory</option>
              {SUBCATEGORY_OPTIONS.map((subcategory) => (
                <option key={subcategory} value={subcategory} className="bg-white">
                  {subcategory}
                </option>
              ))}
            </select>

            <select
              {...register("condition", { required: "Condition is required!" })}
              className="bg-[#5a9e3a] border border-black rounded-3xl text-black text-center px-6 py-2 hover:shadow-xl"
            >
              <option value="">Select item condition</option>
              {CONDITION_OPTIONS.map((condition) => (
                <option key={condition} value={condition} className="bg-white">
                  {condition}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.condition?.message}</p>

            <textarea
              placeholder="Item description"
              className="bg-[#5a9e3a] border border-black rounded-3xl placeholder-black text-black text-center px-6 py-2 hover:shadow-xl"
              {...register("description")}
              rows={6}
              cols={20}
            />

            <input
              placeholder="Size"
              className="bg-[#5a9e3a] border border-black rounded-3xl placeholder-black text-black text-center px-6 py-2 hover:shadow-xl"
              {...register("size")}
            />

            <select
              {...register("color", { required: "Color is required!" })}
              className="bg-[#5a9e3a] border border-black rounded-3xl text-black text-center px-6 py-2 hover:shadow-xl"
            >
              <option value="">Select a color</option>
              {COLOR_OPTIONS.map((color) => (
                <option key={color} value={color} className="bg-white">
                  {color}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.color?.message}</p>

            <select
              {...register("status", { required: "Status is required!" })}
              className="bg-[#5a9e3a] border border-black rounded-3xl text-black text-center px-6 py-2 hover:shadow-xl"
            >
              <option value="">Select item status</option>
              {STATUS_OPTIONS.filter((status) => status!=="Reserved" && status !== "Allocated").map((status) => (
                <option key={status} value={status} className="bg-white">
                  {status}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.status?.message}</p>

            <input
              placeholder="Donor name"
              className="bg-[#5a9e3a] border border-black rounded-3xl placeholder-black text-black text-center px-6 py-2 hover:shadow-xl"
              {...register("donor")}
            />

             <input
              placeholder="Location"
              className="bg-[#5a9e3a] border border-black rounded-3xl placeholder-black text-black text-center px-6 py-2 hover:shadow-xl"
              {...register("location", { required: "Location is required!" })}
            />
            <p className="text-red-600 text-sm">{errors.location?.message}</p>

             <input
              type="number"
              placeholder="Barcode Number"
              className="bg-[#5a9e3a] border border-black rounded-3xl placeholder-black text-black text-center px-6 py-2 hover:shadow-xl"
              {...register("barcode_number", { required: "Barcode number is required!" })}
            />
            <p className="text-red-600 text-sm">{errors.barcode_number?.message}</p>

            <input
              type="submit"
              value="Submit"
              className="bg-[#5a9e3a] border border-black rounded-3xl px-6 py-2 text-2xl hover:hover:bg-[#4a8a2e] cursor-pointer"
            />

          </form>
        </div>
      </div>
    </div>
  </div>
  );
}
