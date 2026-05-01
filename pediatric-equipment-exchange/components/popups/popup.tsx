// a popup box we may wanna reuse 

"use client";
import { ReactNode } from "react";

interface Props {
    // allow parents to open & close the pop-up without needing state in this component
    isOpen: boolean,
    onClose: () => void, 
    children: ReactNode, // for putting things inside of the pop-up
    sizingClassName: string // allow custom styling when extending the popup
}

export default function Popup ({isOpen, onClose, children, sizingClassName}: Props) {
    return (
        <>
        {isOpen &&
            <>
            {/* // outer layer to gray out things in the background */}
            <div className="fixed inset-0 bg-black opacity-70 z-50" /> 

            {/* Flex container for popup box */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* // popup contents */}
                <div className={`z-50
                    bg-white rounded-xl p-6
                      overflow-y-auto
                      border border-teal-600
                      max-h-[75vh] md:max-h-[80vh]
                      ${sizingClassName}`}
                      >
                <button className = "text-white text-xl md:text-2xl -ml-3 bg-red-500 px-3 py-1 rounded-xl font-bold hover:cursor-pointer hover:opacity-60 mb-2" 
                    onClick={onClose}> ✕ </button>
                {children}
                </div>
            </div>
            </>
        }
    </>
    )
}