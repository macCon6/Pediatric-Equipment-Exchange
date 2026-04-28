import LoadingWheel from "@/components/loading-wheel";

export default function Loading() {
  return (
    // recreating how the gallery looks to put the spinner inside of it 
    <div className = "h-full w-full flex flex-col overflow-hidden bg-[#FFC94A]">
      <main className = "flex-1 min-h-0 min-w-0 flex bg-[#FFC94A]">
        <div className = "flex flex-1 min-h-0 min-w-0 p-6">
          <div className="h-full flex flex-col min-h-0 w-full">
            {/* Search bar */}
           {/* Search bar */}
            <div className="w-full flex rounded-3xl p-1">
                <div className="w-full max-w-[16rem] md:max-w-md lg:max-w-2xl xl:max-w-3xl">
                    <div className="bg-white border-2 border-[#132540] rounded-3xl w-full h-10">
                        <input type="text" 
                            disabled
                            className="w-full px-3 py-2"
                            placeholder = "Loading..." />
                     </div>
                </div>
            </div>
                       
            <div className = "h-full mt-4  bg-white p-8 rounded-3xl">        
              <LoadingWheel />
            </div>     
          </div>
        </div>
      </main>
    </div>  
  );
}