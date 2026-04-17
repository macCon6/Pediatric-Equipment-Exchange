"use client";

import SideBar from "@/components/sidebar";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ItemFields } from "@/field_interfaces";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  COLOR_OPTIONS,
} from "@/item-field-options";
import {
  Html5QrcodeScanType,
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import imageCompression from "browser-image-compression";
import Toast from "@/components/popups/toast";

import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export default function ItemIntake() {
  
  const { register, handleSubmit, reset, formState: {errors}} = useForm<ItemFields>(); // intake form

  const [images, setImages] = useState<{file: File; preview: string}[]>([]); // save local URL preview to show before supabase upload
  const [uploading, setUploading] = useState(false);

  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false); 
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
 

  /* Barcode Scanner Section */

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


  /* Image Upload Section */

  const compressImage = async (img: File) => {
    return await imageCompression(img, {
      maxSizeMB: 0.25,   // try to compress images to 250 KB to save on egress
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.7,
    });
  };

  // upload on client only and show preview with local URL
  const handleClientUpload = (e: any) => {
    const selectedFiles = [...e.target.files];
    if (selectedFiles.length === 0) return;

    if(images.length + selectedFiles.length > 3) { // limit to 3 images per equipment
      setToastType("error");
      setToastMessage("Please upload a maximum of 3 images");
      return;
    }

    const newImages = selectedFiles.map((file) => ({ 
      file,
      preview: URL.createObjectURL(file) // get the local URL for each
    }));

    setImages((prev) => [...prev, ...newImages]); // update UI with new images
  };

  // if the user uploaded the wrong photo, let them delete
  const handleDelete = (index: number) => {
    const img = images[index];
    if (img) { URL.revokeObjectURL(img.preview); } //release URL to avoid memory leak
    setImages((prev) => prev.filter((_, i) => i !== index)); // update UI
  }   

  // avoid memory leaks by revoking URLs
  const clearImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  }

  // Submit → API
  const onSubmit: SubmitHandler<ItemFields> = async (data) => {
    const uploadedUrls: string[] = [];
    try { // to compress the images and submit to supabase bucket to get supabase URLs 
      setUploading(true);
      for(const img of images) {
        const compressed = await compressImage(img.file);
        const fileName = `${Date.now()}-${img.file.name}`;

        const { error } = await supabase.storage // upload to bucket
          .from("equipment-images")
          .upload(fileName, compressed, {
            cacheControl: "2592000" // cache for a month
          });

        if (error) throw error;

        const { data: supabaseURL } = supabase.storage // get supabase url
          .from("equipment-images")
          .getPublicUrl(fileName);
          
        uploadedUrls.push(supabaseURL.publicUrl);
        
      } // end of loop

    } catch (error: any) {
      setToastType("error");
      setToastMessage(error.message || "Image upload failed");
      return;
    } // end of upload image try block

    try { // to submit the form and all attached data
      const res = await fetch("/api/intake/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image_urls: uploadedUrls.length > 0? uploadedUrls : null,
          barcode_value: barcodeValue.trim() === "" ? null : barcodeValue.trim(),
        })
      });
      
      const result = await res.json();

      if (!res.ok) { // failure
        throw new Error (result.error || "Upload failed");
      }

      // success
      setToastType("success");
      setToastMessage(result.message);
      reset(); // reset form
      clearImages();
      setBarcodeValue("");
      setBarcodeScannerOpen(false);

    } catch (error: any) {
      setToastType("error");
      setToastMessage(error.message || "Unknown error");
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FFC94A]">
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
      <SideBar />
      
      {/* Main content, back rectangle*/}
      <div className="flex flex-col md:flex-row w-full gap-6 p-4 md:p-10">

        {/* Left column*/}
        <div className ="w-full md:flex-1 flex flex-col gap-6">

          {/*  Choose images */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <p className="text-2xl font-mono font-semibold tracking-tight underline mb-4 text-center"> Upload up to 3 images </p>

            {/* hidden input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleClientUpload}
              id="fileUpload"
              className="hidden"
              multiple
            />

            {/* styled button */}
            <div className="flex justify-center">
              <label
                htmlFor="fileUpload"
                 className="border border-black rounded-3xl px-6 py-2 cursor-pointer hover:bg-[#4a8a2e]"
              >
                Choose Images
              </label>
            </div>

            {/* Image previews */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.preview}
                    className="w-full object-contain rounded-lg"
                  /> 
                  <button // for deleting photo
                    type="button"
                    onClick={()=> handleDelete(index)}
                    className="absolute top-1 right-1 bg-white px-2 rounded"
                    > X </button>
                </div>
              ))}
            </div>
          </div>
            
          {/* Barcode attachment section */}
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-3">
            <p className="text-2xl font-semibold text-center font-mono underline tracking-tight">Attach Barcode</p>
            <p className="mt-3 text-center text-md text-gray-700">
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

        {/* Right column - intake form */}
        <div className="flex-1 flex-col md:w-[400px] max-w-full shadow-lg border border-green-600 bg-white rounded-2xl overflow-y-auto flex min-h-0">

          <p className="m-3 text-2xl font-semibold text-center font-mono underline tracking-tight"> Complete the Intake Form </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 w-full p-4 "
          >

            <input
              placeholder="*Item Name*"
              className="bg-[#5a9e3a] border border-gray-200 shadow-lg rounded-3xl placeholder-black italic text-black text-center p-3 text-3xl"
              {...register("name", { required: "Name is required!" })}
            />
            <p className="text-red-600 text-sm">{errors.name?.message}</p>

            <select
              {...register("category", { required: "Category is required!" })}
              className="bg-[#5a9e3a] border border-gray-200 shadow-lg rounded-3xl text-black text-center p-3"
            >
              <option value=""> Select a category </option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category} className="bg-white">
                  {category}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.category?.message}</p>

            <select
              {...register("subcategory")}
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl text-black text-center p-3"
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
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl text-black text-center p-3"
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
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl placeholder-black text-black text-center p-3"
              {...register("description")}
              rows={6}
              cols={20}
            />

            <input
              placeholder="Size"
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl placeholder-black text-black text-center p-3"
              {...register("size")}
            />

            <select
              {...register("color", { required: "Color is required!" })}
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl text-black text-center p-3"
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
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl text-black text-center p-3"
            >
              <option value="">Select item status</option>
              {STATUS_OPTIONS.filter((status) => !status.startsWith("Reserved") && status !== "Allocated").map((status) => (
                <option key={status} value={status} className="bg-white">
                  {status}
                </option>
              ))}
            </select>
            <p className="text-red-600 text-sm">{errors.status?.message}</p>

            <input
              placeholder="Donor name"
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl placeholder-black text-black text-center p-3"
              {...register("donor")}
            />

             <input
              placeholder="Location"
              className="bg-[#5a9e3a] border border-gray-200 rounded-3xl placeholder-black text-black text-center p-3"
              {...register("location", { required: "Location is required!" })}
            />
            <p className="text-red-600 text-sm">{errors.location?.message}</p>

            <button
              type="submit"
              disabled={uploading}
              className={`bg-[radial-gradient(ellipse_at_bottom_right,_#fbbf24,_#fde047,_#22c55e)] font-mono font-semibold md:mt-3 m-3 border border-black rounded-3xl px-6 py-2 text-2xl
              ${uploading ? "opacity-50 cursor-not-allowed": "hover:bg-gradient-to-r from-yellow-200 via-green-200 to-green-300 cursor-pointer"}`}
            >
              {uploading ? "Uploading Item..." : "Submit"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
