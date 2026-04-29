import AllocatedEquipment from "@/components/dashboards/admin/allocated-equipment";
import ReservedEquipment from "@/components/dashboards/admin/reservations";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import EditUsers from "./edit-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Props {
  user: any;
  role: string;
  this_username: string;
  full_name: string;
}

export default async function AdminPage({
  user,
  role,
  this_username,
  full_name,
}: Props) {

  // FETCH DATA
  const { data: items, error } = await supabaseAdmin
    .from("equipment")
    .select(`
      *,
      distribution:distributions (
        reserved_at,
        allocated_at,
        recipient (
          name,
          email,
          phone,
          contact_name,
          authorized_for_pickup
        )
      )
    `);

  if (error) {
    console.error("Error fetching equipment:", error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">

      <div className="p-8 w-full">

        {/* HEADER */}
        <h1 className="text-white text-2xl mb-6 text-center bg-[#5a9e3a] py-2 rounded font-mono">
          Admin Page
        </h1>

        <Tabs defaultValue="profile" className="w-full flex flex-col items-center mt-6">

  {/* Rectangular tab bar */}
  <TabsList
    className="
      flex
      justify-between
      items-center
      bg-[#E8D3A3]
      p-1
      rounded-md   
      shadow-sm
      w-[700px]
      max-w-full
    "
  >
    <TabsTrigger
      className="
        flex-1
        text-center
        py-2
        rounded-sm
        data-[state=active]:bg-white
        data-[state=active]:shadow
      "
      value="profile"
    >
      Profile
    </TabsTrigger>

    <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="users">
      Users
    </TabsTrigger>

    <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="allocations">
      Allocations
    </TabsTrigger>

    <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="reservations">
      Reservations
    </TabsTrigger>

    <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="history">
      History
    </TabsTrigger>

    <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="waiver">
      Waiver
    </TabsTrigger>
  </TabsList>

  {/* Content */}
  <div className="w-full mt-8">
    <TabsContent value="profile">
      <ProfileInfo user={user} role={role} username={this_username} full_name={full_name} />
    </TabsContent>

    <TabsContent value="users">
      <EditUsers />
    </TabsContent>

    <TabsContent value="allocations">
      <AllocatedEquipment items={items || []} />
    </TabsContent>

    <TabsContent value="reservations">
      <ReservedEquipment items={items || []} />
    </TabsContent>

    <TabsContent value="history">
      History coming soon
    </TabsContent>

    <TabsContent value="waiver">
      Working on it
    </TabsContent>
  </div>

</Tabs>

        
      </div>
    </div>
  );
}