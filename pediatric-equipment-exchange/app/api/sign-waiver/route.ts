// create a pdf with the signatures and names
// upload the signed waiver to supabase signed-waivers bucket
// send to the update_status Supabase function to update relevant tables 

import { createClient } from "@/lib/supabase/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { NextResponse } from "next/server";
import { getUserAndRole } from "@/lib/data-access-layer";

// use this layout to adjust where to put all the fields

const layout = { 
  equipment: { x: 48, y: 745, label: "Equipment Name: " },
  barcode: { x: 48, y: 705, label: "Barcode: " },
  date: { x: 48, y: 665, label: "Date: " },

  recipientName: { x: 48, y: 595, label: "Child / Recipient Name: " },
  guardianName: { x: 48, y: 555, label: "Legal Guardian Name: " },
  relationshipToChild: { x: 48, y: 515, label: "Relationship to Child: " },

  guardianSignature: { x: 48, y: 420,  width: 180, height: 60, label: "[Legal Guardian Signature]"},

  staffName: { x: 48, y: 330, label: "Recommending Therapist Name: " },

  staffSignature: { x: 48, y: 235, width: 180, height: 60, label: "[Recommending Therapist Signature]"}
};

// helper functions to work with pdf lib

// to draw signatures (they are images)
async function drawSignatureField( waiver: PDFDocument, page: any, label: string, imageBytes: ArrayBuffer,
  layout: { x: number; y: number; width: number; height: number }, boldFont: any
) {

  const image = await waiver.embedPng(imageBytes); // necessary for reactpdf to embed the png bytes first
  // label below signature
  page.drawText(label, {
    x: layout.x,
    y: layout.y - 16,
    size: 12,
    font: boldFont
  });

  page.drawImage(image, { // signature image
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
  });
}

// to draw text fields
async function drawTextField(page: any, label: string, value: string, layout: { x: number; y: number }, font: any, boldFont: any) {
   // for the label
  page.drawText(label, {
    x: layout.x,
    y: layout.y,
    size: 12,
    font: boldFont
  });

  // for the actual data value, offset it to the right a bit
  page.drawText(value ?? "", {
    x: layout.x + 200,
    y: layout.y,
    size: 12,
    font
  });
}


export async function POST(req: Request) {

  const supabase = await createClient();
  const {user, role} = await getUserAndRole();
  
  if (!user) { 
      return NextResponse.json({ error: "Unauthorized"},
        {status: 401 });
  }

  if (role !== "admin" && role !== "therapist") {
      return NextResponse.json({ error: "Forbidden: Admin or Therapist only" },
        { status: 403 });
  }

  const { distribution_id, template_id, typed_recipient_name, typed_guardian_name, relationship_to_child, guardian_signature,
          typed_staff_name, staff_signature, equipment_id, equipment_name, barcode_value } = await req.json();

  try {

    // fetch the template 
    const { data: template, error: templateError } = await supabase
      .from("waiver_templates")
      .select("template_url")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      throw new Error("Invalid or missing waiver template");
    }

    const template_url = template.template_url;

    // open the waiver template then edit with pdf-lib, requires you to get the bytes for everything
    const existingPdfBytes = await fetch(template_url).then(res => res.arrayBuffer())
    const waiver = await PDFDocument.load(existingPdfBytes); // will modify this w/ signature

    const guardianSignatureBytes = await fetch(guardian_signature).then(res => res.arrayBuffer());
    const staffSignatureBytes = await fetch(staff_signature).then(res => res.arrayBuffer());

    const page = waiver.addPage(); // just append a new page onto the end of the waiver

    const font = await waiver.embedFont(StandardFonts.Helvetica);
    const boldFont = await waiver.embedFont(StandardFonts.HelveticaBold);

    // spam of drawing all the necessary fields
    await drawTextField(page, layout.equipment.label, equipment_name, layout.equipment, font, boldFont);
    await drawTextField(page, layout.barcode.label, barcode_value, layout.barcode, font, boldFont);
    await drawTextField(page, layout.date.label, new Date().toLocaleDateString(), layout.date, font, boldFont);

    await drawTextField(page, layout.recipientName.label, typed_recipient_name, layout.recipientName, font, boldFont);
    await drawTextField(page, layout.guardianName.label, typed_guardian_name, layout.guardianName, font, boldFont);
    await drawTextField(page, layout.relationshipToChild.label, relationship_to_child, layout.relationshipToChild, font, boldFont);
    await drawSignatureField(waiver, page, layout.guardianSignature.label, guardianSignatureBytes, layout.guardianSignature, boldFont);

    await drawTextField(page, layout.staffName.label, typed_staff_name, layout.staffName, font, boldFont);
    await drawSignatureField(waiver, page, layout.staffSignature.label, staffSignatureBytes, layout.staffSignature, boldFont);

    const signedWaiverBytes = await waiver.save(); // save the waver

    const filePath = `waiver_${distribution_id}_${Date.now()}.pdf`

    // upload the signed waiver into the proper supabase bucket
    const { error: uploadError } = await supabase.storage
      .from("signed-waivers")
      .upload(filePath, 
        signedWaiverBytes, 
        { contentType: "application/pdf" });

    if (uploadError) { throw new Error(uploadError.message || "Error uploading the signed waiver"); }

    // get the uploaded URL to send to the update_status function
    // the update status function handles adding all the required fields in teh signed_waivers table
    const { data: waiverURL } = supabase.storage // get supabase url
      .from("signed-waivers")
      .getPublicUrl(filePath);
    
    const { error: transitionError } = await supabase.rpc("update_status", {
      p_distribution_id: distribution_id,
      p_equipment_id: equipment_id,
      p_target_status: "Reserved - Ready for Pickup",
      p_reservation_data: null,
      p_cancellation_reason: null,
      p_waiver_template_id: template_id,
      p_signed_waiver_url: waiverURL.publicUrl
    });

    if (transitionError) { 

      console.error("Status transition failed:", transitionError);

      switch(transitionError.code) {

        case "P0001": // 400 bad request error
          return NextResponse.json({ error: transitionError.message }, { status: 400 }); 

        case "P0002": // 404 not found error
          return NextResponse.json({ error: transitionError.message }, { status: 404 });
      
        case "42501": // 403 permission denied error
          return NextResponse.json({ error: transitionError.message }, { status: 403 });

        default: // server error
          return NextResponse.json({ error: transitionError.message }, { status: 500 })
        
      }
    }

    return NextResponse.json({ message: "Signed waiver submitted successfully!", waiver_url: waiverURL.publicUrl }, { status: 200 });

  } catch(error: any) {  

    console.error("Error signing waiver: ", error); 
    return NextResponse.json({error: error.message }, {status: 500});

  }
} 