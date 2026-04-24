import AllocatedEquipment from "@/components/dashboards/admin/allocated-equipment";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import EditUsers from "./edit-users";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


interface Props {
  user: any
  role: string,
  this_username:string, 
  full_name: string, 
}

export default async function AdminPage({ user, role, this_username, full_name }: Props) {


  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">

      <div className="p-8 mb-10 w-full h-full">
        <h1 className="text-white text-2xl mb-8 text-center bg-[#5a9e3a] font-mono">
          Admin Page
        </h1>

      {/* Tabs for each of our sections, that way we only fetch from the tables if they click on the relevant  */}

      <Tabs defaultValue="profile" className="">
        <div className="relative overflow-y-hidden sm:overflow-x-scroll md:overflow-auto h-10 md:scrollbar-hide">
        <TabsList className="absolute flex flex-row sm:justify-stretch  sm:w-full md:w-1/2 " >
          <TabsTrigger value="profile"> Profile </TabsTrigger>
          <TabsTrigger value="users"> Users </TabsTrigger>
          <TabsTrigger value="allocations"> Allocations </TabsTrigger>
          <TabsTrigger value="reservations"> Reservations </TabsTrigger>
          <TabsTrigger value="history"> History </TabsTrigger>
          <TabsTrigger value="waiver"> Waiver </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="profile"> 
          <ProfileInfo user={user} role={role} username={this_username} full_name={full_name} /> 
        </TabsContent>

        <TabsContent value="users"> <EditUsers /> </TabsContent>
        <TabsContent value="allocations"> <AllocatedEquipment items={[]} /> </TabsContent>
        <TabsContent value="reservations"> component to show active reservatons, reserveed by & who for </TabsContent>
        <TabsContent value="history"> component to show distribution history (completed returns, cancellations, filter by clinic, etc) </TabsContent>
        <TabsContent value="waiver">  working on it  </TabsContent>

      </Tabs>
        
        </div>
        
    </div>
  );
}