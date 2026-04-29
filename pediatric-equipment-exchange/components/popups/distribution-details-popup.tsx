import Popup from "@/components/popups/popup";
import Link from "next/link";
import { DistributionWithRecipientAndStaff } from "@/field_interfaces";

interface Props {
    current_status: string,
    distribution: DistributionWithRecipientAndStaff, 
    equipment_id: string,
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
} 

export default function DistributionDetailsPopup({current_status, equipment_id, distribution, isOpen, onClose}: Props) {
    
    if (!distribution) return null;

    return (
        <Popup isOpen={isOpen} onClose ={onClose} sizingClassName="h-full max-h-[70vh] w-full max-w-5xl"> 

             <div>
                <h1 className="text-2xl"> Details </h1>
            <ul className="text-xl "> 
            {/* First stage, show recipient info and waiver link */}
            {current_status.startsWith("Reserved") &&
                <> 
                <li> Recipient Name: {distribution.recipient?.name} </li>
                <li> Contact Name: {distribution.recipient?.contact_name} </li>
                <li> Contact Phone: {distribution.recipient?.phone} </li>
                <li> Contact Email: {distribution.recipient?.email} </li>
                <li> Authorized for Pickup: {distribution.recipient?.authorized_for_pickup} </li>
                <li> Reserved by: {distribution.reserved_staff?.full_name} </li>
                <li> Reserved at: {distribution.reserved_at? new Date(distribution.reserved_at).toLocaleString() : "--"} </li>
                <li> View Waiver: <Link href= {`/items/${equipment_id}/waiver`} className="underline text-blue-400"> Here. </Link> </li>
                </>

            }

            {current_status === "Reserved - Ready for Pickup" && 
                <>
                <li> Waiver signed at: {distribution.signed_at} </li>
                </>
            }

            {current_status === "Allocated" && 
                <>
                <li> Allocated at: {distribution.allocated_at? new Date(distribution.reserved_at).toLocaleString() : "--"} </li>
                <li> Allocated by: {distribution.allocated_staff?.full_name} </li>
                <li> Condition at Allocation: {distribution.condition_at_allocation} </li>
                <li> Recipient Name: {distribution.recipient?.name} </li>
                <li> Contact Name: {distribution.recipient?.contact_name} </li>
                <li> Contact Phone: {distribution.recipient?.phone} </li>
                <li> Contact Email: {distribution.recipient?.email} </li>
                <li> View Waiver: <Link href= {`/items/${equipment_id}/waiver`} className="underline text-blue-400"> Here. </Link> </li>
                </>
            }

            </ul>
            </div>
    
        </Popup>
    );
}