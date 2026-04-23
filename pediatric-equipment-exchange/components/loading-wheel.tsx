

export default function LoadingWheel() {
   return (
    <>
        <div className="flex justify-center my-5"> 
            <div className="w-25 h-25 border-6 border-orange-700 border-t-gray-300 rounded-full animate-spin"> </div>    
        </div>
        <div className="text-md text-center font-mono text-[#FFC94A]"> 
                    Loading... 
        </div>
     </>
    );
};
