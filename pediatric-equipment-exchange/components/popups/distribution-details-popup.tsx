import Popup from "@/components/popups/popup";
import Link from "next/link";

interface Props {
    current_status: string,
    distribution: any
    equipment_id: string,
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
} 

export default function DistributionDetailsPopup({current_status, equipment_id, distribution, isOpen, onClose}: Props) {
    
    if (!distribution) return null;

    return (
        <Popup isOpen={isOpen} onClose ={onClose} sizingClassName="max-w-sm md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full h-full"> 

            <h1 className="text-center font-bold text-2xl"> {current_status.startsWith("Reserved")? "Reservation": "Allocation"} Details  </h1>

            <div className="flex flex-col py-5">
                <ul className="text-xl space-y-2"> 
                    {/* First stage, show recipient info and waiver link */}
                   
                  
                        <li> <strong> Recipient Name: </strong> {distribution.recipient_name} </li>
                        <li> <strong> Contact Name: </strong> {distribution.contact_name} </li>
                        <li> <strong> Contact Phone: </strong> {distribution.contact_phone} </li>
                        <li> <strong> Contact Email: </strong> {distribution.contact_email} </li>
                        <li> <strong> Authorized for Pickup: </strong> {distribution.authorized_for_pickup} </li>
                        <li> <strong> Reserved by: </strong> {distribution.reserved_by_name} </li>
                        <li> <strong> Reserved at: </strong> {distribution.reserved_at? new Date(distribution.reserved_at).toLocaleString() : "--"} </li>
                   

                    {current_status === "Reserved - Ready for Pickup" && 
                    <>
                    <li> <strong> Waiver signed at: </strong>  {distribution.signed_at? new Date(distribution.signed_at).toLocaleString() : "--"} </li>
                    <li> <strong> Signing Therapist: </strong> {distribution.signed_by_name} </li>
                    </>
                    }

                    {current_status === "Allocated" && 
                    <>
                    <li> <strong> Allocated at: </strong> {distribution.allocated_at? new Date(distribution.reserved_at).toLocaleString() : "--"} </li>
                    <li> <strong> Allocated by: </strong> {distribution.allocated_by_name} </li>
                    <li> <strong> Condition at Allocation: </strong> {distribution.condition_at_allocation} </li>
                    </>
                    }

                    <li> <strong> {!distribution.signed_at? "Sign ": "View "} Waiver: </strong> <Link href= {`/items/${equipment_id}/waiver`} className="underline text-blue-400"> Here. </Link> </li>

                </ul>
            </div>
        </Popup>
    );
}