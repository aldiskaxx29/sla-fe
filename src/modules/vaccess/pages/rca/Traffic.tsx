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
import Popup from "./Popup";

ChartJS.register(
        ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);
const StackedBarChart = ({labels,chartdata,PopChart}) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "OGP",
        data: chartdata.OGP,
        backgroundColor: "rgba(237, 189, 65, 1)",
        barThickness:35,
        minBarLength: 0
      },
      {
        label: "Close", 
        data: chartdata.close,
        backgroundColor: "rgba(16, 71, 97, 1)",
        barThickness:35,
        minBarLength: 0
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
        stacked: true,
        ticks:{
            font:{
                weight:'bold',
            },
            // color: 'black'
        }
      },
      y: {
        min: 0,
        // max: Math.max([...chartdata.OGP.map(a=>Number(a))]),
        ticks: {
            stepSize: 10,
            autoSkip:true,
            callback: (value) => value,
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
        const action = ["Capacity", "Technical", "Impact Gamas", "Issue TSEL"]
        PopChart(label,dataset.label)
        // POP()
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
        //   label: function(context) {
        //     const datasetIndex = context.datasetIndex;
        //     const dataIndex = context.dataIndex;
        //     const datasets = context.chart.data.datasets;

        //     const label = context.dataset.label || '';
        //     const value = context.raw;

        //     // Kalau dataset kedua → tampilkan hasil pengurangan
        //     if (datasetIndex === 1) {
        //       const total = datasets[0].data[dataIndex];
        //       const result = total - value;
        //       return Math.abs(result);
        //     }

        //     // Dataset pertama normal
        //     return Math.abs(value);
        //   }
        }
      },
      datalabels: {
        // display: function(context) {
        //   // Hanya tampilkan di dataset terakhir
        //   return context.datasetIndex === context.chart.data.datasets.length - 1;
        // },
        // formatter: function(value, context) {
        //   let sum = 0;
        //   const dataArr = context.chart.data.datasets;

        //   dataArr.forEach(dataset => {
        //     sum += dataset.data[context.dataIndex];
        //   });

        //   return sum;
        // },
        anchor: 'end',
        align: 'end',
        font: {
          weight: 'bold'
        }
      }
    //   datalabels: {
    //     anchor: 'end',
    //     align: 'top',
    //     formatter: (v) => v,
    //     offset: 0,
    //     font: {
    //         size: 12,
    //         weight: 'bold',
    //         color: '#000'
    //     }
    //     }
    },
  };

  return <div style={{ height: "25vh",width:"100%" }}><Bar data={data} style={{width:1000}} options={options} /></div>;
};
const TRAFFIC = React.memo(({ShowPopup,mode,week,setLOADING})=>{
    const [refresh,setRefresh] = useState(false)
    const [POPUP,setPOPUP] = useState(false)
    const [POPDATA,setPOPDATA] = useState([])
    const [NASIONAL,setNasional] = useState(0)
    const [LABELS,setLabels] = useState([])
    const [DATACHART,setDataChart] = useState({})
    const [DATATABLE,setDataTable] = useState({progress:{},sites:{}})
    const TB = {
        SUMBAGUT :{},
        SUMBAGSEL :{},
        JABOTABEK_INNER :{},
        JAWA_BARAT :{},
        JAWA_TENGAH :{},
        JAWA_TIMUR :{},
        BALI_NUSRA :{},
        KALIMANTAN :{},
        SULAWESI :{},
        SUMBAGTENG :{},
        PUMA :{},
        JABOTABEK_OUTER :{},
    }

    const [PROGRES,setProgress] = useState(TB)

    
    async function Nasional(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=rca-'+mode.split('_')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}&dist=${mode.split('_')[1]}`)
        let {data} = await res.json()
        try {
            setNasional(data.length)
            
        } catch (error) {
            
        }
    }
    async function Table(){
        setLOADING(true)
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=table-recon&traffic='+mode.split('_')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}&dist=${mode.split('_')[1]}`)
        let {data} = await res.json()
        try {
            let d = {progress:{},sites:{}}
            d.progress = {...data.progress}
            d.sites = {...data.site_not_clear}
            DATATABLE.progress = d.progress
            DATATABLE.sites = d.sites
            setDataTable({...DATATABLE})
            let c = TB

            Object.keys(TB).forEach(b=>{
                try {
                c[b].total_site = d.sites.hasOwnProperty(b.replace('_',' ')) ? DATATABLE.sites[b.replace('_',' ')].length : 0
                LABELS.forEach(m=>{
                    if(!c.hasOwnProperty(b)){
                        c[b]={}
                    }
                    c[b]['t_'+m.toLowerCase()] = 0
                    c[b]['p_'+m.toLowerCase()] = 0
                    c[b]['t_'+m.toLowerCase()] = d.sites.hasOwnProperty(b.replace('_',' ')) ? DATATABLE.sites[b.replace('_',' ')].filter(a=>a.rca==m).length : 0
                        if(d.progress.hasOwnProperty(b.replace('_',' '))){
                            if(DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='CLOSED').length>0 && DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='OGP').length>0){
                                c[b]['p_'+m.toLowerCase()] = DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='CLOSED').length/(DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='CLOSED').length+DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='OGP').length)*100
                            }else if(DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='CLOSED').length>0 && DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='OGP').length==0){
                                c[b]['p_'+m.toLowerCase()] = 100
                            }else if(DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='CLOSED').length==0 && DATATABLE.progress[b.replace('_',' ')].filter(a=>a.rca==m && a.status=='OGP').length>0){
                                c[b]['p_'+m.toLowerCase()] = 0
                            }
                        }else{
                        //   c[b.replace('_',' ')].p_capacity = 100
                        }
                    })
                 } catch (error) {
                    // console.log(error,b)
                }
            })

            setProgress(c)
            if(data){
                setLOADING(false)
            }
            setRefresh(!refresh)

        } catch (error) {
            
        }
    }

    function formatNumber(num) {
      return Number.isInteger(num) 
        ? num.toString() 
        : num.toFixed(2);
    }
    async function ChartData(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=chart-recon&traffic='+mode.split('_')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}&dist=${mode.split('_')[1]}`)
        let {data} = await res.json()
        let chart = {OGP:[],close:[]}
        let group = []

        Object.keys(data).forEach(a=>{
            group.push(a)
        });
        let blankI = group.findIndex(a => a === 'BLANK');

        if (blankI !== -1) {
            group.splice(blankI, 1); // hapus BLANK
            group.push('BLANK');     // tambah ke akhir
        }
        setLabels(group)

        group.forEach((a,i)=>{
                try {
                    chart['OGP'].push(data[a]['OGP'] || 0)
                } catch (error) {
                    chart['OGP'].push(0)
                }

                try {
                    chart['close'].push(data[a]['CLOSED'] || 0)
                } catch (error) {
                    chart['close'].push(0)
                }
        })

        setDataChart({OGP:chart.OGP,close:chart.close})
    }

    async function PopTable(region,rca){
        let POPD = []
        if(region!='nationwide' && rca!=''){
            POPD = DATATABLE.sites[region].filter(a=>a.rca==rca).map(a=>a) || []
        }else if(region!='nationwide' && rca==''){
            POPD = DATATABLE.sites[region].map(a=>a) || []
        }else if(region=='nationwide' && rca==''){
            Object.keys(DATATABLE.sites).forEach(a=>{
                POPD = [...POPD,...DATATABLE.sites[a].map(a=>a)]
            })
        }else if(region=='nationwide' && rca!=''){
            Object.keys(DATATABLE.sites).forEach(a=>{
                POPD = [...POPD,...DATATABLE.sites[a].filter(a=>a.rca==rca).map(a=>a)]
            })
        }
        setPOPUP(true);
        setPOPDATA(POPD)
    }

    async function PopChart(rca,status){
        let POPD = []
        Object.keys(DATATABLE.sites).forEach(a=>{
            POPD = [...POPD,...DATATABLE.sites[a].filter(a=>a.rca==rca && a.status.toUpperCase().includes(status.toUpperCase())).map(a=>a)]
        })
        setPOPUP(true);
        setPOPDATA(POPD)
    }

    useEffect(()=>{
        if(week){
            Nasional()
            ChartData()
        }
    },[mode,week])
    useEffect(()=>{
        if(week){
            Table()
        }
    },[LABELS])
    if(LABELS.length)
    return(
    <React.Fragment>
          <div style={{height:'88vh'}}>
                {POPUP && <Popup close={()=>setPOPUP(false)} data={POPDATA}></Popup>}
                <div className="text-md font-bold text-red-700 flex gap-2">RESUME RCA</div>
                <div className="grid grid-cols-6" style={{height:'30%'}}>
                    <div className="flex flex-col items-center justify-center w-full">
                        <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center">NASIONAL</div>
                        <div className="rounded-b-lg flex flex-col items-center bg-linear-to-r from-sky-600 to-gray-300 w-full justify-center py-2" style={{height:'55%'}}>
                            <div onClick={ShowPopup} className="cursor-pointer text-3xl py-2 font-bold text-red-600">{NASIONAL}</div>
                            <div className="font-semibold">SITE</div>
                            <div className="font-semibold">NOT CLEAR</div>
                        </div>
                    </div>
                    <div className="col-span-5">
                        <div className="px-10">
                            <StackedBarChart labels={LABELS} chartdata={DATACHART} PopChart={PopChart}></StackedBarChart>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                    <div className="col-span-7">
                        <table className="w-full border border-white py-2" style={{fontWeight:'300 !important',fontSize:'0.7em',height:'55vh'}}>
                            <thead className="font-bold">
                                <tr className="uppercase">
                                    <th style={{fontWeight:'500'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-white text-white p-[3px]">Region</th>
                                    <th style={{fontWeight:'500'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-white text-white p-[3px]">Total Site Not Clear</th>
                                    {LABELS.map((a,i)=>{
                                        return(
                                        <th key={i} style={{fontWeight:'500'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-white text-white p-[3px]">{a}</th>
                                    )})}
                                </tr>
                                <tr className="uppercase">
                                    {LABELS.map((a,i)=>{
                                        return(
                                        <React.Fragment key={i}>
                                            <th style={{fontWeight:'500'}} className="bg-sky-500 border border-white text-white p-[3px]">Total Site</th>
                                            <th style={{fontWeight:'500'}} className="bg-sky-500 border border-white text-white p-[3px]">Progress</th>
                                        </React.Fragment>
                                    )})}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(TB).map((T,i)=>{
                                    return(
                                    <tr key={i} onClick={ShowPopup}>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-white text-gray-800 text-left p-[3px]">{String(i+1).padStart(2,'0')+'-'+T.replace('_',' ')}</td>
                                    <td onClick={()=>PopTable(T.replace('_',' '),'')} style={{fontWeight:'400'}} className="cursor-pointer bg-white border border-white text-gray-800 text-center p-[3px]">{PROGRES[T] && PROGRES[T].total_site || 0}</td>
                                    {LABELS.map((a,x)=>{
                                        return(<React.Fragment key={a}>
                                            <td onClick={()=>PopTable(T.replace('_',' '),a)} style={{fontWeight:'400'}} className={`${x%2 ? 'bg-white' : 'bg-gray-200'} border border-white text-gray-800 text-center p-[3px] cursor-pointer`}>{PROGRES[T] && PROGRES[T]['t_'+a.toLowerCase()] || 0}</td>
                                            <td style={{fontWeight:'400',color:PROGRES[T] && PROGRES[T]['p_'+a.toLowerCase()]>80? 'green' : (PROGRES[T] && PROGRES[T]['p_'+a.toLowerCase()]<80 && PROGRES[T]['p_'+a.toLowerCase()]!=0 ? 'red' : 'black')}} className={`${x%2 ? 'bg-white' : 'bg-gray-200'} border border-white text-gray-800 text-center p-[3px] cursor-pointer`}>{PROGRES[T] && formatNumber(Math.abs(PROGRES[T]['p_'+a.toLowerCase()])) || 0}%</td>
                                        </React.Fragment>
                                    )})}
                                    </tr>
                                )})}
                                <tr>
                                    <td style={{fontWeight:'700'}} className="bg-yellow-400 border border-white text-gray-800 text-left p-[3px]">Nationwide</td>
                                    <td onClick={()=>PopTable('nationwide','')} style={{fontWeight:'400'}} className="cursor-pointer bg-yellow-400 border border-white text-gray-800 text-center p-[3px]">{Object.keys(DATATABLE.sites).length>0 ? Object.keys(DATATABLE.sites).map(a=>DATATABLE.sites[a].length).reduce((a,b)=>a+b) : 0}</td>
                                    {LABELS.map(c=>{
                                        return(
                                        <React.Fragment key={c}>
                                            <td onClick={()=>PopTable('nationwide',c)} style={{fontWeight:'600'}} className="bg-yellow-400 border border-white text-gray-800 text-center p-[3px] cursor-pointer">{Object.keys(PROGRES).map(a=>PROGRES[a]['t_'+c.toLowerCase()]).reduce((a,b)=>a+b) || 0}</td>
                                            <td style={{fontWeight:'600'}} className="bg-yellow-400 border border-white text-gray-800 text-center p-[3px]">{formatNumber(Object.keys(PROGRES).map(a=>PROGRES[a]['p_'+c.toLowerCase()]).reduce((a,b)=>a+b)/Object.keys(PROGRES).map(a=>PROGRES[a]['p_'+c.toLowerCase()]!=0?1:0).reduce((a,b)=>a+b) || 0)}%</td>
                                        </React.Fragment>
                                    )})}
                               </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {week && <ActionPlanProgress mode={mode} week={week} DATATABLE={DATATABLE} LABELS={LABELS}></ActionPlanProgress>}
    </React.Fragment>
    )
})

export default TRAFFIC