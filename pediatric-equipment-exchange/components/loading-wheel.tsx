

export default function LoadingWheel() {
   return (
    
     <div className="flex flex-col items-center my-5">
      <div className="w-25 h-25 border-6 border-[#FFC94A] border-t-gray-300 rounded-full animate-spin"></div>
      <div className="text-md text-center text-[#FFC94A] mt-2">
        Loading...
      </div>
    </div>
    );
};
