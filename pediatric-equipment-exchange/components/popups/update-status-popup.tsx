// this is a popup for when the user clicks the "Update Status" button on the equipment details page

"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Popup from "@/components/popups/popup"; 
import Confirm from "@/components/user-confirmation";
import { STATUS_OPTIONS } from "@/item-field-options";
import { getStatusColor } from "@/utils/status-colors";

interface reservationForm {
    name: string;
    contact_name: string;
    clinic: string;
    email: string;
    phone: string;
    notes?: string
    authorized_for_pickup: string
}

interface cancellationForm {
    cancellation_reason: string;
};

interface UpdateStatusProps {
    equipment_id: string;
    distribution_id: string,
    current_status: string,
    onStatusChange: (updatedStatus: string) => void, // need this to trigger a re-render of the "current status" box
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
    showToast: (message: string, type: "success" | "error") => void
}

export default function UpdateStatusPopup({equipment_id, distribution_id, current_status, isOpen, onClose, onStatusChange, showToast}: UpdateStatusProps) {

    const {register: registerReservation, handleSubmit:handleReservationSubmit, reset: resetReservationForm, formState: {errors: reservationErrors}} = useForm<reservationForm>(); 
    const {register: registerCancellation, handleSubmit:handleCancellationSubmit, reset: resetCancellationForm} = useForm<cancellationForm>();  

    // track if in select state, reserve state (opens form), cancel state (opens form) or confirmation dialogue
    const [mode, setMode] = useState<"select" | "reserve" | "cancel" | "confirm">("select"); 
    const [targetStatus, setTargetStatus] = useState("");
    const [reservationDetails, setReservationDetails] = useState<reservationForm>();
    const [cancellationReason, setCancellationReason] = useState<string>("");

    const handleClose = () => {
        resetReservationForm();
        resetCancellationForm();
        onClose();  // close popup
        setTargetStatus("");
        setMode('select');
    };
 
    // for when clicking on a chosen status, opens reserve mode w/ ReservationForm when clicking Reserved - Needs Signature
    // opens a form to input a cancellation reason if it's going from reserved -> available
    const handleTargetStatusChange = (status_option: string) => {
        setTargetStatus(status_option);
        if (status_option === "Reserved - Needs Signature") {
            setMode("reserve"); 
        } else if(current_status.startsWith("Reserved") && status_option === "Available") {
            setMode("cancel"); 
        } else {
            setMode("confirm"); // have user confirm with the Confirm component
        }
    };

    const updateEquipmentStatus = async (
        distribution_id: string,
        equipment_id: string,
        target_status: string,
        reservationDetails?: reservationForm,
        cancellationReason?: string ) => {
        
        // call API to update the status
        try {
            const res = await fetch(`/api/equipment/${equipment_id}/update-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    distribution_id: distribution_id, 
                    equipment_id: equipment_id,
                    target_status: target_status, 
                    reservationFormData: reservationDetails,
                    cancellationReason: cancellationReason
                }) 
            });

            const result = await res.json();

            if (!res.ok) { throw new Error(result.error || "Request failed"); }

            showToast("Status updated!", "success");
            onStatusChange(target_status); // re-render the current status

        } catch (error: any) {
            showToast(error.message, "error");
        }
        
    }   

    // for submitting the reservation form (target status is "Reserved - Needs Signature" since the form only shows in that case)
    const onReservationSubmit: SubmitHandler<reservationForm> = async (data: reservationForm) => {
      setReservationDetails(data);
      setMode("confirm");
    }
     
    const onCancellationSubmit: SubmitHandler<cancellationForm> = async (data: cancellationForm) => {
      setCancellationReason(data.cancellation_reason);
      setMode("confirm");
    } 

    return (
        <>
        <Popup isOpen={isOpen} onClose ={handleClose} 
        sizingClassName={`${mode === "confirm"? "max-w-md w-full h-auto" : ""}`}> 

            {mode === "select" && 
                <>
                {/* status buttons */}
                <h1 className="text-3xl text-center font-bold mb-4"> Update Status </h1>

                <p className= "py-3 text-xl"> Current status: </p>

                {/* show current status above the "choose status" area */}
                <div className={`flex flex-1 justify-center p-3 rounded-lg ${getStatusColor(current_status)} mb-10`}>
                    <span className="text-white font-bold text-center">
                        {current_status} 
                    </span>
                </div>

                <p className= "text-xl mb-4"> Select which status to update to: </p>
        
                <div className="flex flex-col gap-10"> 
                    {/* Target statuses */}
                    {STATUS_OPTIONS.filter(status_option => status_option !== current_status).map(status_option => (
                        // create the status buttons
                        <button key={status_option}
                            onClick={() => handleTargetStatusChange(status_option)}
                            className={"p-3 text-white rounded-lg bg-teal-700 hover:cursor-pointer hover:bg-teal-900 hover:scale-105"}
                        >
                            {status_option} {/* button text */}
                        </button>
                    ))}
                </div>
                </>
            }

            {mode === "reserve" && 
                <>
                <p className="mt-8 text-xl text-gray-600 text-center"> Please complete the Reservation Form to reserve this item </p>
                <div className="py-8 max-w-full bg-white rounded-2xl overflow-y-auto flex min-h-0 gap-6">
                <form onSubmit={handleReservationSubmit(onReservationSubmit)} className="flex flex-col gap-4 w-full">
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Recipient Name" 
                        {...registerReservation("name", { required: "Name is required!"})} />
                        <p className="text-red-600 text-sm"> {reservationErrors.name?.message} </p>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Contact Name"
                        {...registerReservation("contact_name", {required: "Contact is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.contact_name?.message} </p>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Contact Email"
                        {...registerReservation("email", {required: "Email is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.email?.message} </p>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Contact Phone Number" 
                        {...registerReservation("phone", {required: "Phone number is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.phone?.message} </p>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Authorized for Pickup"
                        {...registerReservation("authorized_for_pickup", {required: "Please enter names of who is authorized to pickup the item!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.contact_name?.message} </p>
                     <input
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Clinic"
                        {...registerReservation("clinic", {required: "Clinic is required!"})} />
                        <p className="text-red-600 text-sm"> {reservationErrors.clinic?.message} </p>
                    <input
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Therapist Notes"
                        {...registerReservation("notes")}/>
                    <input 
                        type="submit" 
                        value="Submit"
                        className="mt-5 bg-rose-400 border border-black rounded-3xl px-6 py-2 text-2xl text-white hover:bg-rose-300 cursor-pointer"/>
                </form>
                </div>
                </>
            }

            {mode === "cancel" && 
                <>
                <p className="mt-8 text-xl text-gray-600 text-center"> Would you like to add a reason for this cancellation? </p>
                <p className="mt-8 text-md text-gray-600 text-center italic"> Note that only admins or reservation owners can cancel. </p>
                <div className="py-8 max-w-full bg-white rounded-2xl overflow-y-auto flex min-h-0 gap-6">
                <form onSubmit={handleCancellationSubmit(onCancellationSubmit)} className="flex flex-col gap-4 w-full">
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Reason for cancellation..." 
                        {...registerCancellation("cancellation_reason")} />
                    
                    <input 
                        type="submit" 
                        value="Submit"
                        className="mt-5 bg-rose-400 border border-black rounded-3xl px-6 py-2 text-2xl text-white hover:bg-rose-300 cursor-pointer"/>
                </form>
                </div>
                </>
            }

            {mode === "confirm" && 
                <Confirm title="Status Change"
                    message={`Are you sure you want set this item's status to ${targetStatus}?`}
                    onConfirm= {async () => {
                        await updateEquipmentStatus(
                            distribution_id,
                            equipment_id,
                            targetStatus,
                            reservationDetails,
                            cancellationReason)
                            handleClose();
                    }}
                    onCancel={()=>{setMode("select")}}
                />
            }

         </Popup>
        </>
    )
}