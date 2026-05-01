// to not force every page to be dynamically loaded, let the sidebar icon use this page to link
// to either the admin, therapist, or volunteer page component
// this also lets the url be /dashboard for each one instead of role specific

import { getUserAndRole } from "@/lib/data-access-layer"
import AdminPage from "@/components/dashboards/admin/admin-page";
import TherapistPage from "@/components/dashboards/therapist/therapist-page";
import VolunteerPage from "@/components/dashboards/volunteer/volunteer-page";
 
export default async function Dashboard({ searchParams }: any) {

  const { user, role, username, full_name} = await getUserAndRole();
 
  if (role === "admin") {
    return <AdminPage user={user} role={role} this_username={username} full_name={full_name}  searchParams={searchParams} />

  } else if (role === "therapist") {
    return <TherapistPage user={user} role={role} username={username} full_name={full_name} />

  } else if (role === "volunteer"){
    return <VolunteerPage user={user} role={role} username={username} full_name={full_name} />
  }
  else {
     return null;
  }
}