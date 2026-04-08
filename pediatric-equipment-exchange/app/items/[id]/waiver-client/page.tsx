"use client";

import dynamic from "next/dynamic";

const WaiverDisplay = dynamic(
  () => import("@/components/display-waiver"),
  { ssr: false } // this lets react-pdf display properly, has to be run in a client page
);

interface Props {
  template_url: string,
  distribution_id: string,
  waiver_signed: boolean
}

// send down to the display component where we're actually using react-pdf
export default function WaiverClient({ template_url, distribution_id, waiver_signed}: Props) {
  return <WaiverDisplay template_url={template_url} distribution_id={distribution_id} waiver_signed={waiver_signed}  />;
}