import LoadingWheel from "@/components/loading-wheel";

export default function Loading() {
  return (
    <div className= "flex min-h-screen min-w-screen bg-[#134e4a] justify-center items-center">
        <div className= "flex flex-1 flex-col bg-white justify-center mt-4 p-6">
            {<LoadingWheel/>}    
        </div>
    </div>
  );
}