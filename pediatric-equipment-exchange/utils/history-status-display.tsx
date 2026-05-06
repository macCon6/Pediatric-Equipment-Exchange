import { ReadableDistribution } from "@/field_interfaces";

export function getStatusDisplay (entry: ReadableDistribution)  {
    
  const isReturned = !!entry.returned_at;
  const isCancelled = !!entry.cancelled_at;
  
  // a Completed State due to a cancellation has both returned_at and cancelled_at
  if (isReturned && isCancelled) {
    return {
      text: "Completed (Cancelled)",
      color: "text-red-400",
    };
  }

  // a Completed statue due to a return
  if (isReturned && !isCancelled) {
    return {
      text: "Completed (Returned)",
      color: "text-green-600",
    };
  }

  return {
    text: "Active",
    color: "text-sky-500",
  };
}