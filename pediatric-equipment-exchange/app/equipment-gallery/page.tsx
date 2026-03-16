import GalleryGrid from "@/components/gallery-logic";
import { mockData } from "@/mock-data";
import SideBar from "@/components/sidebar";

export default function EquipmentGallery() {
        return (
            <>
            <div className = "flex h-screen">
                 <SideBar />
                
                <main className = "flex-1 bg-teal-200">
                    <div className ="text-2xl p-3"> Gallery Here </div>
                    {/* Passes the mock data to the gallery-logic component */}
                    <div className = "flex-1 p-6">
                        <GalleryGrid items ={mockData} />
                    </div>
                </main>
            </div>  </>
        );
}