// use this for displaying small messages abaout successes/failures/updates etc. instead of using alert
// if something needs to stay up for the user to interact with, use Popup

import { useEffect } from "react";

interface Props {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({message, type, onClose}: Props) {

    useEffect( () => {
        const timer = setTimeout(onClose, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className= {`z-50 fixed top-4 right-3 max-w-sm md:max-w-md lg:max-w-xl w-full px-5 py-4 rounded-lg
            text-white leading-snug text-lg md:text-2xl border break-words whitespace-normal
            shadow-xl ring-1 ring-black/10
             ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            <button className="absolute top-1 right-2 text-sm px-2 bg-white/20 rounded hover:bg-white/30 hover:cursor-pointer" onClick={onClose}> ✕ </button>
            <p> {message} </p>
        </div>
    );
}