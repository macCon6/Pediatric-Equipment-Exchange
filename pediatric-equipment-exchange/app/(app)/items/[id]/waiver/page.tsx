// server page for the waiver page
// because react-pdf (used to display the waiver) does not allow SSR, 
// have to fetch everything here and send it to a client page

import { createClient } from "@/lib/supabase/server";
import WaiverClient from "../waiver-client/page";

export default async function WaiverPage( details: { params: any } ) {
  
  const supabase = await createClient();

  const { id } = await details.params; // unwrap the Promise

  const equipment_id = id; 

  // get the distribution data, need to send it down ultimatley to the display/sign waiver component so 
  // that the api route can insert it into the proper distribution entry
  const { data:distribution, error: distributionError } = await supabase
    .from("distributions")
    .select(`
      id,
      signed_waiver_url,
      equipment:equipment_id (id, name, barcode_value)`) // Join the equipment info so don't have to refetch in waiver component
    .eq("equipment_id", equipment_id)
    .is("returned_at", null) // get the active distribition. should return only 1 row if everything is done right
    .single();

    console.log(distribution);
    console.log(distributionError);
    
  
  if (!distribution || distributionError) {
    return (
      <div className="flex flex-1 bg-teal-700 h-screen justify-center items-center">
        <div className="flex bg-white w-1/2 h-1/2 items-center justify-center">
          <p className="text-6xl text-red-400 text-center font-mono">
            Distribution entry error or missing
          </p>
        </div>
      </div>
    );
  }

   const { data:templateWaiver, error: templateError } = await supabase
    .from("waiver_templates")
    .select("id, template_url")
    .eq("is_active", true)
    .single();

  if (!templateWaiver || templateError) {
    return (
      <div className="flex flex-1 bg-teal-700 h-screen justify-center items-center">
        <div className="flex bg-white w-1/2 h-1/2 items-center justify-center">
          <p className="text-6xl text-red-400 text-center font-mono">
            Missing waiver template
          </p>
        </div>
      </div>
    );
  }

  return (
    <WaiverClient
      template_id={templateWaiver.id}
      displayed_waiver_url={distribution.signed_waiver_url ?? templateWaiver.template_url}
      distribution_id={distribution.id} 
      equipment={distribution.equipment} 
    />
  );
}