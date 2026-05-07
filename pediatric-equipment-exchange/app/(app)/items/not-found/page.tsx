
export default async function ItemNotFound() {

    return (
      <div className="flex flex-1 bg-[#FFC94A] h-screen justify-center items-center"> 
        <div className="-translate-y-18 flex bg-orange-100 p-6 border border-gray-100 shadow-lg  rounded-3xl w-3/4 mb-10 md:mr-20 md:mb-20 h-1/2 items-center justify-center"> 
          <p className="text-4xl text-orange-600 tracking-wide text-center "> Item not found </p>
        </div>
      </div>
    )
  }
