// 

import EquipmentDetails from "@/components/equipment-details";
import { mockData } from "@/mock-data";

interface Props {
  params: Promise<{ id: number }>;
}

export default async function Item({ params }: Props) {

    const {id} = await params;
    const item = mockData.find(i => i.id == id);

    if(!item)  {
        return <div> Item not found </div>
    }

    return (
       <EquipmentDetails item = {item} />
    )
}
