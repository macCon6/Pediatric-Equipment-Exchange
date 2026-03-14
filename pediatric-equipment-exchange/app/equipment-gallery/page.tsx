import Link from "next/link";
import GalleryGrid from "@/components/gallery-logic";
import { mockData } from "@/mock-data";

export default function EquipmentGallery() {
        return (
            <>
            <div className ="text-2xl"> Gallery Here </div>

            <GalleryGrid items ={mockData} />
        
            <div className="mt-16"> <Link href= {"/scanner"}> Go to Scan Page </Link> </div> </>
        );
}