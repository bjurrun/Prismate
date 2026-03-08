'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface HeaderContextType {
    title: ReactNode;
    setTitle: (title: ReactNode) => void;
    actions: ReactNode;
    setActions: (actions: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState<ReactNode>(null)
    const [actions, setActions] = useState<ReactNode>(null)

    const value = React.useMemo(() => ({ title, setTitle, actions, setActions }), [title, actions])
    
    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    )
}

export function useHeader() {
    const context = useContext(HeaderContext)
    if (context === undefined) {
        throw new Error('useHeader must be used within a HeaderProvider')
    }
    return context
}
