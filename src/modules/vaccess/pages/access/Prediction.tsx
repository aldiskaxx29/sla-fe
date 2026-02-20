import { useEffect, useState } from "react";
import Popup from "./Popup";
import { FileExcelFilled } from "@ant-design/icons";
import DailyTracking from "./DailyTracking";
import * as XLSX from "xlsx";


function getStartEnd(date = new Date()) {
    if([5,6,0].includes(date.getDay())){
        date.setDate(date.getDate()-4)
    }
  const current = new Date(date);
  const day = current.getDay(); // 0=Min, 1=Sen, ..., 5=Jum

  // jarak ke Jumat
  const diffToFriday = (day >= 5)
    ? day - 5
    : day + 2;

  // awal minggu (Jumat)
  const start = new Date(current);
  start.setDate(current.getDate() - diffToFriday);

  // akhir minggu (Kamis)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: formatYMD(start),
    end: formatYMD(end),
    startText: formatID(start),
    endText: formatID(end),
    currentText: formatID(date)
  };
}

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatID(date) {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

function getWeek(date = new Date()) {
  const year = date.getFullYear();

  // Cari Jumat pertama di tahun
  const firstDayOfYear = new Date(year, 0, 1);
  const firstFriday = new Date(firstDayOfYear);

  const day = firstDayOfYear.getDay(); // 0=Min, 1=Sen, ..., 5=Jum
  const offset = (5 - day + 7) % 7;
  firstFriday.setDate(firstDayOfYear.getDate() + offset);

  // Jika tanggal sebelum Jumat pertama → dianggap week 1
  if (date < firstFriday) return 1;

  // Hitung selisih hari
  const diffDays = Math.floor(
    (date - firstFriday) / (1000 * 60 * 60 * 24)
  );

  // Setiap 7 hari = 1 week
  return Math.floor(diffDays / 7) + 1;
}

const Prediction = ()=>{
    const [MAX_DATE,setMAXDATE] = useState("")
    const [PL18,setPL18] = useState(0)
    const [PL18DATA,setPL18DATA] = useState([])
    const [JIT2,setJIT2] = useState(0)
    const [JIT2DATA,setJIT2DATA] = useState([])
    const [JITTER2,setJITTER2] = useState(0)
    const [PDETAIL,setPDetail] = useState([])
    const [POPDATA,setPOPDATA] = useState([])
    const [POPMODE,setPOPMODE] = useState("")
    
    const [POP,setPOP] = useState(false)
    const [TITLEPOP,setTITLEPOP] = useState("")
    const RESETTB = {
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
    }
    
    const RESETTBSITE = {
        SUMBAGUT : {total_site:0,target_lat:0,treshold_lat:96.55,target_jit:0,treshold_jit:98.87},
        SUMBAGSEL : {total_site:0,target_lat:0,treshold_lat:89.08,target_jit:0,treshold_jit:98.45},
        JABOTABEK_INNER : {total_site:0,target_lat:0,treshold_lat:98.62,target_jit:0,treshold_jit:99.95},
        JAWA_BARAT : {total_site:0,target_lat:0,treshold_lat:97.63,target_jit:0,treshold_jit:99.96},
        JAWA_TENGAH : {total_site:0,target_lat:0,treshold_lat:99.07,target_jit:0,treshold_jit:99.99},
        JAWA_TIMUR : {total_site:0,target_lat:0,treshold_lat:98.79,target_jit:0,treshold_jit:99.95},
        BALINUSRA : {total_site:0,target_lat:0,treshold_lat:83.32,target_jit:0,treshold_jit:99.78},
        KALIMANTAN : {total_site:0,target_lat:0,treshold_lat:97.21,target_jit:0,treshold_jit:98.73},
        SULAWESI : {total_site:0,target_lat:0,treshold_lat:89.04,target_jit:0,treshold_jit:97.63},
        SUMBAGTENG : {total_site:0,target_lat:0,treshold_lat:87.89,target_jit:0,treshold_jit:98.73},
        PUMA : {total_site:0,target_lat:0,treshold_lat:94.83,target_jit:0,treshold_jit:97.49},
        JABOTABEK_OUTER : {total_site:0,target_lat:0,treshold_lat:98.70,target_jit:0,treshold_jit:99.95}
    }

    const [TBSITE,setTBSITE] = useState({
        SUMBAGUT : {total_site:0,target_lat:0,treshold_lat:96.55,target_jit:0,treshold_jit:98.87},
        SUMBAGSEL : {total_site:0,target_lat:0,treshold_lat:89.08,target_jit:0,treshold_jit:98.45},
        JABOTABEK_INNER : {total_site:0,target_lat:0,treshold_lat:98.62,target_jit:0,treshold_jit:99.95},
        JAWA_BARAT : {total_site:0,target_lat:0,treshold_lat:97.63,target_jit:0,treshold_jit:99.96},
        JAWA_TENGAH : {total_site:0,target_lat:0,treshold_lat:99.07,target_jit:0,treshold_jit:99.99},
        JAWA_TIMUR : {total_site:0,target_lat:0,treshold_lat:98.79,target_jit:0,treshold_jit:99.95},
        BALINUSRA : {total_site:0,target_lat:0,treshold_lat:83.32,target_jit:0,treshold_jit:99.78},
        KALIMANTAN : {total_site:0,target_lat:0,treshold_lat:97.21,target_jit:0,treshold_jit:98.73},
        SULAWESI : {total_site:0,target_lat:0,treshold_lat:89.04,target_jit:0,treshold_jit:97.63},
        SUMBAGTENG : {total_site:0,target_lat:0,treshold_lat:87.89,target_jit:0,treshold_jit:98.73},
        PUMA : {total_site:0,target_lat:0,treshold_lat:94.83,target_jit:0,treshold_jit:97.49},
        JABOTABEK_OUTER : {total_site:0,target_lat:0,treshold_lat:98.70,target_jit:0,treshold_jit:99.95}
    })

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

    async function SitePL18(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=site-pl-18-hours&week=${getWeek(new Date(MAX_DATE))}`)
        let {data} = await res.json()
        setPL18(data.length)
        setPL18DATA(data)
    }
    async function SiteJit2Days(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=site-jitter-2days`)
        let {data} = await res.json()
        setJIT2(data.length)
        setJIT2DATA(data)
    }
    async function PredictionWeek(start,end){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=prediction-week&start=${start}&end=${end}`)
        let {data} = await res.json()
        let TBT = RESETTBSITE
        // let TBT = {}
        Object.keys(data).forEach(a=>{
            TBT[a.replace(' ','_')].total_site=Number(data[a].total_site)
            // TBT[a.replace(' ','_')].target_lat = (((100-Number(TBSITE[a.replace(' ','_')].treshold_lat))/100)*Number(TBSITE[a.replace(' ','_')].total_site))
            // TBT[a.replace(' ','_')].target_jit = (((100-Number(TBSITE[a.replace(' ','_')].treshold_jit))/100)*Number(TBSITE[a.replace(' ','_')].total_site))
        })
        setTBSITE({...TBT})
    }
    async function PredictionWeekDetail(start,end){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=prediction-week-detail&start=${start}&end=${end}`)
        let {data} = await res.json()
        let TBT = RESETTB
        data.forEach((a)=>{
            try {
                if(Number(a.pl5)>=4 && TBT[a.region.replace(" ","_")]){
                TBT[a.region.replace(" ","_")].r_pl5+=1
                }
                if(Number(a.pl15)>=4 && TBT[a.region.replace(" ","_")]){
                    TBT[a.region.replace(" ","_")].r_pl15+=1
                }
                if(Number(a.lat)>=4 && TBT[a.region.replace(" ","_")]){
                    TBT[a.region.replace(" ","_")].r_lat+=1
                }
                if(Number(a.jit)>=4 && TBT[a.region.replace(" ","_")]){
                    TBT[a.region.replace(" ","_")].r_jit+=1
                }
            } catch (error) {
                console.log(error)
            }
        })        
        setTB({...TBT})
        setPDetail(data)
        PredictionWeek(start,end)
    }

    function exportExcel() {
        const table = document.getElementById("excel-prediction");
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        let filename = "PREDIKSI W"+getWeek(new Date(MAX_DATE))+"_"+Date.now()
        XLSX.writeFile(wb, filename+".xlsx");
    }

    

    function PopTable(region,mode){
        setPOPMODE(mode)
        if(region=='nationwide'){
            setPOPDATA(PDETAIL.filter(a=>a[mode]>=4).map(a=>{
            let c=a
            c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]
            return c}))
        }else{
            setPOPDATA(PDETAIL.filter(a=>a.region==region && a[mode]>=4).map(a=>{
            let c=a
            c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]
            return c}))
        }
        setPOP(true);
        if(mode=='pl5'){
            setTITLEPOP("SITE POTENTIAL PACKET LOSS 5%")
        }else if(mode=='pl15'){
            setTITLEPOP("SITE POTENTIAL PACKET LOSS 1-5%")
        }else if(mode=='lat'){
            setTITLEPOP("SITE POTENTIAL LATENCY")
        }else if(mode=='jit'){
            setTITLEPOP("SITE POTENTIAL JITTER")
        }
    }

    function PopPL18Hours(){
        setPOPMODE('pl')
        setPOPDATA(PL18DATA.map(a=>{
        let c=a
        c.pop_value = a['av_pl']
        return c}))
        setPOP(true);setTITLEPOP("SITE DAILY PACKET LOSS - 18 HOURS")
    }

    function PopJITTER(){
        setPOPMODE('jit')
        setPOPDATA(JIT2DATA.map(a=>{
        let c=a
        c.pop_value = a['av_jit']
        return c}))
        setPOP(true);setTITLEPOP("SITE DAILY JITTER - 2 DAYS")
    }  

    async function currentUpdateState(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=max-date`)
        let {data} = await res.json()
        setMAXDATE(data.max_date)
    }

    useEffect(()=>{
        currentUpdateState()
        SitePL18()
        SiteJit2Days()
    },[])
    
    useEffect(()=>{
        if(MAX_DATE){
            let {start,end}= getStartEnd(new Date(MAX_DATE))
            PredictionWeekDetail(start,end)
        }
    },[MAX_DATE])

 
    if(MAX_DATE)
    return (
        <div className="bg-white h-full text-gray-800 p-2" style={{fontFamily:'Poppins'}}>
            {POP && <Popup title={TITLEPOP} close={setPOP} data={POPDATA} mode={POPMODE}></Popup>}
            <div className="grid grid-cols-7 mb-1">
                <div className="col-span-6 flex justify-between items-center">
                    <div className="text-md font-bold text-red-700 flex gap-2">PREDIKSI <div>W{getWeek(new Date(MAX_DATE))} ({getStartEnd(new Date(MAX_DATE)).startText} - {getStartEnd(new Date(MAX_DATE)).currentText})</div></div>
                    <div onClick={exportExcel} className="cursor-pointer flex items-center gap-1" style={{fontSize:'0.8em'}}>
                        Export As Excel
                        <FileExcelFilled style={{color:'green',fontSize:'1.7em'}}></FileExcelFilled>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-4" >
                <div className="col-span-6">
                    <table id="excel-prediction" className="w-full border border-gray-800 py-2" style={{fontWeight:'300 !important',fontSize:'0.7em',height:'47vh'}}>
                        <thead>
                            <tr>
                                <th style={{fontWeight:'400'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Region</th>
                                <th style={{fontWeight:'400'}} rowSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Total Site</th>
                                <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Packet Loss 5%</th>
                                <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Packet Loss 1-5%</th>
                                <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Latency</th>
                                <th style={{fontWeight:'400'}} colSpan={2} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Jitter</th>
                            </tr>
                            <tr>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Target</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Realisasi</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Target</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Realisasi</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Target</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Realisasi</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Target</th>
                                <th style={{fontWeight:'400'}} className="bg-linear-to-b from-sky-900 to-sky-700 border border-gray-800 text-white p-[3.5px]">Realisasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(TBSITE).map((T,i)=>{
                                return(
                                <tr key={i}>
                                <td id={T} style={{fontWeight:'400'}} className={((TB[T].r_pl5>TB[T].t_pl5 || TB[T].r_pl15>TB[T].t_pl15 || TB[T].r_lat>Number(((100-TBSITE[T].treshold_lat)/100*Number(TBSITE[T].total_site)).toFixed(0)) || TB[T].r_jit>Number(((100-TBSITE[T].treshold_jit)/100*Number(TBSITE[T].total_site)).toFixed(0))) ?'bg-red-100' :'bg-white')+` border border-gray-800 text-gray-800 text-left p-[3.5px]`}>{String(i+1).padStart(2,'0')+'-'+T.replace('_',' ')}</td>
                                <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3.5px]">{TBSITE[T].total_site}</td>
                                <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3.5px]">{TB[T].t_pl5}</td>
                                <td onClick={()=>PopTable(T.replace("_"," "),'pl5')} style={{fontWeight:'400'}} className={(TB[T].r_pl5>TB[T].t_pl5 ?'text-red-600 ' :'text-gray-800 ')+` cursor-pointer bg-white border border-gray-800 text-center p-[3.5px]`}>{TB[T].r_pl5}</td>
                                <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3.5px]">{TB[T].t_pl15}</td>
                                <td onClick={()=>PopTable(T.replace("_"," "),'pl15')} style={{fontWeight:'400'}} className={(TB[T].r_pl15>TB[T].t_pl15 ?'text-red-600 ' :'text-gray-800 ')+` cursor-pointer bg-white border border-gray-800 text-center p-[3.5px]`}>{TB[T].r_pl15}</td>
                                <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3.5px]">{Number(((100-TBSITE[T].treshold_lat)/100*Number(TBSITE[T].total_site)).toFixed(0))}</td>
                                <td onClick={()=>PopTable(T.replace("_"," "),'lat')} style={{fontWeight:'400'}} className={(TB[T].r_lat>Number(((100-TBSITE[T].treshold_lat)/100*Number(TBSITE[T].total_site)).toFixed(0)) ?'text-red-600 ' :'text-gray-800 ')+` cursor-pointer bg-white border border-gray-800 text-center p-[3.5px]`}>{TB[T].r_lat}</td>
                                <td style={{fontWeight:'400'}} className="bg-white border border-gray-800 text-gray-800 text-center p-[3.5px]">{Number(((100-TBSITE[T].treshold_jit)/100*Number(TBSITE[T].total_site)).toFixed(0))}</td>
                                <td onClick={()=>PopTable(T.replace("_"," "),'jit')} style={{fontWeight:'400'}} className={(TB[T].r_jit>Number(((100-TBSITE[T].treshold_jit)/100*Number(TBSITE[T].total_site)).toFixed(0)) ?'text-red-600 ' :'text-gray-800 ')+` cursor-pointer bg-white border border-gray-800 text-center p-[3.5px]`}>{TB[T].r_jit}</td>
                                </tr>
                            )})}
                            <tr>
                                <td style={{fontWeight:'700'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-left p-[3.5px]">Nationwide</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px]">{Object.keys(TBSITE).map(a=>Number(TBSITE[a].total_site)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px]">{Object.keys(TB).map(a=>Number(TB[a].t_pl5)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px] cursor-pointer" onClick={()=>PopTable('nationwide','pl5')}>{Object.keys(TB).map(a=>Number(TB[a].r_pl5)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px]">{Object.keys(TB).map(a=>Number(TB[a].t_pl15)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px] cursor-pointer" onClick={()=>PopTable('nationwide','pl15')}>{Object.keys(TB).map(a=>Number(TB[a].r_pl15)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px]">{Object.keys(TBSITE).map(a=>Number(((100-Number(TBSITE[a].treshold_lat))/100*Number(TBSITE[a].total_site)).toFixed(0))).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px] cursor-pointer" onClick={()=>PopTable('nationwide','lat')}>{Object.keys(TB).map(a=>Number(TB[a].r_lat)).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px]">{Object.keys(TBSITE).map(a=>Number(((100-Number(TBSITE[a].treshold_jit))/100*Number(TBSITE[a].total_site)).toFixed(0))).reduce((a,b)=>a+b)}</td>
                                <td style={{fontWeight:'400'}} className="bg-yellow-400 border border-gray-800 text-gray-800 text-center p-[3.5px] cursor-pointer" onClick={()=>PopTable('nationwide','jit')}>{Object.keys(TB).map(a=>Number(TB[a].r_jit)).reduce((a,b)=>a+b)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="grid grid-rows-2 gap-3">
                    <div>
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center font-bold">SITE PL 18 HOURS</div>
                            <div className="rounded-b-lg text-sm bg-to-green-600 flex flex-col items-center bg-linear-to-r from-sky-400 to-sky-200 w-full justify-center py-2">
                                <div onClick={PopPL18Hours} className="cursor-pointer text-3xl py-2 font-bold text-sky-800">{PL18}</div>
                                <div>SITE</div>
                                <div>PACKETLOSS</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center font-bold">SITE JITTER 2 DAYS</div>
                            <div className="rounded-b-lg text-sm bg-to-green-600 flex flex-col items-center bg-linear-to-r from-sky-400 to-sky-200 w-full justify-center py-2">
                                <div onClick={PopJITTER} className="cursor-pointer text-3xl py-2 font-bold text-red-600">{JIT2}</div>
                                <div>SITE</div>
                                <div>JITTER</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DailyTracking start={getStartEnd(new Date(MAX_DATE)).start} end={getStartEnd(new Date(MAX_DATE)).end}></DailyTracking>
    </div>);
}

export default Prediction 