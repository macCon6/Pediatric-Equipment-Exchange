import Popup from "@/components/popups/popup";
import { RecipientFields } from "@/field_interfaces";

interface Props {
    recipient: RecipientFields,
    isOpen: boolean, // to show the popup
    onClose: () => void, // to close the popup
}

export default function RecipientInfoPopup( {recipient, isOpen, onClose}: Props) {

    return (
        <Popup isOpen={isOpen} onClose ={onClose} sizingClassName=""> 
       { recipient? ( 
            <div>
                <ul className="text-xl font-mono">
                    <li> Recipient Name: {recipient.name} </li>
                    <li> Contact Name: {recipient.contact_name}  </li>
                    <li> Contact Email: {recipient.email} </li>
                    <li> Contact Phone: {recipient.phone}</li>
                    <li> Created At: {recipient.created_at} </li>
                </ul>
            </div>
       ) : (<p className="text-red-500"> Error fetching recipient info </p>) 
        }
        </Popup>
    );
}