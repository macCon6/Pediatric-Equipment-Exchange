"use client";

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
  
  const { register, handleSubmit, reset, formState: {errors}} = useForm<ItemFields>();

  const [images, setImages] = useState<{file: File; preview: string}[]>([]);
  const [uploading, setUploading] = useState(false);

  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [barcodeExists, setBarcodeExists] = useState(false);
  const [barcodeCheckLoading, setBarcodeCheckLoading] = useState(false);
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
//confetti
  const fireConfetti = () => {
  const colors = [
    "#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0000ff", 
    "#ff00ff", "#00ffff", "#ff6699", "#99ff66", "#6699ff"
  ];

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  const timeDelta = 0.05;
  const xAmplitude = 0.5;
  const yAmplitude = 1;
  const xVelocity = 2;
  const yVelocity = 3;

  let time = 0;
  let animationId: number;

  const pieces: { x: number; y: number; xSpeed: number; ySpeed: number; radius: number; tilt: number; color: string; phaseOffset: number; }[] = [];
  for (let i = 0; i < 150; i++) {
    const radius = Math.floor(Math.random() * 50) - 10;
    const tilt = Math.floor(Math.random() * 10) - 10;
    const xSpeed = Math.random() * xVelocity - xVelocity / 2;
    const ySpeed = Math.random() * yVelocity;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height - canvas.height;

    pieces.push({
      x, y, xSpeed, ySpeed, radius, tilt,
      color: colors[Math.floor(Math.random() * colors.length)],
      phaseOffset: i,
    });
  }

  // Stop after 4 seconds
  const stopTime = Date.now() + 4000;

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((piece) => {
      piece.y += (Math.cos(piece.phaseOffset + time) + 1) * yAmplitude + piece.ySpeed;
      piece.x += Math.sin(piece.phaseOffset + time) * xAmplitude + piece.xSpeed;

      if (piece.x < 0) piece.x = canvas.width;
      if (piece.x > canvas.width) piece.x = 0;
      if (piece.y > canvas.height) piece.y = 0;

      ctx.beginPath();
      ctx.lineWidth = piece.radius / 2;
      ctx.strokeStyle = piece.color;
      ctx.moveTo(piece.x + piece.tilt + piece.radius / 4, piece.y);
      ctx.lineTo(piece.x + piece.tilt, piece.y + piece.tilt + piece.radius / 4);
      ctx.stroke();
    });

    time += timeDelta;

    if (Date.now() < stopTime) {
      animationId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationId);
      document.body.removeChild(canvas); // clean up canvas after animation
    }
  }

  update();
};

  const checkBarcodeExists = async (barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed) { setBarcodeExists(false); return; }
    setBarcodeCheckLoading(true);
    try {
      const { count, error } = await supabase
        .from("equipment")
        .select("id", { count: "exact", head: true })
        .eq("barcode_value", trimmed);
      if (error) { setBarcodeExists(false); }
      else { setBarcodeExists((count ?? 0) > 0); }
    } catch { setBarcodeExists(false); }
    finally { setBarcodeCheckLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { checkBarcodeExists(barcodeValue); }, 500);
    return () => clearTimeout(timer);
  }, [barcodeValue]);

  const barcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
  useEffect(() => {
    if (!barcodeScannerOpen) return;
    const scanner = new Html5QrcodeScanner(
      "attach-barcode-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
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
    scanner.render(
      async (decodedText) => {
        const normalizedCode = decodedText.trim();
        if (!normalizedCode) return;
        setBarcodeValue(normalizedCode);
        setBarcodeScannerOpen(false);
        try { await scanner.clear(); } catch {}
      },
      () => {}
    );
    return () => {
      if (barcodeScannerRef.current) {
        void barcodeScannerRef.current.clear().catch(() => {});
      }
    };
  }, [barcodeScannerOpen]);

  const compressImage = async (img: File) => {
    return await imageCompression(img, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.7,
    });
  };

  const handleClientUpload = (e: any) => {
    const selectedFiles = [...e.target.files];
    if (selectedFiles.length === 0) return;
    if (images.length + selectedFiles.length > 3) {
      setToastType("error");
      setToastMessage("Please upload a maximum of 3 images");
      return;
    }
    const newImages = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDelete = (index: number) => {
    const img = images[index];
    if (img) { URL.revokeObjectURL(img.preview); }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const onSubmit: SubmitHandler<ItemFields> = async (data) => {
    const uploadedUrls: string[] = [];
    try {
      setUploading(true);
      for (const img of images) {
        const compressed = await compressImage(img.file);
        const fileName = `${Date.now()}-${img.file.name}`;
        const { error } = await supabase.storage
          .from("equipment-images")
          .upload(fileName, compressed, { cacheControl: "2592000" });
        if (error) throw error;
        const { data: supabaseURL } = supabase.storage
          .from("equipment-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(supabaseURL.publicUrl);
      }
    } catch (error: any) {
      setToastType("error");
      setToastMessage(error.message || "Image upload failed");
      return;
    }

    try {
      const res = await fetch("/api/intake/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
          barcode_value: barcodeValue.trim() === "" ? null : barcodeValue.trim(),
        })
      });
      const result = await res.json();
      if (!res.ok) { throw new Error(result.error || "Upload failed"); }
      setToastType("success");
      setToastMessage(result.message);
      fireConfetti();
      reset();
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

  // Reusable label + field wrapper styles
  const fieldClass = "flex flex-col gap-1";
  const labelClass = "text-sm font-semibold text-[#132540]";
  const inputClass = "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-[#132540] focus:outline-none focus:border-[#5a9e3a] transition-colors";
  const selectClass = "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-[#132540] focus:outline-none focus:border-[#5a9e3a] transition-colors cursor-pointer";

  return (
    <div className="flex min-h-screen w-full bg-[#FFC94A]" style={{ fontFamily: "Poppins, sans-serif" }}>
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
      
      <div className="flex flex-col md:flex-row md:items-start w-full gap-6 p-4 md:p-10">

        {/* Left column */}
        <div className="w-full md:flex-1 flex flex-col gap-6">

          {/* Page title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#132540]">Add New Equipment</h1>
            <p className="text-sm text-[#132540] mt-1 opacity-70">Fill out the form to add an item to the lending library</p>
          </div>

          {/* Upload images */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-[#132540] mb-1">📷 Upload Images</h2>
            <p className="text-sm text-gray-500 mb-4">Upload up to 3 photos of the equipment</p>

            <input
              type="file"
              accept="image/*"
              onChange={handleClientUpload}
              id="fileUpload"
              className="hidden"
              multiple
            />

            <label
              htmlFor="fileUpload"
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#5a9e3a] rounded-xl py-4 cursor-pointer hover:bg-green-50 transition-colors text-[#5a9e3a] font-semibold"
            >
              + Choose Images
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={img.preview} className="w-full object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barcode section */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-[#132540] mb-1"> Attach Barcode</h2>
            <p className="text-sm text-gray-500 mb-4">Scan a barcode label or type it manually</p>

            <input
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
              placeholder="Type barcode value..."
              className={inputClass}
            />

            {barcodeCheckLoading && (
              <p className="text-sm text-gray-500 mt-1">Checking barcode...</p>
            )}
            {barcodeExists && (
              <p className="text-sm text-red-600 font-semibold mt-1">
                ⚠️ This barcode already exists in the system!
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-[#5a9e3a] text-white px-4 py-2.5 font-semibold hover:bg-[#4a8a2e] transition-colors cursor-pointer"
                onClick={() => setBarcodeScannerOpen((current) => !current)}
              >
                {barcodeScannerOpen ? "Close Scanner" : "Scan Barcode"}
              </button>
              <button
                type="button"
                className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-[#132540] hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setBarcodeValue("")}
              >
                Clear
              </button>
            </div>

            {barcodeScannerOpen && (
              <div className="mt-4 rounded-xl border border-gray-200 p-2">
                <div id="attach-barcode-reader" className="w-full" />
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500">
              Attached value: <span className="font-semibold text-[#132540]">{barcodeValue.trim() === "" ? "None" : barcodeValue.trim()}</span>
            </p>
          </div>
        </div>

        {/* Right column - intake form */}
        <div className="flex flex-col md:w-1/2 max-w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">

          <h2 className="text-xl font-bold text-[#132540] mb-6 text-center">Complete the Intake Form</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Item Name */}
            <div className={fieldClass}>
              <label className={labelClass}>Item Name <span className="text-red-500">*</span></label>
              <input
                placeholder="e.g. Pink Forearm Crutch"
                className={inputClass}
                {...register("name", { required: "Name is required!" })}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div className={fieldClass}>
              <label className={labelClass}>Category <span className="text-red-500">*</span></label>
              <select
                {...register("category", { required: "Category is required!" })}
                className={selectClass}
              >
                <option value="">Select a category</option>
                {[...CATEGORY_OPTIONS].filter(cat => cat !== "Other").sort().map((category) => (
                  <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Other">Other</option>

              </select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
            </div>

            {/* Subcategory */}
            <div className={fieldClass}>
              <label className={labelClass}>Subcategory</label>
              <select {...register("subcategory")} className={selectClass}>
                <option value="">Select a subcategory (optional)</option>
                {[...SUBCATEGORY_OPTIONS].sort().map((subcategory) => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className={fieldClass}>
              <label className={labelClass}>Condition <span className="text-red-500">*</span></label>
              <select
                {...register("condition", { required: "Condition is required!" })}
                className={selectClass}
              >
                <option value="">Select item condition</option>
                {CONDITION_OPTIONS.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
              {errors.condition && <p className="text-red-500 text-xs">{errors.condition.message}</p>}
            </div>

            {/* Description */}
            <div className={fieldClass}>
              <label className={labelClass}>Description </label>
              <textarea
                placeholder="Describe the equipment, any notable features or issues..."
                className={`${inputClass} resize-none`}
                {...register("description")}
                rows={4}
              />
            </div>

            {/* Size */}
            <div className={fieldClass}>
              <label className={labelClass}>Size <span className="text-red-500">*</span></label>
              <input
                placeholder="e.g. Small, Medium, Large, or measurements"
                className={inputClass}
                {...register("size",{ required: "Size is required!"})}
              />
              {errors.size && <p className="text-red-500 text-xs">{errors.size.message}</p>}
            </div>

            {/* Color */}
            <div className={fieldClass}>
              <label className={labelClass}>Color <span className="text-red-500">*</span></label>
              <select
                {...register("color", { required: "Color is required!" })}
                className={selectClass}
              >
                <option value="">Select a color</option>
                {[...COLOR_OPTIONS].sort().map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
            </div>

            {/* Status */}
            <div className={fieldClass}>
              <label className={labelClass}>Status <span className="text-red-500">*</span></label>
              <select
                {...register("status", { required: "Status is required!" })}
                className={selectClass}
              >
                <option value="">Select item status</option>
                {STATUS_OPTIONS.filter((status) => !status.startsWith("Reserved") && status !== "Allocated").map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
            </div>

            {/* Donor */}
            <div className={fieldClass}>
              <label className={labelClass}>Donor Name</label>
              <input
                placeholder="Enter donor name (optional)"
                className={inputClass}
                {...register("donor")}
              />
            </div>

            {/* Location */}
            <div className={fieldClass}>
              <label className={labelClass}>Location <span className="text-red-500">*</span></label>
              <input
                placeholder="Where is this item stored?"
                className={inputClass}
                {...register("location", { required: "Location is required!" })}
              />
              {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={uploading || barcodeExists}
              className={`mt-2 w-full rounded-xl py-3 text-lg font-bold transition-colors
                ${uploading || barcodeExists
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-90"
                }`}
              style={{
                background: "radial-gradient(ellipse at bottom right, #22c55e, #4ade80, #fde047)"
              }}  
            >
              {uploading ? "Uploading Item..." : "Submit Item"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}