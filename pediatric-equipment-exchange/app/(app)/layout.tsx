// layout for all pages besides login and landing

import Header from "@/components/header";
import SideBar from "@/components/sidebar";
import UIProvider from "../providers/ui-provider";

export default function Layout({ children}: {children: React.ReactNode;}) {
  return (
    <>
    <UIProvider> 
      <div className="min-h-screen flex flex-col bg-[#FFC94A] w-full">
        <Header />
        <div className="flex flex-1 w-full ">
          <SideBar />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </div>
    </UIProvider> 
    </>
  );
}