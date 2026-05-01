"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import Signature from "@/components/waiver-utilities/signature-box";
import Toast from "@/components/popups/toast";
import Link from "next/link";

// required setup for react-pdf / pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  template_id: string,
  displayed_waiver_url: string,
  is_signed: boolean,
  distribution_id: string,
  equipment: any, // to add as an automically "filled" field to pass to the sign-waiver route
}

interface waiverForm {
  equipment_name: string, 
  barcode_value: string,
  typed_recipient_name: string,
  typed_guardian_name: string,
  relationship_to_child: string,
  typed_staff_name: string,
}

export default function DisplayAndSignWaiver({ template_id, displayed_waiver_url, is_signed, distribution_id, equipment }: Props) {

  const [numPages, setNumPages] = useState(0); // to render a pdf with unknown # of pages in react-pdf
  const [pdfURL, setPDFURL] = useState(displayed_waiver_url);
  const [isSigned, setIsSigned] = useState(is_signed); // to update the right side when the waiver has been signed

  const guardianSignature = useRef<SignatureCanvas>(null);
  const staffSignature = useRef<SignatureCanvas>(null);

  const {register, handleSubmit, reset, formState: {errors}} = useForm<waiverForm>(); 

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"error" | "success">("error");

  // this is to make the pdf container responsive to changes in page resize,ie. to display properly on mobile
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null); // this gets set below in the div that holds the pdf

  // runs on mount but adds an event listener for whne resizing the window
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth); 
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // runs on unmount, prevents memory leak
  }, []);


  // for submitting the waiver: staff & guardian signatures, date, barcode # and equipment name
  const onSubmit: SubmitHandler<waiverForm> = async (data: waiverForm) => {

    try {
      if(!guardianSignature.current || guardianSignature.current.isEmpty?.()) { 
        throw new Error("Missing guardian signauture");
      }
      
      else if (!staffSignature.current || staffSignature.current.isEmpty?.()) {
        throw new Error("Missing staff signature");
      }

      const staffSig_data_url= staffSignature.current.toDataURL("image/png");
      const guardianSig_data_url= guardianSignature.current.toDataURL("image/png");

      const res = await fetch("/api/sign-waiver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distribution_id: distribution_id,
          template_id: template_id,
          typed_recipient_name: data.typed_recipient_name,
          typed_guardian_name: data.typed_guardian_name,
          relationship_to_child: data.relationship_to_child,
          guardian_signature: guardianSig_data_url,
          typed_staff_name: data.typed_staff_name,
          staff_signature: staffSig_data_url,
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          barcode_value: equipment.barcode_value
        })
      });
      
      const result = await res.json();

      if (!res.ok) { // failure
        throw new Error (result.error || "Unknown error when signing waiver");
      }

      setPDFURL(result.waiver_url);
      setIsSigned(true);
      setToastType("success");
      setToastMessage(result.message);

    } catch(error: any) {

      setToastType("error");
      setToastMessage(error.message);

    }
  } 

  return (
    <>
    {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}
        
    <div className="flex flex-col min-h-screen bg-[#FFC94A]">
          
      {/* <div className="bg-[#FFC94A] mt-2 p-3 rounded-lg text-center">
        <p className="text-white text-lg md:text-2xl font-serif"> Please read the waiver. Scroll down to sign. </p>
        <p className="mt-3 text-white text-sm md:text-md italic font-serif"> Safari users may need to update or access via Chrome. </p>
      </div> */}
    
      {/* Grid setup, 2 columns on big screen, 1 stacked column on smaller */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:-mt-3 p-4 md:p-8 h-full">

        {/* Left column, PDF waiver */}
        <div
          ref={containerRef}
          className="bg-white rounded-lg overflow-auto max-h-[85vh] flex flex-col p-2 relative"
        >
          <div className="flex flex-col gap-4 w-full">
            <Document
              file={pdfURL} 
              onLoadSuccess={({ numPages }) => setNumPages(numPages)} 
            >
              {Array.from(new Array(numPages), (_, i) => ( 
                <div key={i} className="bg-white p-2 w-full flex justify-center">
                  <Page
                    pageNumber={i + 1}
                    width={containerWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </div>
              ))}
            </Document>  
          </div>  
        </div> 

        {/* Right column, scrollable. Includes the assigned equipment info, and place for staff/recipient to type & sign names */}
      {!isSigned && 
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-auto space-y-8 max-h-[85vh] p-2 bg-gray-200 rounded-lg">

          <div className="relative mt-3 bg-white border border-black rounded-lg p-6 pt-10 space-y-4">
            <h2 className="absolute -top-3 left-1/2 transform -translate-x-1/2  bg-[#5a9e3a] text-white px-4 py-1 rounded-full">
              Details </h2>
            <div>
              <label className="text-sm text-gray-600"> Item Name </label>
              <input
                value={equipment.name}
                disabled
                className="hover:cursor-not-allowed border p-2 w-full bg-gray-100 text-gray-800"
              />
            </div>

            <div className="mt-2">
              <label className="text-sm text-gray-600"> Barcode </label>
              <input
                value={equipment.barcode_value}
                disabled
                className="hover:cursor-not-allowed border p-2 w-full bg-gray-100 text-gray-600"
              />
            </div>

            <div className="mt-2">
              <label className="text-sm text-gray-600"> Date </label>
              <input
                value={new Date().toLocaleDateString()}
                disabled
                className="hover:cursor-not-allowed border p-2 w-full bg-gray-100 text-gray-600"
              />
            </div>
          </div>
  
          <div className="relative bg-white border border-black space-y-4 rounded-lg p-6 pt-10 space-y-4">
            <h2 className="text-sm md:text-base text-white absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#5a9e3a] px-4 py-1 rounded-full ">
              Child & Guardian </h2>

            <label className="text-sm text-gray-600"> Child / Recipient Name </label>
            <input
              {...register("typed_recipient_name", { required: "Please type recipient name" })}
              placeholder="Type name here..."
              className="mt-1 text-center border rounded-xl black text-black p-2 w-full"
            />
             <p className="text-red-600 text-sm">{errors.typed_recipient_name?.message}</p>

            <label className="text-sm text-gray-600"> Parent or Legal Guardian Name </label>
            <input
              {...register("typed_guardian_name", { required: "Please type guardian name" })}
              placeholder="Type name here..."
              className="mt-1 text-center border rounded-xl black text-black p-2 w-full"
            />
              <p className="text-red-600 text-sm">{errors.typed_guardian_name?.message}</p>

            <label className="text-sm text-gray-600"> Relationship to Child </label>
            <input
              {...register("relationship_to_child", { required: "Please input relationship" })}
              placeholder="Type relationship here..."
              className="mt-1 text-center border rounded-xl black text-black p-2 w-full"
            />
              <p className="text-red-600 text-sm">{errors.relationship_to_child?.message}</p>

            <Signature signatureRef={guardianSignature} />
          </div>

          <div className="relative bg-white border border-black rounded-lg p-6 pt-10 space-y-4">
            <h2 className="text-sm md:text-base text-white absolute -top-3 left-1/2 transform -translate-x-1/2  bg-[#5a9e3a] px-4 py-1 rounded-full">
              Authorized Staff </h2>
            <label className="text-sm text-gray-600"> Staff Name </label>
            <input
              {...register("typed_staff_name", { required: "Please type staff name" })}
              placeholder="Type name here..."
              className="mt-1 text-center border rounded-xl text-black p-2 w-full"
            />
              <p className="text-red-600 text-sm">{errors.typed_staff_name?.message}</p>
            <Signature signatureRef={staffSignature} />
          </div>

          <div className="flex flex-col items-center bg-white rounded-lg border rounded-xl border-black p-4 gap-4 mb-4">
            <p className="text-sm text-gray-600 text-center">
              Please review all information before submitting the waiver.
            </p>

            <button
              type="submit"
              className="bg-[#5a9e3a] text-white px-3 py-2 rounded-xl hover:opacity-60 hover:cursor-pointer"
            >
              Submit Waiver
            </button>
            <p className="text-xs text-gray-600 text-center italic">
              <strong> Note: </strong> This will mark the item as ready for pickup!
            </p>
          </div>
        </form> 
        }

        {isSigned &&
          <div className="flex flex-col overflow-auto space-y-8 max-h-[85vh] p-2 bg-white rounded-lg justify-center">
              <p className="text-md italic text-center"> The waiver has been signed. Click the button to view in a full tab for print/download. </p>
              <a
                href={pdfURL}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#5a9e3a] mx-auto w-1/2 text-white px-4 py-2 rounded-xl hover:opacity-80 text-center">
                  Open in new tab
              </a>
              <p className="text-center"> or </p>
              <Link href={`/equipment-gallery`} className="bg-[#5a9e3a] mx-auto w-1/2 text-white px-4 py-2 rounded-xl hover:opacity-80 text-center"> Back to gallery </Link>
          </div>
        }
      </div>
    </div>
    
  </>
  );
}