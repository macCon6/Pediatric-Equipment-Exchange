import ReservedEquipment from "@/components/dashboards/admin/reservations";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";


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

  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("readable_distribution")
      .select("id, equipment_id, equipment_name, recipient_name, contact_name, clinic_name, reserved_by, reserved_by_name, reserved_at, signed_waiver_url")
      .not("reserved_at", "is", null)
      .is("allocated_at", null)
      .is("returned_at", null)
      .is("cancelled_at", null);

  if (error) {
    console.error(error);
  }

  const reservedItems =
    items?.filter((item) =>
      item.reserved_by === user.sub 
    ) || [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">
      <div className="p-8 w-full">

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