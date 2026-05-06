"use client";

// moved Shadcn tabs in here & now controlling tabs with client
// using useRouter, needs Client

import { useRouter, usePathname } from "next/navigation";
import AllocatedEquipment from "@/components/dashboards/admin/allocated-equipment";
import ReservedEquipment from "@/components/dashboards/admin/reservations";
import ProfileInfo from "@/components/dashboards/profile-info-box";
import EditUsers from "@/components/dashboards/admin/edit-users";
import DistributionHistory from "@/components/dashboards/admin/distribution-history";
import RecoverEquipment from "@/components/dashboards/admin/recover-equipment";
import UpdateWaiver from "@/components/dashboards/admin/update-waiver";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ClinicFields, ReadableDistribution, RecoverableItem, WaiverTemplateFields } from "@/field_interfaces";
import { HistoryData } from "@/components/dashboards/admin/admin-page";

interface Props {
  user: any,
  role: string,
  this_username: string,
  full_name: string,
  allocated_items: ReadableDistribution[] | null,
  reserved_items: ReadableDistribution[] | null,
  history_data: HistoryData | null,
  clinics: ClinicFields[] | null,
  waiver_templates: WaiverTemplateFields[] | null,
  deleted_items: RecoverableItem[] | null,
  active_tab:any
}

export default function AdminTabs({ user, role, this_username, full_name, allocated_items, reserved_items, history_data, clinics, waiver_templates, deleted_items, active_tab}: Props ) {
    
    
    const router = useRouter();
    const pathname = usePathname();

    const changeTab = (value: string) => {
       router.push(`${pathname}?tab=${value}`);
    };

    
    return (

        <div className="flex flex-col min-h-screen w-full bg-[#FFC94A]">
            <div className="p-6 mb-6 w-9/10 bg-amber-50 mt-6 rounded-3xl mx-auto">

                <Tabs defaultValue={active_tab} onValueChange={changeTab} className="w-full flex flex-col items-center">

                    {/* Rectangular tab bar --- updated to make tabs scrollable on mobile*/}
                    <TabsList className="flex justify-between items-center bg-[#D8EBDB] p-1 rounded-md shadow-sm w-[700px] max-w-full overflow-x-scroll scrollbar-hide">

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

                        <TabsTrigger className="flex-1 text-center py-2 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow" value="recovery">
                            Recovery
                        </TabsTrigger>

                    </TabsList>

                    {/* Content */}
                    <div className="w-full mt-3">

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
                            <DistributionHistory all_distributions={history_data?.all_distributions ?? null}
                                                 clinics = {clinics}
                                                 page={history_data?.page ?? 1}
                                                 pageSize={history_data?.pageSize ?? 8}
                                                 totalCount={history_data?.totalCount ?? 0} />
                        </TabsContent>

                        <TabsContent value="waiver">
                            <UpdateWaiver waiver_templates={waiver_templates}/>
                        </TabsContent>

                        <TabsContent value="recovery">
                            <RecoverEquipment deleted_items={deleted_items}/>
                        </TabsContent>
                    </div>

                </Tabs>
            </div>
        </div>
    );
}