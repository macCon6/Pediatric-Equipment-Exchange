
import EquipmentCard from "@/components/equipment-card";
import { ItemFields } from "@/mock-item-fields";

interface Props {
  items: ItemFields[];
}

export default function GalleryGrid( {items}: Props) {
    return (
            <>
            <div>
                <input type="text" placeholder="Search inventory..." />
            </div>
                <div className = "grid grid-cols-6 gap-2 p-6">
                    {items.map((item) => {
                        return (
                        <div key = {item.id}>
                        <EquipmentCard item ={item} /> 
                        </div> 
                        );
                    })}
                </div> 
            </>)
}