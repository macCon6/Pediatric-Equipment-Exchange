"use client";

import Signature from "@/components/signature-box";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";

// required setup for react-pdf / pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  template_url: string,
  distribution_id: string,
  waiver_signed: boolean
}

export default function DisplayWaiver({ template_url, distribution_id, waiver_signed}: Props) {

  const [numPages, setNumPages] = useState(0); // to render a pdf with unknown # of pages in react-pdf

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

  return (
    <div className="flex flex-col min-h-screen bg-[#134e4a]">
      <div className="text-center py-4 px-4 md:px-8">
        <p className="text-white text-3xl italic font-serif">
          Please read the waiver below. If on mobile, scroll down to sign.
        </p>
      </div>

      {/* Grid setup, 2 columns on big screen, 1 stacked column on smaller */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 md:p-8">

        {/* Left column, PDF waiver */}
        <div
          ref={containerRef}
          className="bg-white rounded-lg overflow-auto max-h-[80vh] flex justify-center p-2"
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <Document
              file={template_url} // passed down from the waiver server page to the props here
              onLoadSuccess={({ numPages }) => setNumPages(numPages)} 
            >
              {Array.from(new Array(numPages), (_, i) => ( 
                <div
                  key={i}
                  className="bg-white p-2 w-full flex justify-center"
                >
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

        {/* Rigth columns, instructions at top and signature canvas below */}
        <div className="flex flex-col gap-4 md:h-[80vh]">
          <div className="bg-white rounded-lg p-4 flex flex-col gap-2 text-center">
            <p className="text-black italic font-serif"> Please draw your signature in the box below to add it to the waiver. </p>
            <p className="text-black italic font-serif"> A copy of your signed waiver will be saved for our documentation, and a copy will be sent to your email. </p>
          </div>
          
          {/* The signature component has the canvas for drawing and will handle sending it to the api route */}
          <div className="bg-white rounded-lg p-4 md:flex-1 flex flex-col md:justify-center">
            <Signature template_url={template_url} distribution_id={distribution_id} waiver_signed={waiver_signed}/>
          </div>
        </div>
      </div>
    </div>
  );
}