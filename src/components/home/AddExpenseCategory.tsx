'use client'

import { db } from "@/config";
import { getCookies } from "@/cookies";
import ExpenseModel from "@/models/ExpenseModel"
import { Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react"
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AddExpenseCategory = (props: { categories: Array<ExpenseModel> }) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [errorText, setErrorText] = useState('')
    // const [budgetErrorText, setBudgetErrorText] = useState('')
    const { categories } = props
    const initialCategories = categories.map((category) => category.category.toLowerCase())
    const onSubmitHandler = async (e: any) => {
        e.preventDefault();

        const target = e.target.parentElement.parentElement as typeof e.target.parentElement.parentElement & {
            category: { value: string };
            // budget: { value: number };
        };
        const category = target.category.value; // typechecks!
        // const budget = parseInt(target.budget.value.toString()); // typechecks!
        if (initialCategories.includes(category.toLowerCase())) {
            setErrorText('Category already exists!')
            return
        }
        if (!category.trim()) {
            setErrorText('Must not be empty!')
            return
        }
        try {
            const { id } = await getCookies()
            const categoriesRef = collection(db, 'users', id, 'budgets')
            await addDoc(categoriesRef, {
                budget: 0,
                category: category.trim()
            })
            onClose()
            toast.success('Category added successfully!')
        } catch (e: any) {
            toast.error(e.message)
        }
    }
    return (
        <>
            <div className="w-full flex justify-end"><p className="m-0 text-sm text-blue-600 underline underline-offset-1 cursor-pointer" onClick={onOpen}>Missing a category?</p></div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <form>
                            <ModalHeader className="flex flex-col gap-1">New Expense Category</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Category Name"
                                    name="category"
                                    type="text"
                                    variant="bordered"
                                    required
                                    isRequired
                                    onChange={() => setErrorText('')}
                                />
                                <h1 className="text-red-500 text-sm">{errorText}</h1>
                                {/* <Input
                                    label="Budget"
                                    name="budget"
                                    type="number"
                                    variant="bordered"
                                    required
                                    isRequired
                                />
                                <h1 className="text-red-500 text-sm">{budgetErrorText}</h1> */}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="button" onClick={onSubmitHandler}>
                                    Add Category
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default AddExpenseCategory