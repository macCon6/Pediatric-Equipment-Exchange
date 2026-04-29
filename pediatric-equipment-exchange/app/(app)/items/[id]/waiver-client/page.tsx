
"use client";

import dynamic from "next/dynamic";

const DisplayAndSignWaiver = dynamic(
  () => import("@/components/waiver-utilities/display-and-sign-waiver"),
  { ssr: false } // this lets react-pdf display properly, has to be run in a client page
);

interface Props {
  template_id: string,
  displayed_waiver_url: string,
  is_signed: boolean,
  distribution_id: string,
  equipment: any,
}

// send down to the display component where we're actually using react-pdf
export default function WaiverClient({ template_id, displayed_waiver_url, is_signed, distribution_id, equipment}: Props) {
  return <DisplayAndSignWaiver 
            template_id={template_id} 
            displayed_waiver_url={displayed_waiver_url} 
            is_signed={is_signed} 
            distribution_id={distribution_id} 
            equipment={equipment} 
          />;
}