
"use client";

// reusable pdf viewer so dont have to redefine in the update waiver & display waiver pages

import { Document, Page, pdfjs } from "react-pdf";

// required setup for react-pdf / pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ pdfURL, numPages, setNumPages, containerWidth }: any) {

    return (
        <>
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
    </>
    )
}