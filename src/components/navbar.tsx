'use client'
import { NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link as NextUILink, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Spinner } from "@nextui-org/react";
import { getCookies, removeCookies } from "@/cookies"
import Link from 'next/link'
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/config";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { toast } from "react-toastify";

const Topbar = () => {
    const router = useRouter()
    const [email, setEmail] = useState('');
    const [userID, setUserID] = useState('');
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [profileIsLoading, setProfileIsLoading] = useState(true)

    const currentPath = usePathname();

    const onLoad = async () => {
        setProfileIsLoading(true)
        try {
            let res: any = await getCookies()
            setEmail(res.email)
            setUserID(res.id)
            setName(res.name)
            setPhoto(res.photo)
            setProfileIsLoading(false)
        } catch (e: any) {
            console.error({ msg: e.message, error: e.errorCode })
            return
        }
    }

    useEffect(() => {
        onLoad()
    }, [auth.currentUser]);
    
    useEffect(() => {
        onLoad()
    }, []);

    const onLogoutHandler = async () => {
        setProfileIsLoading(true)
        try {
            await signOut(auth)
            await removeCookies()
            setEmail('')
            setUserID('')
            setProfileIsLoading(false)
            toast.success('Logged out successfully!')
            router.push('/welcome')
        } catch (e: any) {
            toast.error(e.message)
        }

    };


    if (currentPath.startsWith('/welcome')) {
        return <></>
    }

    return (
        <Navbar maxWidth="2xl" shouldHideOnScroll>
            <NavbarContent className="flex gap-4" justify="center">
                <NavbarBrand>
                    <Link scroll={true} href="/" className="">
                        <Image src="/findnans-logo.png" width={150} height={50} alt="logo" className="mx-auto" />
                    </Link>
                </NavbarBrand>
                {/* <NavbarItem>
                    <Link color="foreground" href="#">
                        Features
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link href="#" aria-current="page">
                        Customers
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#">
                        Integrations
                    </Link>
                </NavbarItem> */}
            </NavbarContent>
            <NavbarContent as="div" justify="end">
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Avatar
                            isBordered
                            as="button"
                            className="transition-transform"
                            color="secondary"
                            name="Jason Hughes"
                            size="sm"
                            src={photo}
                        />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                        <DropdownItem key="profile" className="h-14 gap-2">
                            <p className="font-semibold">Signed in as</p>
                            <p className="font-semibold">{email}</p>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Button variant="solid" color="danger" onClick={onLogoutHandler}>Log out</Button>
            </NavbarContent>
        </Navbar>
    )
}

export default Topbar