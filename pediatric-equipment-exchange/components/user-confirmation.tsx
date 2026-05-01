
// a confirmation dialogue we can reuse inside of popups instead of window.confirm

"use client";

interface Props {
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function Confirm( {title, message, onConfirm, onCancel}: Props) {

    return (
        <div className="flex flex-col gap-6 text-center"> 
            <h1 className="font-bold text-2xl text-[#132540]"> {title} </h1>
            <p className="text-gray-600 text-base leading-relaxed px-2"> {message} </p>
            <div className="flex gap-3 w-full mt-2 min-h-[3rem]">
                <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-300 bg-red-600 py-2 rounded-lg text-white hover:cursor-pointer hover:opacity-50"> Cancel </button>
                <button onClick={onConfirm} className="bg-[#5a9e3a] flex-1 rounded-xl border border-gray-300 py-2 rounded-lg text-white hover:cursor-pointer hover:opacity-50"> Confirm </button>
            </div>
        </div>
    );
}