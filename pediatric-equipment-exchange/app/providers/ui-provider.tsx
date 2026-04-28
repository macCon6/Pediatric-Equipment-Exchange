
// context so that the header and sidebar can talk to each other w/o props

"use client";

import { useState, useContext, createContext } from "react";

const UIContext = createContext<any>(null);

export function useUI() {
    return useContext(UIContext);
} 

export default function UIProvider({ children }: { children: React.ReactNode }) {
    
    const [sideBarOpen, setSideBarOpen] = useState(false); 

    return (
        <UIContext.Provider value = {{sideBarOpen, setSideBarOpen}} >
            {children} 
        </UIContext.Provider>
    );
}
