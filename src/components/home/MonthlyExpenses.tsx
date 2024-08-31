'use client'

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import ExpenseModel from '@/models/ExpenseModel';
import moment, { duration, Moment } from 'moment';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
    },
};

interface amountSpent {
    [key: string]: number
}

const MonthlyExpenses = (props: { expenses: Array<ExpenseModel>, option: string }) => {
    const { expenses, option } = props
    const [chartData, setChartData] = useState<any>()
    // const availableCategories = Array.from(new Set(expenses.map(expense => expense.category)))
    useEffect(() => {
        let amountSpent = {} as amountSpent
        let startDateOption: Moment | string = ''
        if (option == '12months') {
            startDateOption = moment().subtract(12, 'months')
        } else if (option == '6months') {
            startDateOption = moment().subtract(6, 'months')
        } else {
            startDateOption = moment().subtract(3, 'months')
        }
        expenses.sort((a, b) => moment(a.date).diff(moment(b.date))).filter(expense => moment(expense.date) >= startDateOption).map(expense => {
            const currentDate = moment(expense.date).format('MMM YYYY')
            if (amountSpent[currentDate]) {
                amountSpent[currentDate] += expense.amount
            } else {
                amountSpent[currentDate] = expense.amount
            }
        })
        let categoriesArray: any[] = Object.keys(amountSpent);
        let amountSpentArray: any[] = Object.values(amountSpent)
        setChartData({
            labels: categoriesArray,
            datasets: [
                {
                    label: 'Expenses in a month',
                    data: amountSpentArray,
                    borderColor: 'rgb(255, 99, 132)',
                    tooltip: {
                        callbacks: {
                            label: function (context: any) {
                                let label = context.label;
                                let value = context.raw;

                                if (!label)
                                    label = 'Unknown'

                                let average = 0;
                                let dataArr = context.chart.data.datasets[0].data;
                                dataArr.map((data: number) => {
                                    average += data;
                                });
                                average /= dataArr.length

                                let percentage = (value * 100 / average - 100).toFixed(2) + '%';
                                return ` RM ${value} (${(value * 100 / average - 100) > 0 ? "+" : ""}${percentage})`;
                            }
                        }
                    }
                },
            ],
        })
    }, [option, expenses])
    return (
        <>
            {chartData?.labels?.length
                ? <div className='w-full h-[250px]'>
                    <Line options={options} data={chartData} />
                </div>
                : <div className='h-[250px] place-content-center'>
                    <h1 className='text-2xl'>No data found.</h1>
                </div>}
        </>
    )
}

export default MonthlyExpenses