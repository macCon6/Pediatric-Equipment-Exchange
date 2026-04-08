// server page for the waiver page
// because react-pdf (used to display the waiver) does not allow SSR, 
// have to fetch everything here and send it to a client page

import { createClient } from "@supabase/supabase-js";
import WaiverClient from "../waiver-client/page";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function WaiverPage( details: { params: any } ) {

  const { id } = await details.params; // unwrap the Promise

  const equipment_id = id; 

  // get the distribution data, need to send it down ultimatley to the e-signature canvas so 
  // that the api route can insert it into the proper distribution entry
  const { data:distribution, error: distributionError } = await supabase
    .from("distributions")
    .select("*")
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
            Distribution entry missing
          </p>
        </div>
      </div>
    );
  }

  // get the active waiver template from the waiver_templates table
  const { data, error:templateError } = await supabase
    .from("waiver_templates")
    .select("template_url")
    .eq("is_active", true)
    .single();

  // shows either if there is no active row in the waiver_templates or if the active row doesn't have a url
  if (!data?.template_url || templateError) {
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

  return <WaiverClient template_url={data.template_url} distribution_id={distribution.id} waiver_signed={distribution.waiver_signed}/>;
}