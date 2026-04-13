// insert a signature onto the waiver template
// upload the signed waiver to supabase bucket
// put the signed waiver into the distributions table for this distribution
// update waiver_signed, signed_at, allocated_at, conditon_at_allocation in distributions table

// ALSO UPDATES THE EQUIPMENT STATUS TO ALLOCATED ONCE SUCCESSFUL

import { createClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {

  const supabase = await createClient();

  const {distribution_id, template_url, signature_data_url} = await req.json();

  let upload_successful = false;
  let distribution_updated = false;

  try {
    // first make sure waiver hasn't been signed yet
    const { data: distribution, error: signedError } = await supabase
      .from("distributions")
      .select("waiver_signed, equipment_id")
      .eq("id", distribution_id)
      .single();

    if (signedError) throw signedError;
    if (distribution.waiver_signed) {
       return new Response(JSON.stringify( {success: false, 
        error: "A signed waiver associated with this distribution has already been submitted"}), { status: 400 });
    }

    // then grab the current condition so we can update the condition_at_allocation later
    const { data: equipment, error:equipmentError } = await supabase
      .from("equipment")
      .select("condition")
      .eq("id", distribution.equipment_id)
      .single();
    if(equipmentError) throw equipmentError;

    // open the waiver template then edit with pdf-lib, requires you to get the bytes for everything
    const existingPdfBytes = await fetch(template_url).then(res => res.arrayBuffer())
    const waiver = await PDFDocument.load(existingPdfBytes); // will modify this w/ signature

    // singature bytes
    const signatureBytes = await fetch(signature_data_url).then(res => res.arrayBuffer());

    // check in the table what page the signature should be on + its position
    const { data: signaturePos, error: sigPageError } = await supabase
      .from("waiver_templates")
      .select("signature_page, signature_x_pos, signature_y_pos")
      .eq("is_active", true)
      .single();
  
    if (sigPageError) throw sigPageError;
    if(!signaturePos) {
      throw new Error("Signature position information couldn't be found");
    }
  
    // put signature image at proper page and position (subtract by 1 for page since pdf-lib is 0 indexed)
    const assignedSignPage = signaturePos.signature_page - 1;
    if (assignedSignPage < 0 || assignedSignPage >= waiver.getPageCount()) { // protect against accidental wrong sign page entries
      throw new Error(`Invalid signature page: ${signaturePos.signature_page}`);
    }

    const signPage = waiver.getPage(assignedSignPage);
    const pngImage = await waiver.embedPng(signatureBytes);

    signPage.drawImage(pngImage, {
      x: signaturePos.signature_x_pos, // these will be udpated  by admins but haven't made the route for that yet
      y: signaturePos.signature_y_pos,
      width: 300,
      height: 100
    });

    const signedWaiverBytes = await waiver.save();

    // upload the signed waiver into the proper supabase bucket
    const { error: uploadError } = await supabase.storage
      .from("waivers")
      .upload(`signed_waivers/waiver_${distribution_id}.pdf`, 
        signedWaiverBytes, 
        {contentType: "application/pdf" });

    if (uploadError) { throw new Error("Error uploading the signed waiver"); }
    upload_successful = true;

    // update the distribution table
    const { error: distributionUpdateError } = await supabase
      .from("distributions")
      .update({ 
        waiver_signed: true, 
        waiver_url: `signed_waivers/waiver_${distribution_id}.pdf`,
        signed_at: new Date().toISOString(),
        allocated_at: new Date().toISOString(), // assuming that people immediately pick up the item after signature
        condition_at_allocation: equipment.condition
      })
      .eq("id", distribution_id);

    if (distributionUpdateError) {
      throw new Error("Error updating the distribution entry");
    } 
    distribution_updated = true;

    // update the equipment status to Allocated. Runs only when the above are succesful
    const { error: statusUpdateError } = await supabase
      .from("equipment")
      .update({ status: "Allocated" })
      .eq("id", distribution.equipment_id);

    if (statusUpdateError) {
      throw new Error("Error updating the equipment status");
    } 

    return new Response( JSON.stringify({ success: true, message: "Signed waiver submitted successfully!" }), { status: 200 });

  } catch(error: any) {
      
      // rollback the signed upload if it worked
      if(upload_successful) { await supabase.storage
        .from("waivers")
        .remove([`signed_waivers/waiver_${distribution_id}.pdf`]);
      }

      // rollback changes in distribution table if there were any
      if(distribution_updated) { await supabase
        .from("distributions")
        .update({ 
          waiver_signed: false, 
          waiver_url: null,
          signed_at: null,
          allocated_at: null,
          condition_at_allocation: null
        })
        .eq("id", distribution_id);
        
      }
    return new Response(JSON.stringify({success: false, error: error.message }), {status: 500});
  }
}