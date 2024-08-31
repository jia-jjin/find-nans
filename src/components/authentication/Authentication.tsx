'use client'

import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import Signup from "./Signup"
import Login from "./Login"

const Authentication = () => {
    return (
        <div className="flex gap-4 items-center xs:flex-row flex-col">
            <Signup/>
            <Login/>
        </div>
    )
}

export default Authentication