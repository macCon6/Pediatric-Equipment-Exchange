import SideBar from "@/components/sidebar";

export default function ItemIntake() {
    return ( <> 
        <div className = "flex h-screen w-screen">
            <SideBar />
            <main className = "flex-1 p-4">
                <h1 className="text-2xl"> Add Items Here </h1>
            </main>
        </div>
        </>)
}