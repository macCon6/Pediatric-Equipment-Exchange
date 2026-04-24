// therapist page
import ProfileInfo from "@/components/dashboards/profile-info-box";

interface Props {
  user: any
  role: string,
  username:string, 
  full_name: string
}

export default function TherapistPage({user, role, username, full_name}: Props) {

    return (
        <ProfileInfo user={user} role={role} username={username} full_name={full_name} />
    );
}