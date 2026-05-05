// for them to change the active waiver template
"use client";

import { useState, useEffect, useRef } from "react";
import { WaiverTemplateFields } from "@/field_interfaces";
import Toast from "@/components/popups/toast";
import dynamic from "next/dynamic"; // for react pdf tp set ssr false
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

interface Props {
  waiver_templates: WaiverTemplateFields[] | null
}

const PDFViewer = dynamic(() => import("@/components/pdf_viewer"), {
  ssr: false,
});

export default function UpdateWaiver({waiver_templates}: Props) {
  
  const [numPages, setNumPages] = useState(0); // to render a pdf with unknown # of pages in react-pdf
  const [pdfURL, setPDFURL] = useState("");

  // this is to make the pdf container responsive to changes in page resize,ie. to display properly on mobile
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null); // this gets set below in the div that holds the pdf

  const[selectedFile, setSelectedFile] = useState<{file: File | null, name: string | null}>({file: null, name: null});
  
  const[uploading, setUploading] = useState(false);

  const[previewOpen, setPreviewOpen] = useState(false);

  const[mode, setMode] = useState<"choose" | "viewPast" | "viewActive" | "update">("choose");
  const[toastType, setToastType] = useState<"success" | "error">("error");
  const[toastMessage, setToastMessage] = useState("");

  const router = useRouter();

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
 
  const handleChoosePDF = (chosen_url: string) => {
    setPDFURL(chosen_url);
    setPreviewOpen(true);
  }


