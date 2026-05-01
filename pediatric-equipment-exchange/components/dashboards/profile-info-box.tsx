// maybe use this component to let them edit their profile info?

interface Props {
    user: any,
    role: string
    username: string,
    full_name: string
}

export default function ProfileInfo({user, role, username, full_name}: Props) {

    return (
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
    );
}