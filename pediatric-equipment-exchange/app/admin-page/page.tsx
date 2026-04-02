"use client"

import SideBar from "@/components/sidebar";
import {useState} from 'react';

export default function AdminPage() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const handleCreateUser = async () => {
        const res = await fetch("/api/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({
                username,
                password,
            }),
        });
        const data = await res.json();
        console.log(data);
    };

    return ( <> 
        <div className = "flex min-h-screen w-full bg-[#51b6b6]">

            <SideBar />

            {/*Main Contnt*/}
            <main className = "flex-1 p-6">
                <h1 className="text-2xl"> Admin Page </h1>

                {/*Grid system, add more rows to get more boxes}*/}
                <div className= "max-w-4xl w-full mx-auto">
                    <div className="grid grid-cols-1 grid-rows-1 gap-4">

                        {/*Add Users, First box*/}
                        <div className="bg-white rounded-lg flex gap-2 placeholder-black text-black">
                            <h1>Create User:</h1>
                            <input 
                                placeholder="Username"
                                type="usename"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <h1>Password:</h1>
                            <input 
                                placeholder = "Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <button onClick={handleCreateUser} className=" bg-rose-400 text-black rounded-full px-5 p-2 mt-2">
                                Create User
                            </button>
                        </div>

                    </div>
                    
                </div>
            </main>


        </div>
        </>)
}
