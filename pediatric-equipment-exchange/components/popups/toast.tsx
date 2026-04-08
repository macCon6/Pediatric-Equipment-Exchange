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
        <div className= {`font-mono z-50 fixed top-8 right-20 py-6 px-10 rounded shadow-lg text-3xl text-white ${type === "success"? "bg-green-500" : "bg-red-500"}`}>
            <button className="absolute top-2 right-2 text-xl text-white" onClick={onClose}> X </button>
            <p> {message} </p>
        </div>
    );
}