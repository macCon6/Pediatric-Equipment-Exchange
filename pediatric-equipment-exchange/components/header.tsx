
// this header now has the sidebar hamburger icon

"use client";

import { useUI } from "@/app/providers/ui-provider";

export default function Header() {

  const { setSideBarOpen } = useUI();

  return (
    <header className=" bg-[radial-gradient(ellipse_at_center,rgba(92,169,59),rgba(76,157,107),rgba(102,183,67))]
      relative sticky top-0 h-18 flex items-center shadow-xl z-50 items-center px-4">

      <button onClick={ () =>setSideBarOpen(true)} className="lg:hidden bg-white py-2 px-3 rounded shadow mb-1">
        ☰
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 lg:-translate-x-1/4 text-center text-white">                          
        <div className="text-center text-lg md:text-2xl tracking-wide ">
          Beyond the Horizon
          <p className="text-sm"> Lending Library </p>
        </div>
      </div>
    </header>
  );
}   