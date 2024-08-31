import ExpenseModel from "@/models/ExpenseModel"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, useDisclosure } from "@nextui-org/react"
import Expense from "./Expense"
import { db } from "@/config"
import { getCookies } from "@/cookies"
import { collection, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import moment from "moment"

const AllExpenses = (props: { expenses: Array<ExpenseModel> }) => {
    const { expenses } = props
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const [categories, setCategories] = useState<any>([])
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [filteredResults, setFilteredResults] = useState<Array<ExpenseModel>>([])
    useEffect(() => {
        setFilteredResults([])
        setTimeout(() => {
            setFilteredResults(
                expenses
                    .filter(expense => categoryFilter == "all" ? expense : expense.category == categoryFilter)
                    .sort((a, b) => moment(b.date).diff(moment(a.date))))
        }, 100);
    }, [categoryFilter, expenses])
    const getCategories = async () => {
        const { id } = await getCookies()
        const categoriesRef = collection(db, 'users', id, 'budgets')
        const unsubscribe = onSnapshot(categoriesRef, async (docSnapshot) => {
            let tempcategories: Array<ExpenseModel> = []
            docSnapshot.docs.map((expense) => {
                const tempExpense = expense.data() as ExpenseModel
                tempcategories.push(tempExpense)
            })
            setCategories(tempcategories)
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
            <Button variant="solid" color="primary" className="mt-2" onClick={onOpen}>View all expenses</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex xs:flex-row flex-col gap-2 justify-between items-center">
                                <h1>All Expenses</h1>
                                <div className="flex items-center">
                                    <h1 className="text-sm font-medium">Filter:</h1>
                                    <Select
                                        isRequired
                                        required
                                        name="category"
                                        color="default"
                                        className="text-black [&>*]:text-black w-[150px] me-4 ms-2"
                                        variant="bordered"
                                        selectedKeys={[categoryFilter]}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        classNames={{ value: ["text-black"] }}
                                    >
                                        <SelectItem key={'all'} aria-label="filter-all">
                                            All
                                        </SelectItem>
                                        {categories.map((category: ExpenseModel) => (
                                            <SelectItem key={category.category} aria-label={'filter' + category.category}>
                                                {category.category}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-4">
                                {
                                    filteredResults.length
                                        ? filteredResults.map((expense) => {
                                            return <Expense expense={expense} />
                                        })
                                        : <div className="place-content-center h-[200px]"><h1 className="text-lg text-center">No expenses matching this category found.</h1></div>
                                }
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="solid" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default AllExpenses