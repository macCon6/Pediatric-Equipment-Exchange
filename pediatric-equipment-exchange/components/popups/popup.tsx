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
            <div className="fixed inset-0 bg-black opacity-70 z-30" /> 

            {/* Flex container for popup box */}
            <div className="fixed inset-0 z-40 flex items-center justify-center">
                {/* // popup contents */}
                <div className={`z-50
                      bg-white rounded-xl p-6
                      overflow-y-auto
                      border border-teal-600 ${sizingClassName}`}
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