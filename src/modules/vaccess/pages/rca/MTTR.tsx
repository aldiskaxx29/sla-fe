import React, { useEffect, useState } from "react"
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from "react-chartjs-2";
import ActionPlanProgress from "./ActionPlanProgress"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import PopupTTR from "./PopupTTR";

ChartJS.register(
    ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);
const StackedBarChart = ({datachart}) => {
  const data = {
    labels: ["SPMS", "ISR", "QE", "ISSUE TSEL","WARRANTY","COMCASE","WAITING CRA/CRQ","ISSUE DWS","LATE RESPONSE TIF"],
    datasets: [
      {
        data: datachart,
        backgroundColor: "rgba(20, 76, 106, 1)",
        barThickness:35
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout:{
        padding:{
            top:20,
            bottom:0
        }
    },
    scales: {
      x: {
        stacked: false,
        ticks: {
        font: {
          size: 10 // ubah sesuai kebutuhan
        },
      },
            grid: {
            drawBorder: true,
            drawOnChartArea: false
        }
      },
      y: {
        min: 0,
        max: Math.max(...datachart),
        ticks: {
            stepSize: 2,
            autoSkip:true,
            callback: (value) => value,
        },
        grid: {
            drawTicks: true,
        }
    },
    },
    plugins: {
      legend: {
        display:false,
        position: "bottom",
        labels:{
            boxWidth:12
        }
      },
      title: {
        display: true,
        text: "",
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

  return <div style={{ height: "190px",width:"100%" }}><Bar data={data} options={options} /></div>;
};
const TOPOLDEST =({sitegroup,week})=>{
    const [TOP,setTOP] = useState([])
    async function TopOldest(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=top-oldest&sitegroup='+sitegroup)
        let {data} = await res.json();
        setTOP(data)
    }

    useEffect(()=>{
        TopOldest()
    },[sitegroup,week])
    return(
            <div>
                    <div className="text-md font-bold text-red-700 flex gap-2 italic">TOP 15 OLDEST TICKET</div>
                      <table className="w-full border border-gray-800 py-2 table-fixed" style={{fontWeight:'300 !important',fontSize:'0.7em'}}>
                            <thead>
                                <tr className="uppercase">
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b w-8 from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">NO</th>
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b w-20 from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">NO TICKET</th>
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">REGION</th>
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">RCA</th>
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">TTR</th>
                                    <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[2px]">LAST UPDATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TOP.length && TOP.map((T,i)=>{
                                    return(
                                    <tr key={i} style={{height:15}}>
                                        <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]">{i+1}</td>
                                        <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]">{T.ticket_id}</td>
                                        <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]">{T.region.split("-")[1]}</td>
                                        <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]">{T.rca}</td>
                                        <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]">{Number(T.ttr).toFixed(2)}</td>
                                        <td
                                        style={{
                                            fontWeight: 400,
                                            height: 10,
                                            width: 50,
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden'
                                        }}
                                        className="bg-white border border-gray-800 text-gray-800 text-center p-[2px]"
                                        >
                                        {T.last_update
                                            ? `${T.last_update.slice(0, 15)}...`
                                            : ''}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
            </div>
    )
}

const RCACHART = React.memo(({sitegroup,week})=>{
    const [DATA,setData] = useState({SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0})
    const [DATACHART,setDataChart] = useState([])
    async function ChartData(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=chart-rca-not-clear&sitegroup='+sitegroup)
        let {data} = await res.json()
        let d = []
        Object.keys(DATA).forEach((a,i)=>{
            d[i] = data[a]
        })
        setDataChart([...d])
        // setData({...d})
    }
    useEffect(()=>{
        ChartData()
    },[sitegroup,week])
    return(
        <div>
            <div className="text-gray-800 font-bold text-center" style={{fontSize:'0.8em'}}>RCA TICKET NOT CLEAR</div>
            <StackedBarChart datachart={DATACHART}></StackedBarChart>
        </div>
    )
})
const RESUME = React.memo(({week,sitegroup})=>{
    const [CLOSED,setCLOSED] = useState([])
    const [OPEN,setOPEN] = useState([])
    async function ChartData(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=resume&week=${week.split('-')[0]}&year=${week.split('-')[1]}&sitegroup=${sitegroup}`)
        let {data} = await res.json()
        setCLOSED([...data.CLOSED])
        setOPEN([...data.OPEN])
    }
    useEffect(()=>{
        ChartData()
    },[sitegroup,week])
    return(
        <div>
            <div className="text-md font-bold text-red-700 flex gap-2 italic">RESUME</div>
            <div className="flex flex-col items-center justify-center w-full">  
                <div className="grid grid-cols-3 font-bold py-2 bg-sky-700 text-white rounded-t-lg text-md w-full text-center">
                    <div>TOTAL TICKET</div>
                    <div>CLEAR</div>
                    <div>NOT CLEAR</div>
                </div>
                <div className="grid grid-cols-3 text-center rounded-b-lg text-sm bg-to-green-600 flex flex-col items-center bg-linear-to-r from-sky-600 to-gray-300 w-full justify-center py-2">
                    <div className="text-3xl cursor-pointer pt-2 font-bold text-white">{CLOSED.length+OPEN.length}</div>
                    <div className="text-3xl cursor-pointer pt-2 font-bold text-green-700 border-l border-r border-white">{CLOSED.length}</div>
                    <div className="text-3xl cursor-pointer pt-2 font-bold text-red-600">{OPEN.length}</div>
                    <div className="text-3xl pb-2 text-white"></div>
                    <div className="text-md pb-2 text-gray-800 border-l border-r border-white">{(CLOSED.length/(CLOSED.length+OPEN.length)*100).toFixed(2)}%</div>
                    <div className="text-md pb-2 text-gray-800">{(OPEN.length/(CLOSED.length+OPEN.length)*100).toFixed(2)}%</div>
                </div>
            </div>
        </div>
    )
})

const TABLERCANOTCLEAR = React.memo(({sitegroup,week})=>{
    const RESETTB = {
        SUMBAGUT : {total_ticket:0},
        SUMBAGSEL : {total_ticket:0},
        "JABOTABEK INNER" : {total_ticket:0},
        "JAWA BARAT" : {total_ticket:0},
        "JAWA TENGAH" : {total_ticket:0},
        "JAWA TIMUR" : {total_ticket:0},
        BALINUSRA : {total_ticket:0},
        KALIMANTAN : {total_ticket:0},
        SULAWESI : {total_ticket:0},
        SUMBAGTENG : {total_ticket:0},
        PUMA : {total_ticket:0},
        "JABOTABEK OUTER" : {total_ticket:0},
    }

    const RESETDETAIL = {
        SUMBAGUT : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        SUMBAGSEL : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        "JABOTABEK INNER" : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        "JAWA BARAT" : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        "JAWA TENGAH" : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        "JAWA TIMUR" : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        BALINUSRA : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        KALIMANTAN : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        SULAWESI : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        SUMBAGTENG : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        PUMA : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
        "JABOTABEK OUTER" : {SPMS:0,ISR:0,QE:0,"ISSUE TSEL":0,WARRANTY:0,COMCASE:0,"WAITING CRA/CRQ":0,"ISSUE DWS":0,"LATE RESPONSE TIF":0},
    }
    const [TB,setTB]=useState(RESETTB)
    const [POP,setPOP] = useState(false)
    const [DATA,setDATA] = useState([])
    const [POPDATA,setPOPDATA] = useState({})
    const [DETAIL,setDETAIL]=useState(RESETDETAIL)
    async function TableData(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=detail-rca-not-clear&sitegroup='+sitegroup)
        let {data} = await res.json()
        let d = RESETTB
        Object.keys(data.total_ticket).forEach(a=>{
            d[a.split("-")[1]] && (d[a.split("-")[1]].total_ticket=data.total_ticket[a])
        })

        let e = RESETDETAIL
        Object.keys(data.detail).forEach(a=>{
            Object.keys(data.detail[a]).forEach(b=>{
                e[a.split("-")[1]]&& (e[a.split("-")[1]][b]=data.detail[a][b])
            })
        })
        setDETAIL(e)
        setTB({...d})
        // console.log(DETAIL,e)
    }

    async function PopTable(region,rca){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=pop-not-clear&region=${region}&rca=${rca}&sitegroup=${sitegroup}`)
        let {data} = await res.json()
        setPOPDATA(data)
        
        setPOP(true);
        // setTITLEPOP("SITE POTENTIAL PACKET LOSS 5%")
    }


    useEffect(()=>{
        TableData()
    },[sitegroup,week])
    return(
        <div>
            {POP && <PopupTTR close={()=>setPOP(!POP)} data={POPDATA}></PopupTTR>}
            <div className="text-md font-bold text-red-700 flex gap-2 italic">RCA TICKET NOT CLEAR</div>
            <table className="w-full border border-gray-800 py-2 table-fixed" style={{fontWeight:'300 !important',fontSize:'0.7em'}}>
                    <thead>
                        <tr className="uppercase">
                            <th style={{fontWeight:'600'}} rowSpan={2} className="bg-linear-to-b w-40 from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Region</th>
                            <th style={{fontWeight:'600'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Ticket Not Clear</th>
                            <th style={{fontWeight:'600'}} colSpan={7} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Sow TIF</th>
                            <th style={{fontWeight:'600'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Sow TELKOM</th>
                            <th style={{fontWeight:'600'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Sow TSEL</th>
                        </tr>
                        <tr className="uppercase">
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">SPMS</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">ISR</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">TRANSPORT</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">QE</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">COMCASE</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">CERAGON</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">LATE RESPON</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">WARRANTY</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">ISSUE DWS</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">ISSUE TSEL</th>
                            <th style={{fontWeight:'600'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">WAITING CRA/CRQ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(RESETTB).map((T,i)=>{
                            return(
                            <tr key={i}>
                            <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-left p-[3px]">{String(i+1).padStart(2,'0')+'-'+T.replace('_',' ')}</td>
                            <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{TB[T]?TB[T].total_ticket : 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'SPMS')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["SPMS"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'ISR')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["ISR"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'TRANSPORT')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["TRANSPORT"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'QE')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["QE"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'COMCASE')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["COMCASE"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'CERAGON')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["CERAGON"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'LATE RESPON')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["LATE RESPON"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'WARRANTY')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["WARRANTY"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'ISSUE DWS')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["ISSUE DWS"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'ISSUE TSEL')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["ISSUE TSEL"] || 0}</td>
                            <td onClick={()=>PopTable(String(i+1).padStart(2,'0')+'-'+T.replace('_',' '),'WAITING CRA/CRQ')} style={{fontWeight:'400'}} className="bg-white cursor-pointer border border-gray-800 text-gray-800 text-center p-[3px]">{DETAIL[T]["WAITING CRA/CRQ"] || 0}</td>
                            </tr>
                        )})}
                        <tr>
                            <td style={{fontWeight:'700'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-left p-[3px]">Nationwide</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(TB).map(a=>TB[a].total_ticket||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].SPMS||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].ISR||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].TRANSPORT||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].QE||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].COMCASE||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].CERAGON||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a]["LATE RESPON"]||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a].WARRANTY||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a]["ISSUE DWS"]||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a]["ISSUE TSEL"]||0).reduce((a,b)=>a+b)}</td>
                            <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DETAIL).map(a=>DETAIL[a]["WAITING CRA/CRQ"]||0).reduce((a,b)=>a+b)}</td>
                        </tr>
                    </tbody>
            </table>
        </div>
    )
})
const MTTR=({parameter,week})=>{
    const [refresh,setRefresh] = useState(false)
    const [TOP,setTOP] = useState([
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
        {ticket:'aksdkjasd',region:'SUMBAGUT',rca:'ISR',last_update:''},
    ]) 

    useEffect(()=>{
        setRefresh(!refresh)
    },[week])
    
    return(
            <div className="grid w-full col-span-2 gap-2" style={{gridTemplateColumns:'0.5fr 1fr'}}>
                <RESUME week={week} sitegroup={parameter.split(' ')[1]}></RESUME>
                <RCACHART week={week} sitegroup={parameter.split(' ')[1]}></RCACHART>
                <TOPOLDEST week={week} sitegroup={parameter.split(' ')[1]}></TOPOLDEST>
                <TABLERCANOTCLEAR week={week} sitegroup={parameter.split(' ')[1]}></TABLERCANOTCLEAR>
            </div>
    )
}

export default MTTR