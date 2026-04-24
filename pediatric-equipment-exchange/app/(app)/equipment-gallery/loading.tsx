import LoadingWheel from "@/components/loading-wheel";

export default function Loading() {
  return (
    // recreating how the gallery looks to put the spinner inside of it 
    <div className = "flex min-h-screen w-full bg-[#FFC94A]">
        <main className = "flex-1 bg-[#FFC94A] m-6">
            <div className ="text-2xl p-3"> Gallery Here </div>
            {/* Search bar */}
                <div className = "px-8 text-xl bg-white border-2 border-[#132540] rounded-3xl md:h-9 md:w-153" >
                    <input type="text" 
                        placeholder = "Search inventory..." />
                </div>
            <div className = "mt-4 bg-white p-6 rounded-3xl min-h-[200px]">
            
                    {<LoadingWheel/>}
                
            </div>
        </main>
    </div>  
  );
}