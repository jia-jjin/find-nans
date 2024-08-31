'use client'

import { db } from "@/config";
import { getCookies } from "@/cookies";
import { Input, useDisclosure, Button, Modal, ModalContent, ModalHeader, ModalBody, Checkbox, ModalFooter, Select, SelectItem, DatePicker } from "@nextui-org/react";
import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ExpenseModel from "@/models/ExpenseModel";
import moment from "moment";
import AddExpenseCategory from "./AddExpenseCategory";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

const AddExpense = () => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [categories, setCategories] = useState<any>([])
    const [amountErrorText, setAmountErrorText] = useState('')
    const [dateErrorText, setDateErrorText] = useState('')
    const onSubmitHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            amount: { value: number };
            category: { value: string };
            notes: { value: string };
            date: { value: string };
        };
        const amount = parseInt(target.amount.value.toString()); // typechecks!
        const category = target.category.value; // typechecks!
        const notes = target.notes.value; // typechecks!
        const date = target.date.value; // typechecks!
        if (amount <= 0) {
            setAmountErrorText('Please enter a number more than 0!')
            return
        }
        if (!date) {
            setDateErrorText('Please select a date!')
            return
        }
        try {
            const { id } = await getCookies()
            const collectionRef = collection(db, 'users', id, 'expenses')
            await addDoc(collectionRef, {
                amount,
                category,
                notes,
                date: moment(date).format()
            })
            onClose()
            toast.success('Expense logged successfully!')
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    const getCategories = async () => {
        const { id } = await getCookies()
        const categoriesRef = collection(db, 'users', id, 'budgets')
        const unsubscribe = onSnapshot(categoriesRef, async (docSnapshot) => {
            let categories: Array<ExpenseModel> = []
            docSnapshot.docs.map((expense) => {
                const tempExpense = expense.data() as ExpenseModel
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
            <Button size="lg" radius="full" className="shadow-xl sm:flex hidden" color="warning" onClick={onOpen}>+ Add Expenses</Button>
            <Button isIconOnly size="lg" radius="full" className="shadow-xl sm:hidden flex text-2xl" color="warning" onClick={onOpen}>+</Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={onSubmitHandler}>
                            <ModalHeader className="flex flex-col gap-1">Add Expense</ModalHeader>
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
                                <Input
                                    label="Notes"
                                    name="notes"
                                    type="text"
                                    variant="bordered"
                                    isRequired
                                    required
                                />
                                <DatePicker onChange={() => setDateErrorText('')} showMonthAndYearPickers label="date" name="date" variant="bordered" isRequired maxValue={today(getLocalTimeZone())} />
                                {dateErrorText && <h1 className="text-red-600 text-sm">{dateErrorText}</h1>}
                                <Select
                                    isRequired
                                    required
                                    label="Category"
                                    name="category"
                                    color="default"
                                    className="text-black [&>*]:text-black"
                                    variant="bordered"
                                    classNames={{ value: ["text-black"] }}
                                >
                                    {categories.map((category: ExpenseModel) => (
                                        <SelectItem key={category.category}>
                                            {category.category}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <AddExpenseCategory categories={categories} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Add Expense
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default AddExpense