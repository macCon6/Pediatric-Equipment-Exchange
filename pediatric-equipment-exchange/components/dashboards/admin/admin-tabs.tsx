"use client";

// moved Shadcn tabs in here & now controlling tabs with client
// using useRouter, needs Client

import { useRouter, usePathname } from "next/navigation";
import AllocatedEquipment from "@/components/dashboards/admin/allocated-equipment";
import ReservedEquipment from "@/components/dashboards/admin/reservations";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import EditUsers from "@/components/dashboards/admin/edit-users";
import DistributionHistory from "@/components/dashboards/admin/distribution-history";
import UpdateWaiver from "@/components/dashboards/admin/update-waiver";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ReadableDistribution } from "@/field_interfaces";

interface Props {
  user: any,
  role: string,
  this_username: string,
  full_name: string,
  allocated_items: ReadableDistribution[],
  reserved_items: ReadableDistribution[],
  all_distributions: ReadableDistribution[],
  active_tab:any
}

export default function AdminTabs({ user, role, this_username, full_name, allocated_items, reserved_items, all_distributions, active_tab}: Props ) {
    
    
    const router = useRouter();
    const pathname = usePathname();

    const changeTab = (value: string) => {
       router.push(`${pathname}?tab=${value}`);
    };

    
    return (

        <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">
            <div className="p-8 w-full">

                <Tabs  defaultValue={active_tab} onValueChange={changeTab} className="w-full flex flex-col items-center">

                    {/* Rectangular tab bar --- updated to make tabs scrollable on mobile*/}
                    <TabsList className="flex justify-between items-center bg-[#E8D3A3] p-1 rounded-md shadow-sm w-[700px] max-w-full overflow-x-scroll scrollbar-hide">

                        <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="profile">
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
                            <AllocatedEquipment allocated_items={allocated_items}/>
                        </TabsContent>

                        <TabsContent value="reservations">
                            <ReservedEquipment reserved_items={reserved_items} />
                        </TabsContent>

                        <TabsContent value="history">
                            <DistributionHistory all_distributions={all_distributions} />
                        </TabsContent>

                        <TabsContent value="waiver">
                            Update waiver
                        </TabsContent>
                    </div>

                </Tabs>
            </div>
        </div>
    );
}