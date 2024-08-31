import { auth } from "@/config";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } from "@nextui-org/react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { setCookies } from "@/cookies";

const Login = () => {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [emailErrorText, setEmailErrorText] = useState('')
    const onSubmitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: { value: string };
            username: { value: string };
            email: { value: string };
            password: { value: string };
            confirm_password: { value: string };
        };
        const email = target.email.value; // typechecks!
        const password = target.password.value; // typechecks!
        if (!String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )) {
            setEmailErrorText('Email is not valid!')
            return
        }
        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password)
            await setCookies(userCredentials.user.email, userCredentials.user.uid, userCredentials.user.displayName, userCredentials.user.photoURL)
            onClose()
            toast.success('Logged in successfully!')
            router.push('/')
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    return (
        <>
            <h1 className="text-black text-center">Already have an account? <a onClick={onOpen} className="underline underline-offset-1 text-blue-600 cursor-pointer">Login here</a></h1>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={onSubmitHandler}>
                            <ModalHeader className="flex flex-col gap-1 text-black">Log in</ModalHeader>
                            <ModalBody className="text-black">
                                <Input
                                    name="email"
                                    label="Email"
                                    variant="bordered"
                                    isRequired
                                    required
                                    onChange={() => setEmailErrorText('')}
                                />
                                <h1 className="text-red-600 text-sm">{emailErrorText}</h1>
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    variant="bordered"
                                    isRequired
                                    required
                                />
                                {/* <div className="flex py-2 px-1 justify-between">
                                    <Checkbox
                                        classNames={{
                                            label: "text-small",
                                        }}
                                    >
                                        Send me occasional newsletters
                                    </Checkbox>
                                </div> */}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Log In
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default Login