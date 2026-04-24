// give different statuses different colors

export function getStatusColor(status: string) {
    switch(status) {
      case "Available": return "bg-green-400";
      case "Reserved - Needs Signature":  return "bg-yellow-400";
      case "Reserved - Ready for Pickup":  return "bg-yellow-600";
      case "Allocated": return "bg-red-800";
      case "In Processing": return "bg-sky-400";
    }
}