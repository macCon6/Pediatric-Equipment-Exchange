// for drawing the signature 

"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef, useState, useEffect } from "react";

interface Props {
    signatureRef: React.RefObject<SignatureCanvas | null>
}

export default function SignatureBox ( { signatureRef }: Props) {

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

    const handleClear = () => {
        signatureRef.current?.clear();
    };

    return ( 
        <div className="bg-gray-200 p-4 rounded-3xl w-full">
            <h1 className="text-gray-600 mb-2 ml-1"> Please sign below </h1>
            <div className="w-full" ref={containerRef}>
                <SignatureCanvas
                    ref={signatureRef}
                    minWidth={2} //pen size
                    penColor="black"
                    canvasProps={{ width: containerWidth, height: Math.max(containerWidth, 500) * 0.4, className: "border rounded-xl border-black bg-white" }}
                />
            
                <div className="flex justify-between mt-4">
                    <button type="button" onClick={handleClear} className="px-4 py-2 bg-gray-300 text-black font-serif rounded hover:opacity-50 hover:cursor-pointer">
                            Clear
                    </button>
                </div>
            </div>
        </div>
    
    );
}