# Pediatric-Equipment-Exchange
A cloud-based inventory system for managing donated pediatric adaptive equipment. This system allows physical therapists and volunteers to search equipment, track donations, allocate items to families, and manange inventory across organizations.

## Project Purpose 
This project supports the development of sustainable community reuse of adaptive equipment at no cost to recipients. The host organizations will be Erlanger Hospital and Siskin Hospital.
The goal is to help physical therapists and trained volunteers at these organizations locate used adapative equipment for children, as well as tracking donations, allocations, and equipment availability.

## Key Features
- Searchable equipment inventory
- Photo uploads of each item
- Equipment descriptions and detailed specifications
- Status tracking (available, allocated, processing, out of stock)
- QR Code scanning for quick look-up
- Equipment Reservation System for physical therapists
- Donation Intake workflow
- Multi-organization access for therapists and volunteers

## Tech Stack
Frontend:
- Next.js
- React

Backend:
- Supabase (PostgreSQL database)
- Supabase Authorization

Infrastructure:
- Github for version control

## Project Structure
This project contains:
/root
 	supabase/               ← backend (Docker)
 	pediatric-equipment-exchange/  ← frontend (Next.js)

The system consists of two parts: 
Frontend (Next.js): Located in pediatric-equipment-exchange/ 
Backend (Supabase via Docker): Managed from the root folder using Supabase CLI. They communicate via Supabase local API endpoints

You do not need to manually setup the Database, as the schema should be automatically generated from our supabase/migrations folder.
In case of emergency: reset the database with
npx supabase db reset

## Setup Instructions
INSTALLATION REQUIREMENTS: 

You will need Docker Desktop to create your own local Supabase database.
If you do not have it, please install: Docker Desktop https://www.docker.com/products/docker-desktop/ 
Ensure Docker is running before proceeding.

You will need to install Node.js
If you do not have it, please install at: https://nodejs.org/ 
After installing, verify:
node -v
npm -v 

QUICK SETUP GUIDE: 
Start with either: git clone https://github.com/TiredGhost8/Pediatric-Equipment-Exchange.git  OR extract the project from the .zip.
cd Pediatric-Equipment-Exchange (ROOT FOLDER)
npx supabase start (ROOT FOLDER)
Create a .env.local file under the inner /pediatric-equipment-exchange folder, and copy and paste the environment variables that show under “Authentication Keys”
Open a new terminal
cd pediatric-equipment-exchange
npm install
npm run bootstrap
npm run dev
Navigate to http://localhost:3000/ to see our website
Navigate to http://localhost:54323/ for optional viewing of our database schema using the Supabase UI

DETAILED PROJECT SETUP GUIDE:
*After ensuring that your Docker is open*

Clone the repository 
git clone https://github.com/TiredGhost8/Pediatric-Equipment-Exchange.git  
Or extract it from the .zip
cd Pediatric-Equipment-Exchange

Start Backend (Supabase): From the project root folder
npx supabase start 
This will install and load the Supabase CLI. This includes starting the PostgreSQL database, authentication service, storage and API services, as well as applying migrations and seed files.
This process may take a few minutes on the first run.

IMPORTANT: You must create a file named .env.local with the values of the keys that show on the terminal after npx supabase start
Right click the inner /pediatric-equipment-exchange folder and create new file
Name this file .env.local
Copy and paste:
NEXT_PUBLIC_SUPABASE_URL= http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= your_publishable_key 
SUPABASE_SECRET_KEY= your_secret_key 
See the .env.example file for how it should look.
After startup, Supabase services will be available locally. You may optionally navigate to the Supabase Dashboard to see the database UI at http://127.0.0.1:54323/ 

Start the Frontend Application (Nextjs): Navigate to the folder containing the App, install the dependencies, run the bootstrap that creates a user profile, and then run the local instance:
cd pediatric-equipment-exchange 
npm install 
npm run bootstrap 
npm run dev
Navigate in your browser to http://localhost:3000/
You should find yourself at our website’s landing page! Please give npm install adequate time to install all of the packages.
The bootstrap script automatically creates a new user that you can log in as. If you do not wish to view as a guest, please navigate to the login page and input the account with your desired role:

Email: admin@test.com
Password: admin123

Email: therapist@test.com
Password: ther123

Email: volunteer@test.com
Password: vol123

TESTING
The bootstrap script creates 6 new pieces of equipment for you to test with! Filter them in the gallery or click to open their details. Change their statuses and details, reserve items, sign waivers… Or navigate to the Add Item tab to add your own new entry. As an admin, the Dashboard tab is also interesting with a different view of Allocated, Reserved, and Distribution history of items.

When you are finished:
End the Supabase instance with
npx supabase stop


