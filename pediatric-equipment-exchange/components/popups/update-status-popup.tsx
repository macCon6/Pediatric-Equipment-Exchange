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

    const labelClass = "text-sm font-semibold text-[#132540]";

    return (
        <>
        <Popup isOpen={isOpen} onClose ={handleClose} 
        sizingClassName={`${mode === "confirm"? "max-w-sm md:max-w-lg w-full " : "max-w-sm md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full h-full"}`}> 
            
            {/* Back button */}
            {(mode !== "select" && mode !== "confirm") && 
            <span onClick={()=>{setMode("select")}} 
                className="bg-gray-300 text-white text-xl ml-1 md:text-2xl px-3 py-1 rounded-xl font-bold hover:cursor-pointer hover:opacity-60"> 
                ↵
            </span>
            }   

            {mode === "select" && 
                <>
                {/* status buttons */}
                <h1 className="text-3xl text-center font-bold mb-4 md:mb-6"> Update Status </h1>

                <p className= "py-2 md:py-4 text-xl"> Current status: </p>

                {/* show current status above the "choose status" area */}
                <div className={`flex flex-1 justify-center p-3 md:p-4 rounded-lg ${getStatusColor(current_status)} hover:cursor-not-allowed mb-8 shadow-xl`}>
                    <span className="text-white font-bold text-center tracking-wide">
                        {current_status} 
                    </span>
                </div>

                <p className= "text-xl mb-3 md:mb-5"> Select which status to update to: </p>
        
                <div className="flex flex-col gap-6 md:gap-8"> 
                    {/* Target statuses */}
                    {STATUS_OPTIONS.filter(status_option => status_option !== current_status).map(status_option => (
                        // create the status buttons
                        <button key={status_option}
                            onClick={() => handleTargetStatusChange(status_option)}
                            className={`p-3 md:p-4 text-white tracking-wide font-bold rounded-lg shadow-xl ${getStatusColor(status_option)} hover:cursor-pointer hover:opacity-50 hover:scale-105`}
                        >
                            {status_option} 
                        </button>
                    ))}
                </div>
                </>
            }

            {mode === "reserve" && 
                <>
                <p className="mt-3 text-lg text-black font-bold tracking-tight text-center"> Please complete the Reservation Form to reserve this item </p>
                <div className="py-8 max-w-full bg-white rounded-2xl overflow-y-auto flex min-h-0 ">
                <form onSubmit={handleReservationSubmit(onReservationSubmit)} className="flex flex-col gap-3 w-full">

                    <label className={labelClass}> Child Name <span className="text-red-500"> * </span></label>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Recipient" 
                        {...registerReservation("name", { required: "Name is required!"})} />
                        <p className="text-red-600 text-sm"> {reservationErrors.name?.message} </p>

                    <label className={labelClass}> Caregiver Name <span className="text-red-500"> * </span></label>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Guardian"
                        {...registerReservation("contact_name", {required: "Contact is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.contact_name?.message} </p>

                    <label className={labelClass}> Caregiver Email <span className="text-red-500"> * </span></label>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "blank@blank.com"
                        {...registerReservation("email", {required: "Email is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.email?.message} </p>

                    <label className={labelClass}> Caregiver Phone Number <span className="text-red-500"> * </span></label>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "(000) 000-0000" 
                        {...registerReservation("phone", {required: "Phone number is required!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.phone?.message} </p>
                    
                    <label className={labelClass}> Authorized for Pickup <span className="text-red-500"> * </span></label>
                    <input 
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "Who can pick up this item?"
                        {...registerReservation("authorized_for_pickup", {required: "Please enter names of who is authorized to pickup the item!"}) }/>
                        <p className="text-red-600 text-sm"> {reservationErrors.contact_name?.message} </p>
                    
                    <label className={labelClass}> Clinic Name <span className="text-red-500"> * </span></label>
                    <input
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder= "e.g. Erlanger"
                        {...registerReservation("clinic", {required: "Clinic is required!"})} />
                        <p className="text-red-600 text-sm"> {reservationErrors.clinic?.message} </p>

                    <label className={labelClass}> Therapist Notes </label>
                    <input
                        className="mt-1 text-center border rounded-xl text-black p-2"
                        placeholder="Anything to say?"
                        {...registerReservation("notes")}/>

                    <input 
                        type="submit" 
                        value="Reserve Item"
                        className="bg-[#5a9e3a] mt-6 hover:opacity-60 hover:cursor-pointer text-white font-semibold px-6 py-2 rounded-full shadow-xl"/>
                </form>
                </div>
                </>
            }

            {mode === "cancel" && 
                <div className="flex flex-col items-center justify-center text-center px-4 py-6 gap-4">
                    <h2 className="mt-2 text-2xl font-bold text-[#132540]">Would you like to add a reason for this cancellation? </h2>

                    <p className="mt-3 text-base text-gray-600 text-center italic"> Note that only admins or reservation owners can cancel. </p>

                    <form onSubmit={handleCancellationSubmit(onCancellationSubmit)} className="w-full max-w-lg flex flex-col gap-4 items-center mt-2">
                    <textarea 
                        className="mt-3 max-w-lg w-full h-32 sm:h-40 md:h-48 text-center border rounded-xl text-black p-2 resize-none focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder= "What happened?" 
                        rows={6}
                        {...registerCancellation("cancellation_reason")} />
                    
                    <input 
                        type="submit" 
                        value="Cancel Reservation"
                        className="mt-6 bg-red-500 hover:opacity-60 hover:cursor-pointer text-white font-semibold px-6 py-2 rounded-full"/>
                    
                    
                </form>
                </div>
               
            }

            {mode === "confirm" && 
            <div className="flex flex-1 md:h-[20vh]"> 
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
                </div>
            }
            

         </Popup>
        </>
    )
}