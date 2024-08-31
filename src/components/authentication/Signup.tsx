import { auth, db } from "@/config";
import { setCookies } from "@/cookies";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { createUserWithEmailAndPassword, updateCurrentUser, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "react-toastify";

const Signup = () => {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [emailErrorText, setEmailErrorText] = useState('')
    const [passwordErrorText, setPasswordErrorText] = useState('')
    const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState('')
    const onSubmitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: { value: string };
            username: { value: string };
            email: { value: string };
            password: { value: string };
            confirm_password: { value: string };
        };
        const name = target.name.value; // typechecks!
        const username = target.username.value; // typechecks!
        const email = target.email.value; // typechecks!
        const confirm_password = target.confirm_password.value; // typechecks!
        const password = target.password.value; // typechecks!
        if (!String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )) {
            setEmailErrorText('Email is not valid!')
            return
        }
        if (password.length < 8) {
            setPasswordErrorText('Password must be longer than 8 characters!')
            return
        }
        if (confirm_password !== password) {
            setConfirmPasswordErrorText('Password does not match!')
            return
        }
        try {
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(userCredentials.user, {
                displayName: name,
                photoURL: "https://ssl.gstatic.com/docs/common/profile/nyancat_lg.png"
            })
            const expenseCategories = ["Shopping", "Food", "Groceries", "Education", "Utilities"]
            const expenseCategoriesBudget = [300, 800, 200, 100, 50]
            // const incomeCategories = ["Salary", "Extra income"]
            // const incomeCategoriesAmount = [200, 0]
            const userRef = doc(db, 'users', userCredentials.user.uid)
            await setDoc(userRef, {
                email: userCredentials.user.email,
                name: userCredentials.user.displayName
            })
            const expensesRef = collection(db, 'users', userCredentials.user.uid, 'budgets')
            await Promise.all(
                expenseCategories.map(async (category: string, index: number) => {
                    await addDoc(expensesRef, {
                        category: category,
                        budget: expenseCategoriesBudget[index]
                    })
                })
            )
            // const incomesRef = collection(db, 'users', userCredentials.user.uid, 'incomes')
            // await Promise.all(
            //     incomeCategories.map(async (category: string, index: number) => {
            //         await addDoc(incomesRef, {
            //             category: category,
            //             budget: incomeCategoriesAmount[index]
            //         })
            //     })
            // )
            await setCookies(userCredentials.user.email, userCredentials.user.uid, userCredentials.user.displayName, userCredentials.user.photoURL)
            onClose()
            toast.success('Sign up successful!')
            router.push('/')
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    return (
        <>
            <Button onClick={onOpen} size="md" variant="solid" color="primary" className="md:hidden inline">Sign up</Button>
            <Button onClick={onOpen} size="lg" variant="solid" color="primary" className="md:inline hidden">Sign up</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={onSubmitHandler}>
                            <ModalHeader className="flex flex-col gap-1 text-black">Sign Up</ModalHeader>
                            <ModalBody className="text-black">
                                <Input
                                    autoFocus
                                    label="Name"
                                    name="name"
                                    variant="bordered"
                                    isRequired
                                    required
                                />
                                <Input
                                    name="username"
                                    label="Username"
                                    variant="bordered"
                                    isRequired
                                    required
                                />
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
                                    onChange={() => {
                                        setConfirmPasswordErrorText('')
                                        setPasswordErrorText('')
                                    }}
                                />
                                <h1 className="text-red-600 text-sm">{passwordErrorText}</h1>
                                <Input
                                    label="Confirm password"
                                    name="confirm_password"
                                    type="password"
                                    variant="bordered"
                                    isRequired
                                    required
                                    onChange={() => setConfirmPasswordErrorText('')}
                                />
                                <h1 className="text-red-600 text-sm">{confirmPasswordErrorText}</h1>
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
                                    Sign Up
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default Signup