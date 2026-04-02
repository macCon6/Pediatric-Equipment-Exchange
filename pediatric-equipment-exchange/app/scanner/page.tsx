
import SideBar from "@/components/sidebar";


export default function Scanner() {
    
    return ( <> 
        <div className = "flex h-screen w-screen">
            <SideBar />
            <main className = "flex-1 p-4">
                <h1 className="text-2xl"> Scan Equipment </h1>
            </main>
        </div>
        </>)
}
