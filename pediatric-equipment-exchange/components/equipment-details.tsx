"use client";

import { ItemFields } from "@/field_interfaces";
import Image from "next/image";
import { useState, useEffect } from 'react';
import SideBar from "@/components/sidebar";
import UpdateStatusPopup from "@/components/popups/update-status-popup";
import {useForm, SubmitHandler} from "react-hook-form";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, CONDITION_OPTIONS, COLOR_OPTIONS } from "@/item-field-options";
import Link from "next/link";
import Toast from "@/components/popups/toast";

export default function EquipmentDetails({ item }: { item: ItemFields })  {

  const [statusPageOpen, setStatusPageOpen] = useState(false); // for changing the status
  const [mostRecentStatus, setMostRecentStatus] = useState(item.status); // to immediately show the updated status if it gets changed
  const [imageIndex, setImageIndex] = useState(0); // for scrolling through images
  const [isEditing, setIsEditing] = useState(false); // for editing item details, will use a form from react-hook-form
  const [itemDetails, setItemDetails] = useState(item); // to immediately show the new item details if they get changed
  const { register, handleSubmit} = useForm({ defaultValues: item }) // form for editing details

  //for success/failure messages
  const [toastMessage, setToastMessage] = useState(""); 
  const [toastType, setToastType] = useState<"error" | "success">("error");

  const showToast = (message: string, type: "success" | "error") => { // this is to send down to the update-status-popup
    setToastMessage(message);  
    setToastType(type);        
  };

  // have to send distribution info to update-status-popup in case the item is being returned
  const [distribution, setDistribution] = useState<any>(null);

  // call the api when they edit anything
  const onSubmit: SubmitHandler<ItemFields> = async (data) => {
    try {
      const res = await fetch(`/api/equipment/${item.id}/update-other-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          equipment_id: item.id,
          newFieldsForm: data})
      });
      const result = await res.json();
      console.log(data);

      if (!res.ok) {
        console.error(result.error);
        showToast("Failed to save edits", "error");
      } else {
        setItemDetails(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Request failed:", err);
      showToast("Failed to save edits", "error");
    }
    showToast("Edits saved successfully!", "success");
  };
  
  // fetch the distribution info once item details page is opened
  useEffect(() => {
    if (!item?.id || distribution) return; 
    const fetchDistributionEntry = async () => {
      const res = await fetch(`/api/distributions/${item.id}`);
      const data = await res.json();
      setDistribution(data);
      console.log("Distribution data:", data);
    }
    fetchDistributionEntry(); 
  }, [item?.id, distribution]);

  // helpers to scroll through images; wrap around when end of array is reached
  const handlePrevImage = () => {
    if (imageIndex > 0) { setImageIndex(imageIndex - 1); }
    else { setImageIndex((item.image_urls.length)-1); }
  }
  const handleNextImage = () => {
    if (imageIndex < (item.image_urls.length - 1)) { 
      setImageIndex(imageIndex + 1); }
    else {setImageIndex(0); }
  }

  // give different statuses different colors
  const getStatusColor = () => {
    switch(mostRecentStatus) {
      case "Available": return "bg-green-400";
      case "Reserved":  return "bg-yellow-500";
      case "Allocated": return "bg-red-800";
      case "In Processing": return "bg-sky-400";
    }
  }

  return (
    <>
    {/* Show any toast popups */}
    {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
    
    <div className="flex min-h-screen w-full bg-[#51b6b6]">
        <SideBar />

        {/* Main Content */}
        <div className="flex-1 p-8 py-15 mb-10 w-full h-full">

          <h1 className="text-white text-2xl mb-8 text-center bg-rose-400 font-mono">Equipment Details</h1>
        
          {/* Outer grid with 2 columns  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
            {/* Left Column - Image array that can be clicked through*/}
            <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center min-h-[25rem]">
              <Image 
                src={itemDetails.image_urls?.[imageIndex] ? itemDetails.image_urls[imageIndex]: "/missing-image.png"}
                alt={itemDetails.name}
                width={250}
                height={150}
                className="rounded-lg w-full max-w-sm md:max-w-md object-contain"
                priority 
              />
              {/* Buttons to click through the images */}
              <div className="flex justify-between w-full mt-6">
                <button className="text-6xl text-rose-400 flex items-center justify-center hover:opacity-70 hover:cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                  onClick={handlePrevImage} disabled={itemDetails.image_urls? itemDetails.image_urls.length===1 : true}> ◀ </button>

                  {/* Track which image */}
                  <p className="text-black"> {imageIndex + 1} of {itemDetails.image_urls? itemDetails.image_urls.length : "1"} </p>

                <button className="text-6xl text-rose-400 flex items-center justify-center hover:opacity-70 hover:cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                  onClick={handleNextImage} disabled={itemDetails.image_urls? itemDetails.image_urls.length===1 : true}> ▶ </button>
              </div>
            </div> 

            {/* Right column, a flex column split into two boxes */}
            <div className="flex flex-col gap-4 min-h-[30rem]">

              {/* Top right box for Item Details */}
              <div className="bg-white rounded-lg p-4 flex flex-col flex-1 min-h-[30rem]">

              {/* Regular view */}
              {!isEditing &&
                <>
                <ul className="text-[#132540] text-lg space-y-3 font-mono flex-1">
                  <li className="text-3xl text-center mb-6"> <span><strong>Item Name:</strong> {itemDetails.name} </span> </li>
                  <li><strong>Category:</strong> {itemDetails.category}</li>
                  <li><strong>Subcategory:</strong> {itemDetails.subcategory? itemDetails.subcategory : "N/A"}</li>
                  <li><strong>Condition:</strong> {itemDetails.condition}</li>
                  <li><strong>Size:</strong> {itemDetails.size? itemDetails.size : "N/A"}</li>
                  <li><strong>Color:</strong> {itemDetails.color}</li>
                  <li><strong>Description:</strong> {itemDetails.description? itemDetails.description : "N/A"}</li>
                </ul>
                <button className="text-md mt-auto hover:cursor-pointer hover:opacity-70" onClick={()=>setIsEditing(true)}> ✎ Edit Details </button>
                </>
              }
              
              {/* Edit mode */}
              {isEditing && 
                <ul className="text-[#132540] text-lg space-y-3 font-mono h-full">
                
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-1">

                    <li className="flex items-center justify-center gap-3 mb-6 text-3xl text-black">
                      <strong>Item Name:</strong>
                      <input className="border rounded px-2 py-1 text-3xl leading-tight w-full"
                      {...register("name")} /> 
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Category: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight"
                        {...register("category")}
                      >
                        {CATEGORY_OPTIONS.map((category) => (
                          <option key={category} value={category} className="bg-white">{category}</option>
                        ))}
                      </select>
                    </li>
                          
                    <li className="flex items-center gap-3">
                      <strong> Subcategory: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight"
                        {...register("subcategory")}
                      >
                        <option key={null} className="bg-white"> </option> {/* // a blank option if they want to get rid of the subcategory */}
                        {SUBCATEGORY_OPTIONS.map((subcategory) => (
                          <option key={subcategory} value={subcategory} className="bg-white">{subcategory}</option>
                        ))}
                      </select>
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Condition: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight"
                        {...register("condition")}
                      >
                        {CONDITION_OPTIONS.map((condition) => (
                          <option key={condition} value={condition} className="bg-white">{condition}</option>
                        ))}
                      </select>
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Size: </strong>
                      <input className="border rounded px-2 py-1 text-center text-lg leading-tight"
                      {...register("size")} /> 
                    </li>
                    
                    <li className="flex items-center gap-3">
                      <strong> Color: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight"
                        {...register("color")}
                      >
                        {COLOR_OPTIONS.map((color) => (
                          <option key={color} value={color} className="bg-white">{color}</option>
                        ))}
                      </select>
                    </li>
                                
                    <li className="flex items-center gap-3">
                      <strong> Description: </strong>
                      <textarea className="border rounded px-2 py-1 text-center focus:ring text-lg leading-tight"
                        rows={5}
                        cols={50}
                        {...register("description")} /> 
                    </li>
                    <div className="mt-auto flex justify-between min-h-[3rem]">
                      <button className="font-sans text-[#686dd3] font-arial text-sm mt-auto hover:cursor-pointer hover:opacity-70"
                        onClick={()=>setIsEditing(false)}> Cancel Edit </button>
                      <button type="submit" className="text-[#686dd3] font-sans text-sm mt-auto hover:cursor-pointer hover:opacity-70"> 
                          Save Details </button>
                    </div>
                  </form>
                </ul>
              }
              </div>

              {/* Bottom right box for Status details & Change Status button */}
              <div className="bg-white rounded-lg p-4 flex flex-col gap-3 items-center">
                <h1 className="text-3xl text-center text-black font-bold font-mono"> Current Status: </h1> 
                <span className={`${getStatusColor()} text-center text-white text-xl font-bold font-mono border rounded-xl p-3 w-full`}> {mostRecentStatus} </span>
                
                {/* Update status button + view recipient/waiver button if available*/}

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <button className="bg-rose-400 hover:bg-rose-300 hover:cursor-pointer border rounded-3xl text-white text-xl p-3 font-mono"  
                    onClick={ () => setStatusPageOpen(true) }> Update </button> 
                </div>
                
                {/* //TO-DO: Open the recipient info on click, right now opens the status popup  */}
                 {(mostRecentStatus === "Reserved" || mostRecentStatus === "Allocated") && ( <>
                    <button className="bg-rose-400 hover:bg-rose-300 hover:cursor-pointer border rounded-3xl text-white text-xl p-3 font-mono"  
                      onClick={ () => setStatusPageOpen(true) }> View Recipient Info </button> 
                      <span className="text-red-400 italic"> You have a waiver available <Link href= {`/items/${item.id}/waiver`} className="underline text-blue-400"> here. </Link> </span> </>
                  )}
              
             </div>
            </div>
          </div>
        </div>
      
      {/* Popup when Update Status button is clicked */}
      <UpdateStatusPopup
            equipment_id = {item.id}
            // UPDATE LATER: to be the staff member's id from authenticated session ; this is just Dawn's id in the profile table
            staff_member = {"1d9992f0-753a-43db-943d-7ed30741aff9"} 
            //
            distribution_id = {distribution?.id}
            current_status = {mostRecentStatus}
            onStatusChange = {(updated_status) => setMostRecentStatus(updated_status)} // to re-render the "current status" box to the new status
            isOpen = { statusPageOpen }
            onClose = { () => setStatusPageOpen(false)}
            showToast={showToast}
          />  
    </div>
    </>
  );
}