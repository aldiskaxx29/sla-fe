import { Select, Spin } from "antd";
import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";

import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";

ChartJS.register(ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip, Legend);

const ReportSupportNeededPage = () => {
    const [loading, setLoading] = useState(false);

    const filterMonth = [
        {
            label: "January",
            value: "1",
        },
        {
            label: "February",
            value: "2",
        },
        {
            label: "March",
            value: "3",
        },
        {
            label: "April",
            value: "4",
        },
        {
            label: "May",
            value: "5",
        },
        {
            label: "June",
            value: "6",
        },
        {
            label: "July",
            value: "7",
        },
        {
            label: "August",
            value: "8",
        },
        {
            label: "September",
            value: "9",
        },
        {
            label: "October",
            value: "10",
        },
        {
            label: "November",
            value: "11",
        },
        {
            label: "December",
            value: "12",
        },
    ];

    const dataPie = {
        labels: ['Done', 'On Progress', 'Open'],
        datasets: [
            {
                data: [30, 45, 25],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',]
            }
        ]
    }
    const dataBar = {
        labels: ['Progress Status'],
        datasets: [
            {
                label: 'Done',
                data: [30],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                ]
            },
            {
                label: 'On Progress',
                data: [45],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                ]
            },
            {
                label: 'Open',
                data: [25],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                ]
            },
        ]
    }

    return (
        <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6">
            {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
            <div className="flex gap-4">
                <p className="text-xl font-semibold">Periode :</p>
                <Select className="w-42" onChange={() => setLoading(!loading)}>
                    {filterMonth.map((month) => {
                        return <Select.Option key={month.value} value={month.value}>{month.label}</Select.Option>
                    })}
                </Select>
            </div>

            <section className="grid grid-cols-4 gap-4 mt-4">
                <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-semibold">Upgrade Capacity</h2>
                    <Pie data={dataPie} />
                </div>
                <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-semibold">
                        <Bar data={dataBar} />
                    </h2>
                </div>
                <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-semibold">QE</h2>
                </div>
                <div className="p-6 bg-neutral-100 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-semibold">TSEL</h2>
                </div>
            </section>
        </div>
    )
}

export default ReportSupportNeededPage