// upload on client only and show preview with local URL
  const handleClientUpload = (e: any) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const url = URL.createObjectURL(selected);
    setPDFURL(url);
    setSelectedFile({file: selected, name:selected.name});
  };

  const handleBack = () => {
    setMode("choose");
    setPreviewOpen(false);
    setSelectedFile({file: null, name: null});
    setPDFURL("");
    setToastMessage("");
  }

  const updateActiveWaiver = async () => {

    if (!selectedFile.file) return;

    const filePath = `${selectedFile.name}_${Date.now()}.pdf`

    try {
      setUploading(true);
      
      // upload the waiver into the proper supabase bucket
      const { error: uploadError } = await supabase.storage
        .from("waiver-templates")
        .upload(filePath, selectedFile.file, {
        contentType: "application/pdf",
      });

      if (uploadError) { throw new Error(uploadError.message || "Upload failed"); }

      // get the url to send to the api route to fill the column in the waiver_templates table
      const publicUrl = supabase.storage
        .from("waiver-templates")
        .getPublicUrl(filePath).data.publicUrl;
      
      const res = await fetch("/api/update-active-waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_url: publicUrl
        })
      });

      const result = await res.json();
      if (!res.ok) { throw new Error(result.error || "Upload failed"); }
      setToastType("success");
      setToastMessage(result.message);

    } catch(error: any) {
      setToastType("error");
      setToastMessage(error.message || "Unknown error");
    }finally {
      setUploading(false);
      setSelectedFile({file: null, name: null});
      router.refresh();
    }
  }   

  if(waiver_templates === null) {
    return (
      <div className="flex justify-center items-center h-40 bg-white rounded-xl border">
        <p className="text-gray-500 text-base lg:text-lg animate-bounce"> Just a minute... </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 bg-white border rounded-3xl p-6">

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />}

      {mode === "choose" && <> 
        <h1 className="text-2xl mb-6 font-bold text-center"> Waiver Station </h1>

        <button className="text-lg border border-green-600 bg-green-100 hover:bg-gray-300 hover:cursor-pointer p-3 rounded-2xl" onClick={() => setMode("viewPast")}> View Past Waivers </button>

        <button className="text-lg border border-green-600 bg-green-50 hover:bg-gray-300 hover:cursor-pointer p-3 rounded-2xl" onClick={() => setMode("viewActive")}> View Active Waiver </button>

        <button className="text-lg border border-green-600 bg-green-100 hover:bg-gray-300 hover:cursor-pointer p-3 rounded-2xl mb-6" onClick={() => setMode("update")}> Update Active Waiver </button>
        </>
      }

      {mode === "viewPast" && <>

        <h1 className="text-2xl font-bold text-center">
            Past Waivers
        </h1>
       

        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#5a9e3a] text-white text-xs md:text-sm tracking-wide">
              <tr>
                <th className="text-left py-4 px-2"> Version </th>
                <th className="text-left py-4 px-2"> Active? </th>
                <th className="text-left py-4 px-2"> Created At </th>
                <th className="text-left py-4 px-2"> View </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
            
              {waiver_templates.map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-amber-100 even:bg-green-100 odd:bg-green-50"
                >
                  <td className="p-4 text-gray-900">
                    {entry.version}
                  </td>

                  <td className="p-4 text-gray-900">
                    {entry.is_active? "Yes" : "No"}
                  </td>

                  <td className="p-4 text-gray-900">
                    { new Date(entry.created_at).toLocaleString() }
                  </td>

                  <td className="p-4">
                    <button
                      className="border bg-gray-300 px-4 py-2 rounded-3xl hover:cursor-pointer"
                      onClick={() => {handleChoosePDF(entry.template_url)}}
                    >
                      View
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center"> 
         <button className="bg-[#5a9e3a] p-2 px-6 hover:cursor-pointer hover:opacity-50 mt-4 text-white rounded-2xl text-lg max-w-xs"
            onClick={handleBack}>
            Go Back
            </button>
        </div>
      </>
      }

      {mode === "viewActive" && <>
        <h1 className="text-2xl font-bold text-center"> Active Waiver </h1>
      
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#5a9e3a] text-white text-xs md:text-sm tracking-wide">
              <tr>
                <th className="text-left py-4 px-2"> Version </th>
                <th className="text-left py-4 px-2"> Active? </th>
                <th className="text-left py-4 px-2"> Created At </th>
                <th className="text-left py-4 px-2"> View </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
            
              {waiver_templates.filter((entry) => entry.is_active === true).map((entry) => (    
                <tr
                  key={entry.id}
                  className="hover:bg-amber-100 even:bg-green-100 odd:bg-green-50">
                    
                  <td className="p-4 text-gray-900">
                    {entry.version}
                  </td>

                  <td className="p-4 text-gray-900">
                    {entry.is_active? "Yes" : "No"}
                  </td>

                  <td className="p-4 text-gray-900">
                    { new Date(entry.created_at).toLocaleString() }
                  </td>

                  <td className="p-4">
                    <button
                      className="border bg-gray-300 px-4 py-2 rounded-3xl hover:cursor-pointer"
                      onClick={() => {handleChoosePDF(entry.template_url)}}
                    >
                      View
                    </button>
                  </td>  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center"> 
          <button className="bg-[#5a9e3a] p-2 px-6 hover:cursor-pointer hover:opacity-50 mt-4 text-white rounded-2xl text-lg max-w-xs"
             onClick={handleBack}>
              Go Back
            </button>
        </div>
      </>
      }


      {mode=== "update" && <> 
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#132540] mb-1"> Update active waiver</h2>
          <p className="text-sm text-gray-500 mb-4"> Please upload a new PDF </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleClientUpload}
            id="fileUpload"
            className="hidden"
          />
      
          {!selectedFile.file? (
            <label
              htmlFor="fileUpload"
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#5a9e3a] rounded-xl py-4 cursor-pointer hover:bg-green-50 transition-colors text-[#5a9e3a] font-semibold"
            >
              + Upload PDF
            </label>
          ) : (
            <div className="w-full flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 min-w-0">
              <span className="text-sm text-green-800 font-medium truncate"> {selectedFile.name} </span>

              <label
                htmlFor="fileUpload"
                className="text-sm text-[#5a9e3a] font-semibold cursor-pointer hover:underline"
              >
                Replace
              </label>
            </div>
          )}

        </div>
        
        {selectedFile.file && 
          <button className="text-md hover:cursor-pointer border bg-gray-300 underline px-4 py-2 rounded-3xl w-1/2 md:w-1/4"
            onClick={() => setPreviewOpen(true)}
          >
            Show Preview
          </button>
        }

        <button
          onClick= {async () => {
                await updateActiveWaiver();
          }}
          disabled={uploading}
          className={`mt-2 rounded-xl py-3 text-lg bg-[#5a9e3a] text-white
          ${uploading? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}>
          {uploading ? "Uploading new waiver..." : "Submit waiver"}
        </button>

        <div className="flex justify-center"> 
          <button className="bg-[#5a9e3a] p-2 px-6 hover:cursor-pointer hover:opacity-50 mt-4 text-white rounded-2xl text-lg max-w-xs"
             onClick={handleBack}>
              Go Back
          </button>
        </div>
        </>
      }

      {previewOpen && pdfURL && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
    
            <div className="w-full h-full sm:h-[90vh] sm:max-w-3xl bg-white sm:rounded-2xl flex flex-col">
      
              <div className="flex items-center justify-between px-3 py-2 bg-[#5a9e3a] text-white">

                <button className="bg-white/20 px-3 py-1 rounded-lg text-lg hover:cursor-pointer"
                  onClick={() => setPreviewOpen(false)}>
                      Close
                </button>

                <a
                  href={pdfURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 px-3 py-1 rounded-lg text-lg"
                >
                  Open in new tab
                </a>

              </div>

              <div className="flex-1 overflow-auto p-2 sm:p-4">
                <div
                  ref={containerRef}
                  className="w-full bg-white rounded-xl">

                    <PDFViewer
                      pdfURL={pdfURL}
                      numPages={numPages}
                      setNumPages={setNumPages}
                      containerWidth={containerWidth}
                    />
                </div>
              </div>
            </div>
          </div>
        )}
  
    </div>
  );
}
