'use client'

import { Button, Progress } from "@nextui-org/react";
import Image from "next/image";
import ExpenseModel from "@/models/ExpenseModel";
import { db } from "@/config";
import { getCookies } from "@/cookies";
import { collection, doc, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import AddExpense from "@/components/home/AddExpense";
import ExpensesDoughnut from "@/components/home/ExpensesDoughnut";
import moment, { Moment } from "moment";
import MonthlyExpenses from "@/components/home/MonthlyExpenses";
import Budget from "@/components/home/Budget";
import AddBudget from "@/components/home/AddBudget";
import AllBudgets from "@/components/home/AllBudgets";
import Expense from "@/components/home/Expense";
import AllExpenses from "@/components/home/AllExpenses";

export default function Home() {
  // const [income, setIncome] = useState<Array<ExpenseModel>>([])
  const [balance, setBalance] = useState(0.00)
  const [average, setAverage] = useState(0.00)
  const [expenses, setExpenses] = useState<any>([])
  const [everyExpenses, setEveryExpenses] = useState<any>([])
  const [amountSpentBasedOnCategories, setAmountSpentBasedOnCategories] = useState<{ [key: string]: number }>({})

  const [budget, setBudget] = useState<any>([])
  const [everyBudget, setEveryBudget] = useState<any>([])
  const [name, setName] = useState('')

  const pieChartOptions = [
    {
      value: 'alltime',
      label: 'All Time'
    },
    {
      value: 'year',
      label: 'This Year'
    },
    {
      value: 'month',
      label: 'This Month'
    },
    {
      value: 'week',
      label: 'This Week'
    },
    {
      value: 'day',
      label: 'Today'
    },
  ]
  const lineChartOptions = [
    {
      value: '12months',
      label: 'Last 12 Months'
    },
    {
      value: '6months',
      label: 'Last 6 Months'
    },
    {
      value: '3months',
      label: 'Last 3 Months'
    },
  ]
  const [selectedPieChartOption, setSelectedPieChartOption] = useState('alltime')
  const [selectedLineChartOption, setSelectedLineChartOption] = useState('3months')

  useEffect(() => {
    let total = 0
    let startDateOption: Moment | string = ''
    if (selectedPieChartOption == 'alltime') {
      startDateOption = ''
    } else if (selectedPieChartOption == 'year') {
      startDateOption = moment().startOf('year')
    } else if (selectedPieChartOption == 'month') {
      startDateOption = moment().startOf('month')
    } else if (selectedPieChartOption == 'week') {
      startDateOption = moment().startOf('week')
    } else {
      startDateOption = moment().startOf('day')
    }
    everyExpenses
      .filter((expense: ExpenseModel) => startDateOption ? moment(expense.date) >= startDateOption : expense)
      .map((expense: ExpenseModel) => {
        total += expense.amount
      })
    setBalance(total)
  }, [everyExpenses, selectedPieChartOption])

  useEffect(() => {
    let average = 0
    let startDateOption: Moment = moment().subtract(3, 'months')
    if (selectedLineChartOption == '12months') {
      startDateOption = moment().subtract(12, 'months')
      console.log(moment().subtract(3, 'months'))
    } else if (selectedLineChartOption == '6months') {
      startDateOption = moment().subtract(6, 'months')
    } else {
      startDateOption = moment().subtract(3, 'months')
    }
    let uniqueMonths: any = {}
    everyExpenses
      .filter((expense: ExpenseModel) => moment(expense.date) >= startDateOption)
      .map((expense: ExpenseModel) => {
        uniqueMonths[moment(expense.date).format("MMM")] = 69
        average += expense.amount
      })
    setAverage(Number((average / (Object.keys(uniqueMonths).length || 1)).toFixed(2)))
  }, [everyExpenses, selectedLineChartOption])

  const getExpenses = async () => {
    const { id, name } = await getCookies()
    setName(name)
    const userRef = collection(db, 'users', id, 'expenses')
    const q = query(userRef, orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, async (docSnapshot) => {
      let allExpenses: Array<ExpenseModel> = []
      docSnapshot.docs.map((expense) => {
        const tempExpenses = { ...expense.data(), id: expense.id } as ExpenseModel
        allExpenses.push(tempExpenses)
      })
      setExpenses(allExpenses.slice(0, 3))
      setEveryExpenses(allExpenses)
      let amountSpent: any = {}
      allExpenses.filter(expense => moment(expense.date) > moment().startOf('month')).map((expense: ExpenseModel) => {
        if (amountSpent[expense.category]) {
          amountSpent[expense.category] += expense.amount
        } else {
          amountSpent[expense.category] = expense.amount
        }
      })
      setAmountSpentBasedOnCategories(amountSpent)
      console.log(amountSpent)
    }, (error) => {
      console.error('Error fetching expenses data for user:', error.message);
    })
    return () => unsubscribe()
  }

  const getBudget = async () => {
    const { id } = await getCookies()
    const userRef = collection(db, 'users', id, 'budgets')
    const q = query(userRef, orderBy('budget', 'desc'), where('budget', '>', 0))
    const unsubscribe = onSnapshot(q, async (docSnapshot) => {
      let allBudget: Array<ExpenseModel> = []
      docSnapshot.docs.map((budget) => {
        const tempBudget = { ...budget.data(), id: budget.id } as ExpenseModel
        allBudget.push(tempBudget)
      })
      setBudget(allBudget.slice(0, 3))
      setEveryBudget(allBudget)
    }, (error) => {
      console.error('Error fetching budget data for user:', error.message);
    })
    return () => unsubscribe()
  }

  const [greeting, setGreeting] = useState('Welcome')
  useEffect(() => {
    getExpenses()
    getBudget()
    let currentHour = Number(moment().format("HH"));
    if (currentHour >= 0 && currentHour < 12) {
      setGreeting("Good Morning")
    } else if (currentHour < 17) {
      setGreeting("Good Afternoon")
    } else if (currentHour < 24) {
      setGreeting("Good Evening")
    }
  }, [])



  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-12 px-4 bg-green-300">
      <div className="container mx-auto">
        <div className="space-y-4">
          <div>
            <h1 className="uppercase tracking-wider text-sm font-bold text-black">{greeting}</h1>
            <h1 className="mt-2 text-5xl font-bold text-black">{name}</h1>
          </div>
          {/* <div className="flex gap-4 items-center">
            <TotalSpent expenses={expenses} />
          </div> */}

        </div>
        <div className="flex gap-4 w-full mt-8 justify-center md:flex-row flex-col">
          <div className="md:w-1/2 w-full py-8 px-6 rounded-xl bg-white/90 flex flex-col items-center gap-4">
            <h1 className="font-bold text-2xl">Recent Expenses</h1>
            {expenses.length
              ? <>
                {expenses.map((expense: ExpenseModel, index: number) => {
                  return <Expense expense={expense} key={'expense-' + index}/>
                })}
                <AllExpenses expenses={everyExpenses} />
              </>
              : <div className="h-full flex items-center"><h1 className="text-2xl">No budgets found.</h1></div>}
          </div>
          <div className="md:w-1/2 w-full py-8 xs:px-6 px-2 rounded-xl bg-white/90 flex flex-col items-center gap-4">
            <h1 className="font-bold text-2xl text-center">Monthly expenses</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {lineChartOptions.map(option => {
                return (<Button
                  disableRipple
                  radius="full"
                  color={selectedLineChartOption == option.value ? "primary" : "default"}
                  key={option.value}
                  startContent={
                    selectedLineChartOption == option.value && <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      height="1em"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      width="1em"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  }
                  onClick={() => setSelectedLineChartOption(option.value)}
                >{option.label}</Button>)
              })}
            </div>
            <MonthlyExpenses expenses={everyExpenses} option={selectedLineChartOption} />
            <div className="flex flex-col gap-2 items-center mt-2">
              <p className="uppercase xs:tracking-wider tracking-wide text-sm font-semibold text-center">average amount spent per month</p>
              <h1 className="font-bold xs:text-5xl text-3xl"><span className="xs:text-2xl text-lg">RM</span> {average}</h1>
            </div>
          </div>

        </div>
        <div className="flex gap-4 w-full mt-4 justify-center md:flex-row flex-col">
          <div className="md:w-1/2 w-full py-8 px-6 rounded-xl bg-white/90 flex flex-col items-center gap-4">
            <div className="flex gap-4 items-center">
              <h1 className="font-bold text-2xl">Budget this month</h1>
              <AddBudget size="md" />
            </div>
            {budget.length
              ? <>
                {budget.map((budget: ExpenseModel, index: number) => {
                  return <Budget key={'budget-' + index} budget={budget} amountSpentBasedOnCategories={amountSpentBasedOnCategories} />
                })}
                <AllBudgets budgets={everyBudget} amountSpentBasedOnCategories={amountSpentBasedOnCategories} />
              </>
              : <div className="h-full flex items-center"><h1 className="text-2xl">No budgets found.</h1></div>}
          </div>
          <div className="md:w-1/2 w-full py-8 xs:px-6 px-2 rounded-xl bg-white/90 flex flex-col items-center gap-4">
            <h1 className="font-bold text-2xl text-center">Expenses based on categories</h1>
            <div className="flex gap-2 flex-wrap justify-center">
              {pieChartOptions.map(option => {
                return (<Button
                  disableRipple
                  radius="full"
                  key={option.value}
                  color={selectedPieChartOption == option.value ? "primary" : "default"}
                  startContent={
                    selectedPieChartOption == option.value && <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      height="1em"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      width="1em"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  }
                  onClick={() => setSelectedPieChartOption(option.value)}
                >{option.label}</Button>)
              })}
            </div>
            <ExpensesDoughnut expenses={everyExpenses} option={selectedPieChartOption} />
            <div className="flex flex-col gap-2 items-center mt-2">
              <p className="uppercase tracking-wider text-sm font-semibold">total amount spent</p>
              <h1 className="font-bold xs:text-5xl text-3xl"><span className="xs:text-2xl text-lg">RM</span> {balance}</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6">
        <AddExpense />
      </div>
    </main>
  );
}
