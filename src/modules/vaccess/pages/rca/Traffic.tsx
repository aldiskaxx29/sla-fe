import React, { use, useEffect, useState } from "react"
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ActionPlanProgress from "./ActionPlanProgress"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
        ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);
const StackedBarChart = () => {
  const data = {
    labels: ["Capacity", "Technical", "Impcat Gamas", "Issue TSEL"],
    datasets: [
      {
        label: "OGP",
        data: [10, 10, 10, 10],
        backgroundColor: "rgba(237, 189, 65, 1)",
        barThickness:35
      },
      {
        label: "Close",
        data: [20, 20, 20, 30],
        backgroundColor: "rgba(16, 71, 97, 1)",
        barThickness:35
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout:{
        padding:{
            bottom:0
        }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
            stepSize: 10,
            autoSkip:false,
            callback: (value) => value,
        },
        grid: {
            drawTicks: true,
        },
    },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels:{
            boxWidth:15
        }
      },
      title: {
        display: true,
        text: "Buy vs Sell (Stacked)",
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (v) => v,
        offset: 0,
        font: {
            size: 12,
            weight: 'bold',
            color: '#000'
        }
        }
    },
  };

  return <div style={{ height: "205px",width:"100%" }}><Bar data={data} style={{width:1000}} options={options} /></div>;
};
export default ({ShowPopup,mode,week})=>{
    const [NASIONAL,setNasional] = useState(0)
    const TB = {
        SUMBAGUT : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SUMBAGSEL : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_BARAT : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_TENGAH : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_TIMUR : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        BALINUSRA : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        KALIMANTAN : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SULAWESI : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SUMBAGTENG : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        PUMA : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JABOTABEK_OUTER : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
    }
    async function Nasional(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=rca-'+mode.split('-')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}`)
        let {data} = await res.json()
        try {
            setNasional(data.length)
            
        } catch (error) {
            
        }
    }
    useEffect(()=>{
        if(week){
            Nasional()
        }
    },[mode,week])
    return(
    <React.Fragment>
          <div>
                <div className="text-md font-bold text-red-700 flex gap-2">RESUME RCA</div>
                <div className="grid grid-cols-6">
                    <div className="flex flex-col items-center justify-center w-full">
                        <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center">NASIONAL</div>
                        <div className="rounded-b-lg flex flex-col items-center bg-linear-to-r from-sky-600 to-gray-300 w-full justify-center py-2">
                            <div onClick={ShowPopup} className="cursor-pointer text-3xl py-2 font-bold text-red-600">{NASIONAL}</div>
                            <div>SITE</div>
                            <div>NOT CLEAR</div>
                        </div>
                    </div>
                    <div className="col-span-5">
                        <div className="px-10">
                            <StackedBarChart></StackedBarChart>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                    <div className="col-span-7">
                        <table className="w-full border border-gray-800 py-2" style={{fontWeight:'300 !important',fontSize:'0.7em'}}>
                            <thead>
                                <tr className="uppercase">
                                    <th style={{fontWeight:'400'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Region</th>
                                    <th style={{fontWeight:'400'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Total Site Not Clear</th>
                                    <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Capacity</th>
                                    <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Impact Gamas</th>
                                    <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Technical</th>
                                    <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">IssueTsel</th>
                                </tr>
                                <tr className="uppercase">
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Total Site</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Progress</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Total Site</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Progress</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Total Site</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Progress</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Total Site</th>
                                    <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(TB).map((T,i)=>{
                                    return(
                                    <tr key={i} onClick={ShowPopup}>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-left p-[3px]">{String(i+1).padStart(2,'0')+'-'+T.replace('_',' ')}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">1</td>
                                    </tr>
                                )})}
                                <tr onClick={ShowPopup}>
                                    <td style={{fontWeight:'700'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-left p-[3px]">Nationwide</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ActionPlanProgress ShowPopup={ShowPopup}></ActionPlanProgress>
    </React.Fragment>
    )
}