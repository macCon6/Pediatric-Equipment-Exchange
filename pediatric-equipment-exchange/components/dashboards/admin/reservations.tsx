"use client";

import EquipmentCard from "@/components/equipment-card";
import { ItemFields } from "@/field_interfaces";

interface Props {
  items: ItemFields[];
}

export default function ReservedEquipment({ items = [] }: Props) {
  const reservedItems = items.filter(
  (item) => item.status.startsWith("Reserved")
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reserved Items</h2>

      {reservedItems.length === 0 && (
        <p>No reserved items</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {reservedItems.map((item) => (
          <div key={item.id}>
            <EquipmentCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}