import ReservedEquipment from "@/components/dashboards/admin/reservations";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseAdmin } from "@/lib/supabase/admin";


interface Props {
  user: any;
  role: string;
  this_username: string;
  full_name: string;
}

export default async function TherapistPage({
  user,
  role,
  this_username,
  full_name,
}: Props) {

  const { data: items, error } = await supabaseAdmin
    .from("equipment")
    .select(`
      *,
      distribution:distributions (
        reserved_at,
        allocated_at,
        user_id,
        recipient (
          name,
          email,
          phone
        )
      )
    `);

  if (error) {
    console.error(error);
  }

  const reservedItems =
    items?.filter((item) =>
      item.distribution?.some(
        (dist: any) =>
          dist.user_id === user.id && dist.reserved_at
      )
    ) || [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">
      <div className="p-8 w-full">

        <h1 className="text-white text-2xl mb-6 text-center bg-[#5a9e3a] py-2 rounded font-mono">
          Therapist Dashboard
        </h1>

        <Tabs defaultValue="profile" className="w-full flex flex-col items-center mt-6">

          <TabsList className="flex justify-between items-center bg-white p-1 rounded-md shadow-sm w-[500px] max-w-full">
            <TabsTrigger value="profile" className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-[#f4f4f4]">
              Profile
            </TabsTrigger>

            <TabsTrigger value="reservations" className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-[#f4f4f4]">
              My Reserved Items
            </TabsTrigger>
          </TabsList>

          <div className="w-full mt-8">
            <TabsContent value="profile">
             <ProfileInfo
                user={user}
                role={role}
                username={this_username}
                full_name={full_name}
              />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservedEquipment reserved_items={reservedItems} />
            </TabsContent>
          </div>

        </Tabs>
      </div>
    </div>
  );
}