
// a confirmation dialogue we can reuse inside of popups instead of window.confirm

"use client";

interface Props {
    title: string,
    message: string,
    submessage: string | null,
    redButtonText: string,
    greenButtonText: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function Confirm( {title, message, submessage, onConfirm, redButtonText, greenButtonText, onCancel}: Props) {

    return (
        <div className="flex flex-col gap-6 text-center"> 
            <h1 className="font-bold text-2xl text-[#132540]"> {title} </h1>
            <p className="text-gray-600 text-base leading-relaxed px-2"> {message} </p>
            <p className="text-gray-600 text-sm px-2"> {submessage} </p>
            <div className="flex gap-3 w-full mt-2">
                <button onClick={onCancel} className="py-3 bg-red-600 flex-1 border border-gray-300 rounded-xl text-white hover:cursor-pointer hover:opacity-50"> {redButtonText} </button>
                <button onClick={onConfirm} className="bg-[#5a9e3a] flex-1 border border-gray-300 rounded-xl text-white hover:cursor-pointer hover:opacity-50"> {greenButtonText} </button>
            </div>
        </div>
    );
}