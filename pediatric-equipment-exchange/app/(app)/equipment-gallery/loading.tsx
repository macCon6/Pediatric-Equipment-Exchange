import LoadingWheel from "@/components/loading-wheel";

export default function Loading() {
  return (
    <div className="p-6 w-full"> 
    <div className="flex flex-col min-h-0 w-full gap-4 animate-pulse">

      {/* Search + Filters box */}
      <div className="flex flex-col gap-3 bg-white rounded-3xl p-4">

        {/* Search bar */}
        <div className="w-full">
          <div className="bg-gray-50 border-2 border-[#132540] rounded-3xl w-full">
            <input type="text"
              className="w-full px-4 py-2 bg-transparent rounded-3xl focus:outline-none tracking-wider"
              disabled
              placeholder="Loading..."
            />
          </div>

        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-base font-semibold text-[#132540] mr-1">
            Loading Filters...
          </span>

          {/* Dropdown skeltones */}
          <div className="h-10 w-52 bg-gray-100 border-2 border-[#132540] rounded-2xl" />
          <div className="h-10 w-28 bg-gray-100 border-2 border-[#132540] rounded-2xl" />
          <div className="h-10 w-36 bg-gray-100 border-2 border-[#132540] rounded-2xl" />

          {/* Results count */}
          <span className="text-sm text-gray-500 ml-auto">
            Counting items...
          </span>
        </div>
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white p-4 rounded-3xl">
        
        <div className="col-span-2 md:col-span-4 flex justify-center items-center mt-4">
          <LoadingWheel />
        </div>

      </div>
    </div>
    </div>
  );
}