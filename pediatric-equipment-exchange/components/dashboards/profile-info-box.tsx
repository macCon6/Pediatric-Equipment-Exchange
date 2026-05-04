// maybe use this component to let them edit their profile info?

interface Props {
    user: any,
    role: string
    username: string,
    full_name: string
}

export default function ProfileInfo({user, role, username, full_name}: Props) {

    return (
        <>
        <div className="flex flex-col gap-5 bg-white border rounded-3xl p-6 "> 
            <h1 className="text-3xl text-center"> Welcome, <span className="italic">{username}</span> </h1>
            <div className="border-transparent rounded-3xl p-6 text-center"> 
                <h2 className="text-xl text-center mb-6"> Profile Info </h2>
                <p> <strong> Username: </strong> {username} </p>
                <p> <strong> Full Name: </strong> {full_name} </p>
                <p> <strong> Email: </strong> {user.email} </p>
                <p> <strong> Role: </strong> {role} </p>
            </div>
        </div>

        {role === "admin" &&
            <div className="p-4 flex flex-col items-center bg-white mt-3 border rounded-3xl"> 
                <h1 className="text-center text-lg font-bold"> In this dashboard, you can... </h1>
                <p className="text-center text-tiny italic mt-1"> Scroll the tab bar on mobile! </p>
                <ul className="list-disc p-4 space-y-3 text-base">
                    <li> View and update your profile info in the <strong className="text-green-600"> Profile Tab </strong></li>
                    <li> View, add, and delete users in the <strong className="text-green-600">  Users Tab </strong> </li>
                    <li> View & filter currently allocated equipment in the <strong className="text-green-600"> Allocations Tab </strong> </li>
                    <li> View & filter active reservations in the <strong className="text-green-600"> Reservations Tab </strong> </li>
                    <li> View & filter all distribution history in the <strong className="text-green-600"> History Tab </strong> </li>
                    <li> View and update the active waiver in the <strong className="text-green-600"> Waiver Tab </strong> </li>
                    <li> Recover soft deleted equipment in the <strong className="text-green-600"> Recovery Tab </strong> </li>
                </ul>
            </div>
        }
        </>
    );
}