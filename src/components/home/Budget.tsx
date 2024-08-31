'use client'

import { db } from "@/config"
import { getCookies } from "@/cookies"
import ExpenseModel from "@/models/ExpenseModel"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Tooltip, useDisclosure } from "@nextui-org/react"
import { collection, doc, getDocs, or, query, setDoc, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Swal from "sweetalert2"

const Budget = (props: { amountSpentBasedOnCategories: { [key: string]: number }, budget: ExpenseModel }) => {
    const { onOpen, onOpenChange, isOpen, onClose } = useDisclosure()
    const { amountSpentBasedOnCategories, budget } = props
    const percent = Number(((amountSpentBasedOnCategories[budget.category] || 0) / budget.budget * 100).toFixed(2))
    const [formInfo, setFormInfo] = useState({ budget: budget.budget, category: budget.category })
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormInfo({ ...formInfo, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        setFormInfo({ budget: budget.budget, category: budget.category })
    }, [isOpen])
    const onSubmitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        try {
            const { id: userID } = await getCookies()
            const expensesRef = collection(db, 'users', userID, 'expenses')
            const q = query(expensesRef, or(
                where('category', '==', budget.category),
                where('category', '==', budget.category.toLowerCase()),
            ))
            const expensesSnapshot = await getDocs(q)
            const expensesID = expensesSnapshot.docs.map((expense) => expense.id)
            await Promise.all(
                expensesID.map(async (expenseID) => {
                    const expenseRef = doc(db, 'users', userID, 'expenses', expenseID)
                    await setDoc(expenseRef, {
                        category: formInfo.category
                    }, { merge: true })
                })
            )
            const budgetRef = doc(db, 'users', userID, 'budgets', budget.id)
            await setDoc(budgetRef, {
                category: formInfo.category,
                budget: Number(formInfo.budget)
            })
            onClose()
            toast.success("Edited budget successfully!")
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    const onDeleteHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        const res = await Swal.fire({
            title: "Are you sure?",
            text: "Don't worry, it will only reset the budget.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        })
        if (!res.isConfirmed) {
            onOpen()
            return
        }
        try {
            const { id: userID } = await getCookies()
            const budgetRef = doc(db, 'users', userID, 'budgets', budget.id)
            await setDoc(budgetRef, {
                budget: 0
            }, { merge: true })
            onClose()
            toast.success("Deleted budget successfully!")
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    return (
        <>
            <Tooltip content="click to edit or delete" aria-label="click to edit or delete">
                <div onClick={onOpen} className="rounded-md bg-slate-200 w-full p-3 hover:bg-slate-100 duration-200 cursor-pointer">
                    <div className="pointer-events-none flex justify-between items-center">
                        <div>
                            <h1 className="xs:text-xl text-lg font-semibold">{budget.category}</h1>
                            <p className="text-sm tracking-wide font-bold text-gray-500">Spent: <span className="text-nowrap">RM {amountSpentBasedOnCategories[budget.category] || 0}</span></p>
                        </div>
                        <h1 className="text-green-500 font-bold xs:text-3xl text-2xl text-end"><span className="text-lg">RM</span> {budget.budget}</h1>
                    </div>
                    <Progress
                        size="sm"
                        value={amountSpentBasedOnCategories[budget.category] || 0}
                        maxValue={budget.budget}
                        color={percent <= 40 ? "success" : percent <= 60 ? "primary" : percent <= 85 ? "warning" : "danger"}
                        className="mt-4"
                    />
                    <p className="text-gray-500 text-sm mt-1">{percent}%</p>
                </div>
            </Tooltip>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
                aria-label="edit budget"
            >
                <ModalContent>
                    {(onClose) => (
                        <form>
                            <ModalHeader className="flex flex-col gap-1">Edit Budget</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Category Name"
                                    name="category"
                                    type="text"
                                    variant="bordered"
                                    value={formInfo.category}
                                    required
                                    isRequired
                                    onChange={onChangeHandler}
                                />
                                <Input
                                    label="Budget"
                                    name="budget"
                                    type="number"
                                    variant="bordered"
                                    required
                                    isRequired
                                    onChange={onChangeHandler}
                                    value={formInfo.budget.toString()}
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">RM</span>
                                        </div>
                                    }
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button className="me-auto" color="danger" type="button" onClick={onDeleteHandler}>
                                    Delete
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="button" onClick={onSubmitHandler}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default Budget