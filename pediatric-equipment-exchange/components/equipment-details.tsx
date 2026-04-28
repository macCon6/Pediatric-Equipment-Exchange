"use client";

import { ItemFields } from "@/field_interfaces";
import { DistributionWithRecipient } from "@/field_interfaces";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, CONDITION_OPTIONS, COLOR_OPTIONS } from "@/item-field-options";
import Image from "next/image";
import { useState } from 'react';
import {useForm, SubmitHandler} from "react-hook-form";
import UpdateStatusPopup from "@/components/popups/update-status-popup";
import DistributionDetailsPopup from "./popups/distribution-details-popup";
import Toast from "@/components/popups/toast";
import { getStatusColor } from "@/utils/status-colors";

interface Props  {
  item: ItemFields,
  distribution: DistributionWithRecipient
  role: string
}

export default function EquipmentDetails({ item, distribution, role }: Props)  {

  // for status changes / distribution info changes
  const [mostRecentStatus, setMostRecentStatus] = useState(item.status); // to immediately show the updated status if it gets changed
  const [statusPageOpen, setStatusPageOpen] = useState(false); // for changing the status

  // for distribution changes to render details for the popup
  const [currentDistribution, setCurrentDistribution] = useState(distribution);
  const [detailsPopupOpen, setDetailsPopupOpen] = useState(false); // show distribution details

  // for editing item details
  const [isEditing, setIsEditing] = useState(false); // for editing item details, will use a form from react-hook-form
  const [itemDetails, setItemDetails] = useState(item); // to immediately show the new item details if they get changed
  const { register, handleSubmit} = useForm({ defaultValues: item }) // form for editing details
  
  // misc.
  const [imageIndex, setImageIndex] = useState(0); // for scrolling through images

  //for success/failure messages
  const [toastMessage, setToastMessage] = useState(""); 
  const [toastType, setToastType] = useState<"error" | "success">("error");

  const showToast = (message: string, type: "success" | "error") => { // this is to send down to the update-status-popup
    setToastMessage(message);  
    setToastType(type);        
  };

  // instead of using useEffect to update the distribution, refresh it when the updateStatus popup changes it
  const refreshDistribution = async () => {
    const res = await fetch(`/api/distributions/${item.id}`);
    const data = await res.json();
    console.log("Refetched distribution: ", data);
    setCurrentDistribution(data);
  }

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
        setItemDetails((currentItem) => ({
          ...currentItem,
          ...data,
          barcode_value:
            typeof data.barcode_value === "string" && data.barcode_value.trim() !== ""
              ? data.barcode_value.trim()
              : null,
        }));
        setIsEditing(false);
        showToast("Edits saved successfully!", "success");
      }
    } catch (err) {
      console.error("Request failed:", err);
      showToast("Failed to save edits", "error");
    }
  };
  
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

  return (
    <>
    {/* Show any toast popups */}
    {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

    <div className="flex min-h-screen w-full bg-[#FFC94A]">

        {/* Main Content */}
        <div className="flex-1 p-8 w-full lg:mt-6">
        
          {/* Outer grid with 2 columns  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
            {/* Left Column - Image array that can be clicked through*/}
            <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center min-h-[25rem]">
              <Image 
                src={itemDetails.image_urls?.[imageIndex] ? itemDetails.image_urls[imageIndex]: "/missing-image.png"}
                alt={itemDetails.name}
                width={250}
                height={150}
                className="rounded-lg w-full max-w-sm md:max-w-md object-contain aspect-3/4"
                priority 
              />
              {/* Buttons to click through the images */}
              <div className="flex justify-between w-full md:mt-6 ">
                <button className="text-6xl text-green-600 flex items-center justify-center hover:text-orange-200 hover:cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                  onClick={handlePrevImage} disabled={itemDetails.image_urls? itemDetails.image_urls.length===1 : true}> ← </button>

                  {/* Track which image */}
                  <p className="text-black mt-5"> {imageIndex + 1} of {itemDetails.image_urls? itemDetails.image_urls.length : "1"} </p>

                <button className="text-6xl text-green-600 flex items-center justify-center hover:text-orange-200 hover:cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                  onClick={handleNextImage} disabled={itemDetails.image_urls? itemDetails.image_urls.length===1 : true}> → </button>
              </div>
            </div> 

            {/* Right column, a flex column split into two boxes */}
            <div className="flex flex-col gap-4 min-h-[30rem]">

              {/* Top right box for Item Details */}
              <div className="bg-white rounded-lg p-4 flex flex-col flex-1 min-h-[30rem]">

              {/* Regular view */}
              {!isEditing &&
                <>
                <ul className="text-[#132540] text-lg space-y-3 flex-1">
                  <li className="text-3xl text-center mb-6"> <span><strong>Item Name:</strong> {itemDetails.name} </span> </li>
                  <li><strong>Category:</strong> {itemDetails.category}</li>
                  <li><strong>Subcategory:</strong> {itemDetails.subcategory? itemDetails.subcategory : "N/A"}</li>
                  <li><strong>Condition:</strong> {itemDetails.condition}</li>
                  <li><strong>Size:</strong> {itemDetails.size? itemDetails.size : "N/A"}</li>
                  <li><strong>Color:</strong> {itemDetails.color}</li>
                  <li><strong>Description:</strong> {itemDetails.description? itemDetails.description : "N/A"}</li>
                  <li><strong>Location:</strong> {itemDetails.location}</li>
                  <li className="mb-4"><strong>Barcode:</strong> {itemDetails.barcode_value ? itemDetails.barcode_value : "Not attached"}</li>
                </ul>

                {role !== "guest" &&
                <button className="text-md text-indigo-700 mt-auto hover:cursor-pointer hover:opacity-70" onClick={()=>setIsEditing(true)}> ✎ Edit Details </button>
                }
                </>
              }
              
              {/* Edit mode */}
              {isEditing && 
                <ul className="text-[#132540] text-lg space-y-3">
                
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">

                    <li className="flex items-center justify-center gap-3 mb-6 text-2xl text-black">
                      <strong>Item Name:</strong>
                      <input className="border rounded px-2 py-1 text-3xl leading-tight w-full"
                      {...register("name")} /> 
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Category: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
                        {...register("category")}
                      >
                        {CATEGORY_OPTIONS.map((category) => (
                          <option key={category} value={category} className="bg-white">{category}</option>
                        ))}
                      </select>
                    </li>
                          
                    <li className="flex items-center gap-3">
                      <strong> Subcategory: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
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
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
                        {...register("condition")}
                      >
                        {CONDITION_OPTIONS.map((condition) => (
                          <option key={condition} value={condition} className="bg-white">{condition}</option>
                        ))}
                      </select>
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Size: </strong>
                      <input className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
                      {...register("size")} /> 
                    </li>
                    
                    <li className="flex items-center gap-3">
                      <strong> Color: </strong>
                      <select className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
                        {...register("color")}
                      >
                        {COLOR_OPTIONS.map((color) => (
                          <option key={color} value={color} className="bg-white">{color}</option>
                        ))}
                      </select>
                    </li>
                                
                    <li className="flex items-center gap-3">
                      <strong> Description: </strong>
                      <textarea className="border rounded px-2 py-1 text-center focus:ring text-lg leading-tight w-full"
                        rows={4}
                        cols={40}
                        {...register("description")} /> 
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Location: </strong>
                      <input className="border rounded px-2 py-1 text-center focus:ring text-lg leading-tight w-full"
                        {...register("location")} /> 
                    </li>

                    <li className="flex items-center gap-3">
                      <strong> Barcode: </strong>
                      <input className="border rounded px-2 py-1 text-center text-lg leading-tight w-full"
                        placeholder="Scan or type barcode"
                        {...register("barcode_value")}
                      />
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
              <div className="w-full bg-white rounded-lg p-4 flex flex-col gap-2 items-center">
                <h1 className="text-3xl text-center text-black font-bold font-mono"> Status: </h1> 
                <span className={`${getStatusColor(mostRecentStatus)} text-center text-white text-xl font-bold border rounded-xl p-3 w-full`}> {mostRecentStatus} </span>
                
                
                {/* View deatils button if allocated or reservd; waiver link has been moved to that popup*/}
              {role !== "guest" &&
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <button className="bg-[#5a9e3a] hover:bg-[#4a8a2e] hover:cursor-pointer border rounded-3xl text-white text-xl p-3"  
                    onClick={ () => setStatusPageOpen(true) }> Update </button>
                             
                 {(mostRecentStatus.startsWith("Reserved") || mostRecentStatus === "Allocated") && ( <>
                 
                    <button className="bg-[#5a9e3a] hover:bg-[#4a8a2e] hover:cursor-pointer border rounded-3xl text-white text-lg md:text-xl p-3"  
                       onClick = {() => setDetailsPopupOpen(true)}> {mostRecentStatus.startsWith("Reserved")? "Reservation": "Allocation"} Details </button>
                        
                    </>
                  )}
                
                </div>
              }
    
                
                  
            </div>
            
            </div>
      
          </div>
        </div>
      
      {/* Popup when Update Status button is clicked */}
      <UpdateStatusPopup
            equipment_id = {item.id}
            distribution_id = {currentDistribution?.id}
            current_status = {mostRecentStatus}
             // to re-render the "current status" box to the new status
            onStatusChange = {(updated_status) => {
              setMostRecentStatus(updated_status);
              refreshDistribution(); } // also refetch distribution
            }
            isOpen = { statusPageOpen }
            onClose = { () => setStatusPageOpen(false)}
            showToast={showToast}
        />  

        {/* Popup when allocation/reservation details button is clicked */}
       <DistributionDetailsPopup
            current_status = {mostRecentStatus}
            equipment_id = {item.id}
            distribution = {currentDistribution}
            isOpen = { detailsPopupOpen }
            onClose = { () => setDetailsPopupOpen(false)}
        />    
    </div>
    </>
  );
}