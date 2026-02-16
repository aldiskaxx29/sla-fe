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
const StackedBarChart = ({chartdata}) => {
  const data = {
    labels: ["Capacity", "Technical", "Impcat Gamas", "Issue TSEL"],
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
            bottom:0
        }
    },
    scales: {
      x: {
        stacked: true,
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
          label: function(context) {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const datasets = context.chart.data.datasets;

            const label = context.dataset.label || '';
            const value = context.raw;

            // Kalau dataset kedua → tampilkan hasil pengurangan
            if (datasetIndex === 1) {
              const total = datasets[0].data[dataIndex];
              const result = total - value;
              return Math.abs(result);
            }

            // Dataset pertama normal
            return Math.abs(value);
          }
        }
      },
      datalabels: {
        display: function(context) {
          // Hanya tampilkan di dataset terakhir
          return context.datasetIndex === context.chart.data.datasets.length - 1;
        },
        formatter: function(value, context) {
          let sum = 0;
          const dataArr = context.chart.data.datasets;

          dataArr.forEach(dataset => {
            sum += dataset.data[context.dataIndex];
          });

          return sum;
        },
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

  return <div style={{ height: "205px",width:"100%" }}><Bar data={data} style={{width:1000}} options={options} /></div>;
};
export default ({ShowPopup,mode,week})=>{
    const [NASIONAL,setNasional] = useState(0)
    const [DATACHART,setDataChart] = useState({})
    const [DATATABLE,setDataTable] = useState({progress:{},sites:{}})
    const TB = {
        SUMBAGUT : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        SUMBAGSEL : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        JABOTABEK_INNER : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        JAWA_BARAT : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        JAWA_TENGAH : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        JAWA_TIMUR : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        BALI_NUSRA : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        KALIMANTAN : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        SULAWESI : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        SUMBAGTENG : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        PUMA : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
        JABOTABEK_OUTER : {total_site:0,t_capacity:0,p_capacity:0,t_gamas:0,p_gamas:0,t_technical:0,p_technical:0,t_tsel:0,p_tsel:0},
    }

    const [PROGRES,setProgress] = useState(TB)
    async function Nasional(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=rca-'+mode.split('-')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}`)
        let {data} = await res.json()
        try {
            setNasional(data.length)
            
        } catch (error) {
            
        }
    }
    async function Table(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=table-recon&traffic='+mode.split('-')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}`)
        let {data} = await res.json()
        try {
            let d = {progress:{},sites:{}}
            d.progress = {...data.progress}
            d.sites = {...data.site_not_clear}
            DATATABLE.progress = d.progress
            DATATABLE.sites = d.sites
            setDataTable({...DATATABLE})
            let c = TB

            Object.keys(TB).forEach(a=>{
                c[a].total_site = d.sites.hasOwnProperty(a) ? DATATABLE.sites[a].length : 0
                c[a].t_capacity = d.sites.hasOwnProperty(a) ? DATATABLE.sites[a].filter(a=>a.rca=='Capacity').length : 0
                c[a].t_gamas = d.sites.hasOwnProperty(a) ? DATATABLE.sites[a].filter(a=>a.rca=='Impact Gamas').length : 0
                c[a].t_technical = d.sites.hasOwnProperty(a) ? DATATABLE.sites[a].filter(a=>a.rca=='Technical').length : 0
                c[a].t_tsel = d.sites.hasOwnProperty(a) ? DATATABLE.sites[a].filter(a=>a.rca=='Issue TSEL').length : 0
                // c[a].p_capacity = d.progress.hasOwnProperty(a) ? (DATATABLE.progress[a].filter(a=>a.rca=='Capacity' && a.status=='Closed').length+DATATABLE.progress[a].filter(a=>a.rca=='Capacity' && a.status=='OGP').length) : 0
            })

            setProgress(c)
        } catch (error) {
            
        }
    }

    async function ChartData(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=chart-recon`)
        let {data} = await res.json()
        let chart = {OGP:[],close:[]}
        let group = ['Capacity','Technical','Impact Gamas','Issue TSEL']
        group.forEach((a,i)=>{
            chart['OGP'].push(data[a]['OGP'] || 0)
            chart['close'].push(data[a]['Closed']+data[a]['OGP'] || 0)
        })
        setDataChart({...chart})
    }

    function Progress(region,rca){
        DATATABLE.progress[T.replace('_',' ')] ? ((DATATABLE.progress[T.replace('_',' ')].filter(a=>a.status=='Closed').length/(DATATABLE.progress[T.replace('_',' ')].filter(a=>a.status=='OGP').length+DATATABLE.progress[T.replace('_',' ')].filter(a=>a.status=='Closed').length))*100).toFixed(2) : 0
    }
    useEffect(()=>{
        if(week){
            Nasional()
            ChartData()
            Table()
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
                            <StackedBarChart chartdata={DATACHART}></StackedBarChart>
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
                                    <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3px]">Issue TSEL</th>
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
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].total_site || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].t_capacity || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].p_capacity || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].t_gamas || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].p_gamas || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].t_technical || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].p_technical || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].t_tsel || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3px]">{PROGRES[T.replace('_',' ')] && PROGRES[T.replace('_',' ')].p_tsel || 0}</td>
                                    </tr>
                                )})}
                                <tr onClick={ShowPopup}>
                                    <td style={{fontWeight:'700'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-left p-[3px]">Nationwide</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(DATATABLE.sites).length>0 ? Object.keys(DATATABLE.sites).map(a=>DATATABLE.sites[a].length).reduce((a,b)=>a+b) : 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].t_capacity).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].p_capacity).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].t_gamas).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].p_gamas).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].t_technical).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].p_technical).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].t_tsel).reduce((a,b)=>a+b) || 0}</td>
                                    <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3px]">{Object.keys(PROGRES).map(a=>PROGRES[a].p_tsel).reduce((a,b)=>a+b) || 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ActionPlanProgress mode={mode} week={week}></ActionPlanProgress>
    </React.Fragment>
    )
}