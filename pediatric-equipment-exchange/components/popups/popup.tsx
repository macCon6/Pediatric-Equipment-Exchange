// a popup box we may wanna reuse 

"use client";
import { ReactNode } from "react";

interface Props {
    // allow parents to open & close the pop-up without needing state in this component
    isOpen: boolean,
    onClose: () => void, 
    children: ReactNode // for putting things inside of the pop-up
}

export default function Popup ({isOpen, onClose, children}: Props) {
    return (
        <>
        {isOpen &&
            <>
            {/* // outer layer to gray out things in the background */}
            <div className="fixed inset-0 bg-black opacity-70 z-30" /> 

            {/* Flex container for popup box */}
            <div className="fixed inset-0 z-40 flex items-center justify-center">
                {/* // popup contents */}
                <div className="z-50
                      bg-white rounded-xl p-10
                      w-full md:w-4/5 lg:w-2/3 max-w-5xl
                      h-4/5 overflow-y-auto
                      border border-teal-600"
                      >
                <button className = "text-black text-3xl" onClick={onClose}> X </button>
                {children}
                </div>
            </div>
            </>
        }
    </>
    )
}