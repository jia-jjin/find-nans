'use client'

import { usePathname } from "next/navigation"

const Footer = () => {
    const currentPath = usePathname()

    if (currentPath == '/welcome'){
        return <></>
    }

    return (
        <div className="w-full border-t text-black border-black h-[100px] items-center flex justify-center bg-green-300">
            <h1 className="text-center mx-2">&copy; 2024 FindNans Inc. | All Rights Reserved</h1>
        </div>
    )
}

export default Footer