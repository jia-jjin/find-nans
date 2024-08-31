import ExpenseModel from "@/models/ExpenseModel"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import Budget from "./Budget"

const AllBudgets = (props: { amountSpentBasedOnCategories: { [key: string]: number }, budgets: Array<ExpenseModel> }) => {
    const { budgets, amountSpentBasedOnCategories } = props
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    return (
        <>
            <Button variant="solid" color="primary" className="mt-2" onClick={onOpen}>View all budgets</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">All Budgets</ModalHeader>
                            <ModalBody className="p-4">
                                {budgets.map((budget) => {
                                    return <Budget budget={budget} amountSpentBasedOnCategories={amountSpentBasedOnCategories}/>
                                })}
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

export default AllBudgets