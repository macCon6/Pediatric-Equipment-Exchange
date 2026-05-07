// volunteer page

import ProfileInfo from "@/components/dashboards/profile-info-box";

interface Props {
  user: any
  role: string,
  username:string, 
  full_name: string
  email: string
}

export default function VolunteerPage({user, role, username, full_name, email}: Props) {

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">
            <div className="p-8 w-9/10 bg-amber-50 mt-6 rounded-3xl mx-auto">
                <ProfileInfo user={user} role={role} username={username} full_name={full_name} email={email} />
            </div>   
        </div>
    );
}