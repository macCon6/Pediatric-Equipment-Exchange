// for drawing the signature and submitting to api route for inserting it onto a waiver

"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Toast from "@/components/popups/toast";

interface Props {
    template_url: string,
    distribution_id: string,
    waiver_signed: boolean
}

export default function Signature ({template_url, distribution_id, waiver_signed}: Props) {

    const signature = useRef<SignatureCanvas>(null); //ref gives access to the underlying canvas to be able to clear, save, etc
    const [mostRecentSigned, setmostRecentSigned] = useState(waiver_signed);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("error");

    // same way of handling window resizing as in display-waiver component
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null); 
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth); 
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    // clear the canvas
    const handleClear = () => {
        signature.current?.clear(); 
    }

    // save the signature as png to insert it into the pdf via the api route
    const handleSave = async () => {
        try{
            if(!signature || !signature.current) { return alert("Please add your signature") }
            const signature_data_url= signature.current.toDataURL("image/png");
            const res = await fetch(`/api/distributions/${distribution_id}/sign-waiver`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    distribution_id, // sent from the display waiver component
                    template_url,
                    signature_data_url
                })
            });
            const saveResponse = await res.json();
            if (!saveResponse.success) {
                setToastMessage("Error saving waiver: " + saveResponse.error);
                setToastType("error");
                return;
            }
            setmostRecentSigned(true); //show the new page if/when signature is received
            setToastMessage(saveResponse.message);
            setToastType("success");
            signature.current.clear();
        } catch (err) {
            console.log(err);
            setToastMessage("Server error");
            setToastType("error");
        }
    }

    return ( 
        <>
        {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

        {!mostRecentSigned? ( // show the signature canvas if waiver isn't signed, otehrwise show the message
            <div className="bg-gray-200 p-4 rounded-3xl shadow-xl w-full">
                <p className="mb-4 text-lg font-serif text-black"> Recipient signature: </p>
                <div className="w-full" ref={containerRef}>
                    <SignatureCanvas
                        ref={signature}
                        minWidth={2} //pen size
                        penColor="black"
                        canvasProps={{ width: containerWidth, height: Math.max(containerWidth, 500) * 0.4, className: "border border-black bg-white" }}
                    />
                    <div className="flex justify-between mt-4">
                        <button onClick={handleClear} className="px-4 py-2 bg-gray-300 text-black font-serif rounded hover:opacity-50 hover:cursor-pointer">
                            Clear
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white font-serif rounded hover:bg-teal-800 hover:cursor-pointer">
                            Sign Waiver
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-gray-200 p-4 rounded-3xl shadow-xl w-full h-full">
                <p className="mb-4 text-2xl font-serif text-red-700 italic text-center mt-60"> 
                    The waiver has been signed. Admins may view it in the admin page. 
                </p>
                <p className="mb-4 text-2xl font-serif text-red-700 italic text-center"> 
                    Thank you!
                </p>
                <div className="flex justify-center w-full mt-20">
                    <Link href="/equipment-gallery" className="px-6 py-3 bg-teal-600 text-white font-mono rounded hover:bg-teal-800"> Back to gallery </Link>
                </div>
            </div>
        )
        }
    </>
    );
}