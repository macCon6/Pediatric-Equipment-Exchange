import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

async function uploadImage(fileName) {
  const filePath = path.join(
    process.cwd(),
    "seed-images",
    fileName
  );

  const fileBuffer = fs.readFileSync(filePath);

  const uploadName = `${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("equipment-images")
    .upload(uploadName, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Image upload failed:", uploadError.message);
    return null;
  }

  const { data } = supabase.storage
    .from("equipment-images")
    .getPublicUrl(uploadName);

  return data.publicUrl;
}

async function uploadWaiver(fileName) {
  const filePath = path.join(
    process.cwd(),
    "seed-waiver",
    fileName
  );

  const fileBuffer = fs.readFileSync(filePath);

  const uploadName = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from("waiver-templates")
    .upload(uploadName, fileBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Waiver upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("waiver-templates")
    .getPublicUrl(uploadName);

  return data.publicUrl;
}

async function bootstrap() {

  console.log("Running bootstrap..")

  // create admin user in auth table
  const { data: adminUser, error:adminError } = await supabase.auth.admin.createUser({
    email: 'admin@test.com',
    password: 'admin123',
    email_confirm: true
  })

  if (adminError) {
    console.error("auth seed error: ", adminError.message)
    return
  }

  const admin = adminUser.user
  console.log("Auth user created successfully: ", admin.email)

  // create admin profile entry
  const { error: adminProfileError } = await supabase
    .from('profiles')
    .insert({
      id: admin.id,
      email: admin.email,
      username: "admin_username",
      role: "admin",
      full_name: "Bootstrap Admin"
    })

  if (adminProfileError) {
    console.error("Profile seed error: ", adminProfileError.message)
  } else {
    console.log("Profile succesfully created with admin role")
  }

  
  // create therapist user in auth table
  const { data: therapistUser, error:therapistError } = await supabase.auth.admin.createUser({
    email: 'therapist@test.com',
    password: 'ther123',
    email_confirm: true
  })

  if (therapistError) {
    console.error("auth seed error: ", therapistError.message)
    return
  }

  const therapist = therapistUser.user
  console.log("Auth user created successfully: ", therapist.email)

  // create therapist profile entry
  const { error: therapistProfileError } = await supabase
    .from('profiles')
    .insert({
      id: therapist.id,
      email: therapist.email,
      username: "therapist_username",
      role: "therapist",
      full_name: "Bootstrap Therapist"
    })

  if (therapistProfileError) {
    console.error("Profile seed error: ",therapistProfileError.message)
  } else {
    console.log("Profile succesfully created with therapist role")
  }

  
  // create volunteer user in auth table
  const { data:volunteerUser, error:volunteerError } = await supabase.auth.admin.createUser({
    email: 'volunteer@test.com',
    password: 'vol123',
    email_confirm: true
  })

  if (volunteerError) {
    console.error("auth seed error: ", volunteerError.message)
    return
  }

  const volunteer = volunteerUser.user
  console.log("Auth user created successfully: ", volunteer.email)

  // create volunteer profile entry
  const { error: volunteerProfileError } = await supabase
    .from('profiles')
    .insert({
      id: volunteer.id,
      username: "volunteer_username",
      email: volunteer.email,
      role: "volunteer",
      full_name: "Bootstrap Volunteer"
    })

  if (volunteerProfileError) {
    console.error("Profile seed error: ", volunteerProfileError.message)
  } else {
    console.log("Profile succesfully created with volunteer role")
  }

  // create the teest equipkment rows
  console.log("Adding some test equipment, please wait!");

  const imageFiles = [
    "IMG_3562.JPG",
    "IMG_3561.JPG",
    "IMG_3560.JPG",
    "IMG_8036.JPG",
    "IMG_8031.JPG",
    "IMG_8879.JPG"
    
  ];

  const imageUrls =[];

  for (const file of imageFiles) {
    const url = await uploadImage(file);
    if (url) imageUrls.push(url);
  }

  const equipmentRows = [
  {
    name: "Leckey Mygo on Kimba Neo Base with Tray",
    status: "Available",
    condition: "Needs Cleaning",
    description: "Significantly dirty!! clean it soon",
    size: "Small",
    color: "Blue",
    donor: "Erlanger",
    image_urls: [imageUrls[0]],
    category: "Medical Stroller",
    location: "West Wing",
    barcode_value: "0001",
    subcategory: null,
    created_at: new Date().toISOString(),
  },
  {
    name: "Plastic adjustable childs chair",
    status: "Available",
    condition: "Broken/Missing Pieces",
    description: "Missing adjustment hardware",
    size: "10-14inch seat height",
    color: "Blue",
    donor: "Erlanger",
    image_urls:[imageUrls[1]],
    category: "Activity Chair",
    location: "East hall room 3 corner",
    barcode_value: "0002",
    subcategory: null,
    created_at: new Date().toISOString(),
  },
  {
    name: "Leckey Swiggles Stander with Tray",
    status: "Available",
    condition: "Excellent",
    size: "1",
    color: "Pink",
    image_urls:[imageUrls[2]],
    category: "Stander",
    location: "Main room shelf 4",
    barcode_value: "0003",
    subcategory: null,
    created_at: new Date().toISOString(),
  },
   {
    name: "Nimbo",
    status: "Available",
    condition: "Acceptable",
    size: "Small",
    color: "Purple",
    image_urls:[imageUrls[3]],
    category: "Walker",
    location: "Main room left corner",
    barcode_value: "0004",
    subcategory: "Posterior",
    created_at: new Date().toISOString(),
  },
  {
    name: "Zippie zone",
    status: "Available",
    condition: "Good",
    size: "12 inch",
    color: "Red",
    image_urls:[imageUrls[4]],
    category: "Wheelchair",
    location: "Room 3",
    barcode_value: "0005",
    subcategory: "Manual Rigid",
    created_at: new Date().toISOString(),
  },
  {
    name: "Zippie xcape",
    status: "Available",
    condition: "Good",
    size: "12 inch",
    color: "Green",
    image_urls:[imageUrls[5]],
    category: "Wheelchair",
    location: "Room 7",
    barcode_value: "0006",
    subcategory: "Manual Folding",
    created_at: new Date().toISOString(),
  },

  
];

  const { error: equipmentTableError } = await supabase
    .from("equipment")
    .insert(equipmentRows);
  
    if(equipmentTableError) {
      console.log("error inserting equipment into table: ", equipmentTableError);
    }

  console.log("Equipment uploads successful!");

  console.log("Uploading waiver template...");

  const waiverUrl = await uploadWaiver("waiver-template.pdf");

  if (!waiverUrl) {
    console.error("Waiver upload failed, skipping DB insert");
  } else {
    const { error:waiverError } = await supabase
      .from("waiver_templates")
      .insert({
        version: 1,
        is_active: true,
        template_url: waiverUrl,
        created_at: new Date().toISOString(),
      });

    if (waiverError) {
      console.error("Waiver DB insert error:", waiverError.message);
    } else {
      console.log("Waiver seeded successfully");
    }
  }

  console.log("Bootstrap completed successfully")
}

bootstrap()