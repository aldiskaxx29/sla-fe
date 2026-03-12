
import React,{useEffect,useState} from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

import { Bar } from "react-chartjs-2";

const StackedBarChart = ({POP,MODE,DATE,CLEAR,SPIKE,CONSC}) => {
let dataset = [
      {
        label: "CLEAR",
        data: CLEAR,
        backgroundColor: "rgba(142, 217, 115, 1)",
        barThickness:80,
        stack:'total'
      },
      {
        label: "SPIKE",
        data: SPIKE,
        backgroundColor: "rgba(237, 189, 63, 1)",
        barThickness:80,
        stack:'total'
      },
      {
        label: "CONSECUTIVE",
        data: CONSC,
        backgroundColor: "rgba(192, 0, 0,1)",
        barThickness:80,
        stack:'total'
      },
    ]
    if(MODE!='PL'){
        dataset = [
      {
        label: "CLEAR",
        data: CLEAR,
        backgroundColor: "rgba(142, 217, 115, 1)",
        barThickness:80,
        stack:'total'
      },
      {
        label: "NOT CLEAR",
        data: CONSC,
        backgroundColor: "rgba(192, 0, 0,1)",
        barThickness:80,
        stack:'total'
      },
    ]
    }
  const data = {
    labels: DATE,
    datasets: dataset
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
            callback: (value) => value + "%",
        },
        grid: {
            drawTicks: true,
        },
    },
    },
    onClick: (event, elements, chart) => {
    if (!elements.length) return;

        const { datasetIndex, index } = elements[0];

        const label = chart.data.labels[index];
        const dataset = chart.data.datasets[datasetIndex];
        POP()
        // console.log('Klik:', {
        //     label,
        //     legend: dataset.label,
        //     value: dataset.data[index]
        // });
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
        text: "",
      },
      tooltip: {
        callbacks: {
            label: ctx =>
            `${ctx.dataset.label}: ${ctx.parsed.y}%`
        }
        }
    },
  };

  return <div style={{ height: "88%",width:"100%" }}><Bar data={data} style={{width:1000}} options={options} /></div>;
};
const DailyTracking=({start,end})=>{
    const [DAILYTRACKING,setDailyTracking] = useState({})
    const [DAILYMODE,setDailyMode] = useState('PL')
    const [DDate,setDDate] = useState([])
    const [DCLEAR,setDCLEAR] = useState([])
    const [DSPIKE,setDSPIKE] = useState([])
    const [DCONSC,setDCONSC] = useState([])
    const [DRegion,setDRegion] = useState("NATIONWIDE")
       const [TB,setTB] = useState({
        SUMBAGUT : {total_site:0,t_pl5:13,t_pl15:42,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGSEL : {total_site:0,t_pl5:13,t_pl15:57,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:3,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_BARAT : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TENGAH : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TIMUR : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        BALINUSRA : {total_site:0,t_pl5:12,t_pl15:21,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        KALIMANTAN : {total_site:0,t_pl5:13,t_pl15:57,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SULAWESI : {total_site:0,t_pl5:13,t_pl15:28,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGTENG : {total_site:0,t_pl5:13,t_pl15:39,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        PUMA : {total_site:0,t_pl5:12,t_pl15:22,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_OUTER : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
    })

    function PopDailyTracking(){
        setPOP(true);setTITLEPOP("SITE DAILY TRACKING PACKET LOSS - CLEAR")
    }
    async function DailyTracking(){
            let res = await fetch('https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=daily-tracking-'+DAILYMODE.toLowerCase()+'&region='+DRegion+`&start=${start}&end=${end}`)
            let {data} = await res.json()
            setDailyTracking({...data})
            let clear = []
            let spike = []
            let consc = []
            let date = []
    
            Object.keys(data).forEach(a=>{
                let total = Number(data[a][0]||0)+Number(data[a][1]||0)+Number(data[a][2]||0);
                let d = (new Date(a)).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                }).toUpperCase()
                date.push(d.replace(" ","-"))
    
                if(data[a][0] && total>0){
                    clear.push((Number(data[a][0])/total).toFixed(2)*100)
                }else{
                    clear.push(0)
                }
    
                if(data[a][2] && total>0){
                    spike.push((Number(data[a][2])/total).toFixed(2)*100)
                }else{
                    spike.push(0)
                }
    
                if(data[a][1] && total>0){
                    consc.push((Number(data[a][1])/total).toFixed(2)*100)
                }else{
                    consc.push(0)
                }
            })
            setDDate([...date])
            setDCLEAR([...clear])
            setDSPIKE([...spike])
            setDCONSC([...consc])
        }
    useEffect(()=>{
        DailyTracking()
    },[DAILYMODE,DRegion])
    return(
           <div className="flex flex-col gap-1 mt-2">
                <div className="text-md font-bold text-red-700 flex justify-between mt-1 items-center">
                    <div className="flex gap-4">
                        <div className="whitespace-nowrap">DAILY TRACKING</div>
                        <div className="flex gap-2" style={{fontSize:'0.6em',fontWeight:'400'}}>
                            <div onClick={()=>setDailyMode('PL')} className={(DAILYMODE=='PL'? 'bg-sky-700' :'bg-gray-800') +` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`}>PL</div>
                            <div onClick={()=>setDailyMode('LAT')} className={(DAILYMODE=='LAT'? 'bg-sky-700' :'bg-gray-800') +` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`}>LAT</div>
                            <div onClick={()=>setDailyMode('JIT')} className={(DAILYMODE=='JIT'? 'bg-sky-700' :'bg-gray-800') +` text-white rounded-full p-1 h-fit w-20 text-center cursor-pointer`}>JIT</div>
                        </div>
                    </div>
                    <div className="flex justify-end w-full">
                        <select onChange={(e)=>setDRegion(e.target.value)} value={DRegion} className="bg-white text-gray-800 px-2 text-sm font-normal rounded-sm border border-gray-800">
                            <option value={'NATIONWIDE'}>NATIONWIDE</option>
                            {Object.keys(TB).map((a=>{
                                return(<option value={a.replace("_"," ")} key={a}>{a.replace("_"," ")}</option>)
                            }))}
                        </select>
                    </div>
                </div>
         <div className="px-10" style={{height:'35vh'}}>
            <StackedBarChart POP={PopDailyTracking} DATE={DDate} MODE={DAILYMODE} CLEAR={DCLEAR} SPIKE={DSPIKE} CONSC={DCONSC}></StackedBarChart>
        </div>
        </div>
    )
}

export default DailyTracking