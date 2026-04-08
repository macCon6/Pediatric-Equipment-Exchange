// this is a popup for when the user clicks the "Update Status" button on the equipment details page

"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Popup from "@/components/popups/popup"; 
import Toast from "@/components/popups/toast";
import { STATUS_OPTIONS } from "@/item-field-options";

interface reservationForm {
    name: string;
    contact_name: string;
    organization: string;
    email: string;
    phone: string;
    notes?: string
}

interface UpdateStatusProps {
    equipment_id: string;
    staff_member: string,
    distribution_id: string,
    current_status: string,
    onStatusChange: (updatedStatus: string) => void, // need this to trigger a re-render of the "current status" box
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
    showToast: (message: string, type: "success" | "error") => void
}

export default function UpdateStatusPopup({equipment_id, staff_member, distribution_id, current_status, isOpen, onClose, onStatusChange, showToast}: UpdateStatusProps) {

    // the reservation form using react-hook-form
    const {register, handleSubmit, reset, formState: {errors}} = useForm<reservationForm>();
    
    // a form to input borrower & PT information will open when reserving an item
    const [reservationFormOpen, setReservationFormOpen] = useState(false);

    // closing the reservation form
    const handleClose = () => {
        reset(); //clear form
        setReservationFormOpen(false);
        onClose();  // close popup
    };
 
    // for when clicking on a chosen status, opens ReservationForm when clicking Reserve
    const handleTargetStatusChange = async (target_status: string) => {
        if (target_status === "Reserved" && current_status === "Available") {
            setReservationFormOpen(true); 
        } else {
            await updateEquipmentStatus(equipment_id, target_status, current_status, distribution_id, staff_member);
            onClose();
        }
    };

    const updateEquipmentStatus = async (
        equipment_id: string,
        target_status: string,
        current_status: string,
        distribution_id: string,
        staff_member: string,
        reservationFormData?: reservationForm) => {

        const confirmed = window.confirm(`Are you sure you want to change status to "${target_status}"?`);
        if (!confirmed) return;
        
        // call API to update the status
        const res = await fetch(`/api/equipment/${equipment_id}/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                equipment_id: equipment_id,
                target_status: target_status, 
                current_status: current_status,
                distribution_id: distribution_id, 
                staff_member: staff_member,
                reservationFormData: reservationFormData
            }),
        });

        const statusResponse = await res.json();
        console.log(statusResponse);

        if (!statusResponse.success) {
            showToast(statusResponse.error, "error");
            return;
        }
        showToast("Status updated!", "success");
        onStatusChange(target_status); // re-render the current status
    }   

    // for submitting the reservation form (target status is "Reserved" since the form only shows in that case)
    const onSubmit: SubmitHandler<reservationForm> = async (data: reservationForm) => {
        await updateEquipmentStatus(equipment_id, "Reserved", current_status, distribution_id, staff_member, data);
        setReservationFormOpen(false);
        onClose(); // close the popup
    } 

     // give different statuses different colors
    const getStatusColor = () => {
        switch(current_status) {
            case "Available": return "bg-green-400";
            case "Reserved":  return "bg-yellow-500";
            case "Allocated": return "bg-red-800";
            case "In Processing": return "bg-sky-400";
    }
  }

    return (
        <>
        <Popup isOpen={isOpen} onClose ={handleClose}> 

            {/* status buttons  */}
            <h1 className="text-3xl text-center font-bold mb-4"> Update Status </h1>
            <p className= "py-3 text-xl"> Current status: </p>

            {/* show current status above the "choose status" area */}
            <div className={`flex flex-1 justify-center p-3 rounded-lg ${getStatusColor()} mb-10`}>
                <span className="text-white font-bold text-center">
                            {current_status} {/* span text  */}
                </span>
            </div>

            <p className= "text-xl mb-4"> Select which status to update to: </p>
        
            <div className="flex flex-col gap-10"> 
                {/* Got rid of the Allocated button because staff should do that through the waiver page after signature */}
                {STATUS_OPTIONS.filter(status_option => status_option !== current_status && status_option !== "Allocated").map(status_option => (
                    // create the status buttons
                        <button key={status_option}
                        onClick={() => handleTargetStatusChange(status_option)}
                        className={"p-3 text-white rounded-lg bg-teal-700 hover:cursor-pointer hover:bg-teal-900 hover:scale-105"}
                        >
                            {status_option} {/* button text */}
                        </button>
                    )
                )
                }
            </div>

            {reservationFormOpen && 
            <>
                <p className="mt-15 text-xl"> Complete the form to reserve this item </p>
                <div className="py-8 max-w-full bg-white rounded-2xl overflow-y-auto flex min-h-0 gap-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    <input 
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "Recipient Family Name" 
                        {...register("name", { required: "Name is required!"})} />
                        <p className="text-red-600 text-sm"> {errors.name?.message} </p>
                    <input 
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "Recipient Contact Name"
                        {...register("contact_name", {required: "Contact is required!"}) }/>
                        <p className="text-red-600 text-sm"> {errors.contact_name?.message} </p>
                    <input
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "Recipient Organization"
                        {...register("organization") } />
                    <input 
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "Recipient Email"
                        {...register("email", {required: "Email is required!"}) }/>
                        <p className="text-red-600 text-sm"> {errors.email?.message} </p>
                    <input 
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "Recipient Phone Number" 
                        {...register("phone", {required: "Phone number is required!"}) }/>
                        <p className="text-red-600 text-sm"> {errors.phone?.message} </p>
                    <input
                        className=" bg-rose-200 border border-rose-600 rounded-3xl placeholder-black text-black text-center px-6 py-2 text-xl"
                        placeholder= "PT/Volunteer Notes"
                        {...register("notes")}/>
                    <input 
                        type="submit" 
                        value="Submit"
                        className="bg-rose-400 border border-black rounded-3xl px-6 py-2 text-2xl text-white hover:bg-rose-300 cursor-pointer"/>
                </form>
                </div>
                </>
            }
         </Popup>
        </>
    )
}