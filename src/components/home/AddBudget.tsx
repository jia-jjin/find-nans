'use client'

import { db } from "@/config";
import { getCookies } from "@/cookies";
import { Input, useDisclosure, Button, Modal, ModalContent, ModalHeader, ModalBody, Checkbox, ModalFooter, Select, SelectItem, DatePicker } from "@nextui-org/react";
import { addDoc, collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ExpenseModel from "@/models/ExpenseModel";
import moment from "moment";
import AddExpenseCategory from "./AddExpenseCategory";
import { merge } from "chart.js/helpers";

const AddBudget = (props: { size: "sm" | "md" | 'lg' | undefined }) => {
    const { size } = props
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [categories, setCategories] = useState<any>([])
    const [amountErrorText, setAmountErrorText] = useState('')
    const [dateErrorText, setDateErrorText] = useState('')
    const [selectedCategoryID, setSelectedCategoryID] = useState<any>('')
    const onSubmitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            amount: { value: number };
            category: { value: string };
        };
        const amount = parseInt(target.amount.value.toString()); // typechecks!
        const category = target.category.value; // typechecks!
        if (amount <= 0) {
            setAmountErrorText('Please enter a number more than 0!')
            return
        }
        try {
            const { id } = await getCookies()
            const docRef = doc(db, 'users', id, 'budgets', ...selectedCategoryID)
            await setDoc(docRef, {
                budget: amount,
            }, {merge: true})
            onClose()
            toast.success('Budget added successfully!')
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    const getCategories = async () => {
        const { id } = await getCookies()
        const categoriesRef = collection(db, 'users', id, 'budgets')
        const q = query(categoriesRef, where('budget', '==', 0))
        const unsubscribe = onSnapshot(q, async (docSnapshot) => {
            let categories: Array<ExpenseModel> = []
            docSnapshot.docs.map((expense) => {
                const tempExpense = { ...expense.data(), id: expense.id } as ExpenseModel
                categories.push(tempExpense)
            })
            setCategories(categories)
        }, (error) => {
            console.error('Error fetching expenses categories data for user:', error.message);
        })
        return () => unsubscribe()
    }
    useEffect(() => {
        getCategories()
    }, [])
    return (
        <>
            <Button size="md" radius="full" className="shadow-xl xs:flex hidden" color="warning" onClick={onOpen}>+ Add Budget</Button>
            <Button isIconOnly size="md" radius="full" className="shadow-xl xs:hidden flex text-xl" color="warning" onClick={onOpen}>+</Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={onSubmitHandler}>
                            <ModalHeader className="flex flex-col gap-1">Add Budget</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    variant="bordered"
                                    onChange={() => setAmountErrorText('')}
                                    isRequired
                                    required
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">RM</span>
                                        </div>
                                    }
                                />
                                {amountErrorText && <h1 className="text-red-600 text-sm">{amountErrorText}</h1>}
                                <Select
                                    isRequired
                                    required
                                    label="Category"
                                    name="category"
                                    color="default"
                                    className="text-black [&>*]:text-black"
                                    variant="bordered"
                                    classNames={{ value: ["text-black"] }}
                                    onSelectionChange={setSelectedCategoryID}
                                >
                                    {categories.map((category: ExpenseModel) => (
                                        <SelectItem key={category.id}>
                                            {category.category}
                                        </SelectItem>
                                    ))}
                                </Select>
                                {/* <AddExpenseCategory categories={categories} /> */}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Add Budget
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default AddBudget