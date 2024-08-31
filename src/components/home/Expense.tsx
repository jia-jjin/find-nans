import ExpenseModel from "@/models/ExpenseModel"
import { today, getLocalTimeZone, parseDate } from "@internationalized/date"
import { Button, DatePicker, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react"
import moment from "moment"
import AddExpenseCategory from "./AddExpenseCategory"
import { useEffect, useState } from "react"
import { getCookies } from "@/cookies"
import { db } from "@/config"
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"
import { toast } from "react-toastify"

const Expense = (props: { expense: ExpenseModel }) => {
    const { expense } = props
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()
    const [amountErrorText, setAmountErrorText] = useState('')
    const [categories, setCategories] = useState<any>([])
    const [formInfo, setFormInfo] = useState({
        notes: expense.notes,
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
    })
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
        try {
            const { id } = await getCookies()
            const collectionRef = doc(db, 'users', id, 'expenses', expense.id)
            await setDoc(collectionRef, {
                amount,
                category,
                notes,
                date: moment(date).format()
            })
            onClose()
            toast.success('Expense edited successfully!')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const onDeleteHandler = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        try {
            const { id: userID } = await getCookies()
            const expenseRef = doc(db, 'users', userID, 'expenses', expense.id)
            await deleteDoc(expenseRef)
            onClose()
            toast.success("Deleted expense record successfully!")
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
            <Tooltip content="click to edit or delete">
                <div onClick={onOpen} className="rounded-md bg-slate-200 duration-200 hover:bg-slate-100 cursor-pointer w-full p-3 justify-between flex items-center">
                    <div>
                        <h1 className="xs:text-xl text-lg font-semibold leading-snug">{expense.notes}</h1>
                        <p className="text-sm tracking-wide uppercase font-bold text-gray-500"><span className="lowercase">in</span> {expense.category}</p>
                        <p className="mt-3 text-sm tracking-wide font-bold text-gray-400">{moment(expense.date).format('DD/MM/YYYY')}</p>
                    </div>
                    <h1 className="text-red-500 font-bold xs:text-3xl text-2xl text-end"><span className="text-lg sm:inline block">RM</span> {expense.amount}</h1>
                </div>
            </Tooltip>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Edit Expense</ModalHeader>
                            <form onSubmit={onSubmitHandler}>
                                <ModalBody>
                                    <Input
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        variant="bordered"
                                        onChange={(e: any) => {
                                            setAmountErrorText('')
                                            setFormInfo({...formInfo, amount: e.target.value})
                                        }}
                                        value={formInfo.amount.toString()}
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
                                        value={formInfo.notes}
                                        variant="bordered"
                                        onChange={(e: any) => {
                                            setFormInfo({...formInfo, notes: e.target.value})
                                        }}
                                        isRequired
                                        required
                                    />
                                    <DatePicker onChange={(e: any) => setFormInfo({...formInfo, date: `${e.year}-${e.month}-${e.day}`})} value={parseDate(moment(formInfo.date).format('YYYY-MM-DD'))} showMonthAndYearPickers label="date" name="date" variant="bordered" isRequired maxValue={today(getLocalTimeZone())} />
                                    <Select
                                        isRequired
                                        required
                                        selectedKeys={[formInfo.category]}
                                        label="Category"
                                        name="category"
                                        color="default"
                                        className="text-black [&>*]:text-black"
                                        variant="bordered"
                                        onChange={(e: any) => {
                                            setFormInfo({...formInfo, category: e.target.value})
                                        }}
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
                                    <Button color="danger" variant="solid" className="me-auto" onClick={onDeleteHandler}>
                                        Delete
                                    </Button>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" type="submit">
                                        Save
                                    </Button>
                                </ModalFooter>
                            </form>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default Expense