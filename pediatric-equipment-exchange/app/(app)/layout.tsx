// the pages after login all commonly use the sidebar, so put it in their common layout here
// later we can add a header and footer here

import SideBar from "@/components/sidebar";

export default function Layout({ children}: {children: React.ReactNode;}) {

  return (
    <div className="flex min-h-screen bg-[#FFC94A]">
      <SideBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}