"use client";

import EquipmentCard from "@/components/equipment-card";
import { ItemFields } from "@/field_interfaces";

interface Props {
  items: ItemFields[];
}

export default function AllocatedEquipment({ items =[] }: Props) {
  const allocatedItems = items.filter(
    (item) => item.status === "Allocated"
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Checked-Out Items</h2>

      {allocatedItems.length === 0 && (
        <p>No allocated items</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allocatedItems.map((item) => (
          <div key={item.id}>
            <EquipmentCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}