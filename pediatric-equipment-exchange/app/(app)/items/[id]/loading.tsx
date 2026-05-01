import LoadingWheel from "@/components/loading-wheel";
export default function Loading() {
  return (
    <div className="flex min-h-screen w-full bg-[#FFC94A]">
    
        {/* Main Content */}
      <div className="flex-1 w-full justify-center items-center pt-18">
          
          <LoadingWheel />
          
      </div>
      </div>
     
  );
}