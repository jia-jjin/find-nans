'use client'

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ExpenseModel from '@/models/ExpenseModel';
import moment, { duration, Moment } from 'moment';

ChartJS.register(ArcElement, Tooltip, Legend);

interface amountSpent {
    [key: string]: number
}

const ExpensesDoughnut = (props: { expenses: Array<ExpenseModel>, option: string }) => {
    const { expenses, option } = props
    const [chartData, setChartData] = useState<any>()
    // const availableCategories = Array.from(new Set(expenses.map(expense => expense.category)))
    useEffect(() => {
        let amountSpent = {} as amountSpent
        let startDateOption: Moment | string = ''
        if (option == 'alltime') {
            startDateOption = ''
        } else if (option == 'year') {
            startDateOption = moment().startOf('year')
        } else if (option == 'month') {
            startDateOption = moment().startOf('month')
        } else if (option == 'week') {
            startDateOption = moment().startOf('week')
        } else {
            startDateOption = moment().startOf('day')
        }
        expenses.filter(expense => startDateOption ? moment(expense.date) >= startDateOption : expense).map(expense => {
            if (amountSpent[expense.category]) {
                amountSpent[expense.category] += expense.amount
            } else {
                amountSpent[expense.category] = expense.amount
            }
        })
        let categoriesArray: any[] = Object.keys(amountSpent);
        let amountSpentArray: any[] = Object.values(amountSpent)
        setChartData({
            labels: categoriesArray,
            datasets: [
                {
                    label: 'Amount spent',
                    data: amountSpentArray,
                    backgroundColor: [
                        'rgba(20, 159, 64)',
                        'rgba(255, 99, 132)',
                        'rgba(54, 162, 235)',
                        'rgba(255, 206, 86)',
                        'rgba(75, 192, 192)',
                        'rgba(153, 102, 255)',
                        'rgba(255, 159, 64)',
                    ],
                    tooltip: {
                        callbacks: {
                            label: function (context: any) {
                                let label = context.label;
                                let value = context.raw;

                                if (!label)
                                    label = 'Unknown'

                                let sum = 0;
                                let dataArr = context.chart.data.datasets[0].data;
                                dataArr.map((data: number) => {
                                    sum += data;
                                });

                                let percentage = (value * 100 / sum).toFixed(2) + '%';
                                return ` RM ${value} (${percentage})`;
                            }
                        }
                    }
                },
            ],
        })
    }, [option, expenses])
    const options = {
        maintainAspectRatio: true,
    }
    return (
        <>
            {chartData?.labels?.length
                ? <div className='xs:w-3/4 w-full flex justify-center'>
                    <Pie data={chartData} options={options} />
                </div>
                : <div className='h-[400px] place-content-center'>
                    <h1 className='text-2xl'>No data found.</h1>
                </div>}
        </>
    )
}

export default ExpensesDoughnut