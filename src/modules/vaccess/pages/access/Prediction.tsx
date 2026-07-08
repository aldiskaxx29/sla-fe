import { useEffect, useState } from "react";
import Popup from "./Popup";
import { FileExcelFilled } from "@ant-design/icons";
import DailyTracking from "./DailyTracking";
import * as XLSX from "xlsx";
import PopupDownload from "./PopupDownload";
import { qosmoUrl } from "@/modules/vaccess/utils/qosmoApi";
import { Skeleton } from "antd";

let HEADER = {headers:{Rtoken:''}}
try {
    let data = JSON.parse(localStorage.getItem('user_data')??"{}")
    HEADER = {headers:{
        Rtoken:btoa(data.level_user)
    }}
} catch (error) {
    // console.log(error)
}

function getStartEnd(date = new Date(),max_date=new Date()) {
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
    let currentText = ""
    let currentDate = ""
    let now = new Date()
    if(end<now){
        currentText = formatID(end)
        currentDate = formatYMD(end)
    }else{
        currentText = formatID(date)
        currentDate = formatYMD(date)
    }
  return {
    start: formatYMD(start),
    end: formatYMD(end),
    startText: formatID(start),
    endText: formatID(end),
    currentText: currentText,
    currentDate:currentDate
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

  const firstDayOfYear = new Date(year, 0, 1);
  const firstFriday = new Date(firstDayOfYear);

  // Cari Jumat pertama
  const offset = (5 - firstFriday.getDay() + 7) % 7;
  firstFriday.setDate(firstFriday.getDate() + offset);

  // Kalau sebelum Jumat pertama → hitung dari tahun sebelumnya
  if (date < firstFriday) {
    return getWeek(new Date(year - 1, 11, 31));
  }

  const diffDays = Math.floor(
    (date - firstFriday) / (1000 * 60 * 60 * 24)
  );

//   console.log(diffDays,date)
  return Math.floor(diffDays / 7) + 1;
}

const Prediction = ()=>{
    const [MAX_DATE,setMAXDATE] = useState(formatYMD(new Date()))
    const [topLoading,setTopLoading] = useState(true)
    const [maxDateReady,setMaxDateReady] = useState(false)
    const [PL18,setPL18] = useState(0)
    const [PL18DATA,setPL18DATA] = useState([])
    const [JIT2,setJIT2] = useState(0)
    const [JIT2DATA,setJIT2DATA] = useState([])
    const [JITTER2,setJITTER2] = useState(0)
    const [PDETAIL,setPDetail] = useState([])
    const [POPDATA,setPOPDATA] = useState([])
    const [RAWDATA,setRAWDATA] = useState([])
    const [RAWDATALAST,setRAWDATALAST] = useState([])
    const [LAST,setLAST] = useState([])
    const [NOW,setNOW] = useState([])
    const [POPDOWNLOAD,setPOPDOWNLOAD] = useState(false)
    const [POPMODE,setPOPMODE] = useState("")
    
    const [POP,setPOP] = useState(false)
    const [TITLEPOP,setTITLEPOP] = useState("")
    const RESETTB = {
        SUMBAGUT : {total_site:0,t_pl5:11,t_pl15:38,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGSEL : {total_site:0,t_pl5:11,t_pl15:53,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_BARAT : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TENGAH : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TIMUR : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        BALINUSRA : {total_site:0,t_pl5:11,t_pl15:19,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        KALIMANTAN : {total_site:0,t_pl5:11,t_pl15:52,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SULAWESI : {total_site:0,t_pl5:12,t_pl15:25,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGTENG : {total_site:0,t_pl5:11,t_pl15:35,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        PUMA : {total_site:0,t_pl5:11,t_pl15:20,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_OUTER : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
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
        SUMBAGUT : {total_site:0,t_pl5:11,t_pl15:38,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGSEL : {total_site:0,t_pl5:11,t_pl15:53,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_BARAT : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TENGAH : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JAWA_TIMUR : {total_site:0,t_pl5:0,t_pl15:2,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        BALINUSRA : {total_site:0,t_pl5:11,t_pl15:19,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        KALIMANTAN : {total_site:0,t_pl5:11,t_pl15:52,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SULAWESI : {total_site:0,t_pl5:12,t_pl15:25,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        SUMBAGTENG : {total_site:0,t_pl5:11,t_pl15:35,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        PUMA : {total_site:0,t_pl5:11,t_pl15:20,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
        JABOTABEK_OUTER : {total_site:0,t_pl5:0,t_pl15:1,t_lat:25,t_jit:25,r_pl5:0,r_pl15:0,r_lat:0,r_jit:0},
    })

    function getRange7Hari(tanggal){

        const end = new Date(tanggal);
        const start = new Date(tanggal);

        end.setDate(end.getDate() - 1);
        start.setDate(start.getDate() - 7);

        const format = (date)=>{
            const y = date.getFullYear();
            const m = String(date.getMonth()+1).padStart(2,'0');
            const d = String(date.getDate()).padStart(2,'0');
            return `${y}-${m}-${d}`;
        }

        return {
            start_date: format(start),
            end_date: format(end)
        }
    }

    function exportRAW() {
        if (!RAWDATA || RAWDATA.length === 0) {
            return;
            alert('Data Raw Not Ready Yet')
        }

        // ambil header dari key object pertama
        const headers = Object.keys(RAWDATA[0]);

        // convert ke worksheet
        const worksheet = XLSX.utils.json_to_sheet(RAWDATA, { header: headers });

        // buat workbook
        const workbook = XLSX.utils.book_new();

        // tambahkan sheet
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

        // download file
        let {start,end}= getStartEnd(new Date(MAX_DATE))
        let filename = "RAW THIS WEEK-"+`${start}`+`-${end}`
        XLSX.writeFile(workbook, filename+".xlsx");
    }

    function exportRAWLAST() {
        if (!RAWDATALAST || RAWDATALAST.length === 0) {
            return;
            alert('Data Raw Not Ready Yet')
        }

        // ambil header dari key object pertama
        const headers = Object.keys(RAWDATALAST[0]);

        // convert ke worksheet
        const worksheet = XLSX.utils.json_to_sheet(RAWDATALAST, { header: headers });

        // buat workbook
        const workbook = XLSX.utils.book_new();

        // tambahkan sheet
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

        // download file
        let {start,end}= getStartEnd(new Date(MAX_DATE))
        let {start_date,end_date} = getRange7Hari(start)
        let filename = "RAW LAST WEEK-"+`${start_date}`+`-${end_date}`
        XLSX.writeFile(workbook, filename+".xlsx");
    }

    async function SitePL18(start,end){
        let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=site-pl-18-hours&week=${getWeek(new Date(MAX_DATE))}&start=${start}&end=${end}`),HEADER)
        let {data} = await res.json()
        setPL18(data.length)
        setPL18DATA(data)
    }
    async function SiteJit2Days(){
        let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=site-jitter-2days`),HEADER)
        let {data} = await res.json()
        setJIT2(data.length)
        setJIT2DATA(data)
    }
    async function PredictionWeek(start,end){
        let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=prediction-week&start=${start}&end=${end}`),HEADER)
        let {data} = await res.json()
        let TBT = RESETTBSITE
        // let TBT = {}
        Object.keys(data).forEach(a=>{
            TBT[a.replace(' ','_')].total_site=Number(data[a].total_site)
        })
        setTBSITE({...TBT})
    }

    // async function PredictionWeekDetail(start,end){
    //     let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=prediction-week-detail&start=${start}&end=${end}`),HEADER)
    //     let {data} = await res.json()
    //     // console.log('tess', data)
    //     let TBT = RESETTB
    //     let dmax = data.map(a=>Number(a.lat));
    //     let MAX = Math.max(...dmax);
    //     // console.log(MAX,dmax);
    //     data.forEach((a)=>{
    //         try {
    //             if(Number(a.pl5)>=MAX && TBT[a.region.replace(" ","_")]){
    //                 TBT[a.region.replace(" ","_")].r_pl5+=1
    //             }
    //             if(Number(a.pl15)>=MAX && TBT[a.region.replace(" ","_")]){
    //                 TBT[a.region.replace(" ","_")].r_pl15+=1
    //             }
    //             if(Number(a.lat)>=MAX && TBT[a.region.replace(" ","_")]){
    //                 TBT[a.region.replace(" ","_")].r_lat+=1
    //             }
    //             if(Number(a.jit)>=MAX && TBT[a.region.replace(" ","_")]){
    //                 TBT[a.region.replace(" ","_")].r_jit+=1
    //             }
    //         } catch (error) {
    //             // console.log(error)
    //         }
    //     })        
    //     setTB({...TBT})
    //     setPDetail(data)
    //     PredictionWeek(start,end)
    // }

    async function PredictionWeekDetail(start,end){
        let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=prediction-week-detail&start=${start}&end=${end}`),HEADER)
        let {data} = await res.json()
        let TBT = RESETTB
    
        data.forEach((a)=>{
            try {
                const region = a.region.replace(" ","_")
                if(!TBT[region]) return
                if(a.status_pl !== 'CONSECUTIVE') return
    
                if(Number(a.pl5)>0){
                    TBT[region].r_pl5+=1
                }
                if(Number(a.pl15)>0){
                    TBT[region].r_pl15+=1
                }
                if(Number(a.lat)>0){
                    TBT[region].r_lat+=1
                }
                if(Number(a.jit)>0){
                    TBT[region].r_jit+=1
                }
            } catch (error) {
                // console.log(error)
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

    // function PopTable(region,mode){
    //     setPOPMODE(mode)
    //     let dmax = PDETAIL.map(a=>Number(a.lat));
    //     let MAX = Math.max(...dmax);
    //     if(region=='nationwide'){
    //         // console.log(PDETAIL.filter(a=>a[mode]>=MAX && [...Object.keys(TBSITE).map(a=>a.replace("_"," "))].includes(a.region)))
    //         setPOPDATA(PDETAIL.filter(a=>a[mode]>=MAX && [...Object.keys(TBSITE).map(a=>a.replace("_"," "))].includes(a.region)).map(a=>{
    //         let c=a
    //         c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]

    //         if(mode!='lat' && mode!='jit'){
    //             c.pl_last = a['pl_last'];
    //         }
    //         return c}))
    //     }else{
    //         setPOPDATA(PDETAIL.filter(a=>a.region==region && a[mode]>=MAX).map(a=>{
    //         let c=a
    //         c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]

    //         if(mode!='lat' && mode!='jit'){
    //             c.pl_last = a['pl_last'];
    //         }

    //         return c}))
    //     }
    //     setPOP(true);
    //     if(mode=='pl5'){
    //         setTITLEPOP("SITE POTENTIAL PACKET LOSS 5%")
    //     }else if(mode=='pl15'){
    //         setTITLEPOP("SITE POTENTIAL PACKET LOSS 1-5%")
    //     }else if(mode=='lat'){
    //         setTITLEPOP("SITE POTENTIAL LATENCY")
    //     }else if(mode=='jit'){
    //         setTITLEPOP("SITE POTENTIAL JITTER")
    //     }
    // }

    function PopTable(region,mode){
        setPOPMODE(mode)
    
        if(region=='nationwide'){
            setPOPDATA(PDETAIL.filter(a=>a.status_pl==='CONSECUTIVE' && Number(a[mode])>0 && [...Object.keys(TBSITE).map(a=>a.replace("_"," "))].includes(a.region)).map(a=>{
            let c=a
            c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]
            if(mode!='lat' && mode!='jit'){
                c.pl_last = a['pl_last'];
            }
            return c}))
        }else{
            setPOPDATA(PDETAIL.filter(a=>a.region==region && a.status_pl==='CONSECUTIVE' && Number(a[mode])>0).map(a=>{
            let c=a
            c.pop_value = a['av_'+(mode=='lat' ||mode=='jit' ? mode :'pl')]
            if(mode!='lat' && mode!='jit'){
                c.pl_last = a['pl_last'];
            }
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
        try {
            let res = await fetch(qosmoUrl(`/baseapi/vaccess.php?cmd=max-date`),HEADER)
            let {data} = await res.json()
            setMAXDATE(data.max_date)
            setMaxDateReady(true)
        } catch (error) {
            setMaxDateReady(true)
        }
    }

    useEffect(()=>{
        setTopLoading(true)
        currentUpdateState()
        SiteJit2Days()
    },[])
    
    useEffect(()=>{
        if(!maxDateReady){
            return
        }

        let cancelled = false

        const loadTopSection = async () => {
            setTopLoading(true)
            try {
                let {start,end}= getStartEnd(new Date(MAX_DATE))
                await Promise.all([
                    SitePL18(start,end),
                    PredictionWeekDetail(start,end)
                ])
            } finally {
                if(!cancelled){
                    setTopLoading(false)
                }
            }
        }

        loadTopSection()

        return () => {
            cancelled = true
        }
    },[MAX_DATE,maxDateReady])

    // console.log('TBSITE',TBSITE)
    return (
        <div className="bg-white h-full text-gray-800 p-2" style={{fontFamily:'Poppins'}}>
            {POP && <Popup title={TITLEPOP} close={setPOP} data={POPDATA} mode={POPMODE}></Popup>}
            {POPDOWNLOAD && <PopupDownload RAWDATA={RAWDATA} RAWDATALAST={RAWDATALAST} LAST={exportRAWLAST} NOW={exportRAW} close={setPOPDOWNLOAD}></PopupDownload>}
            <div>
                <div className="grid grid-cols-7 mb-1">
                    <div className="col-span-6 flex justify-between items-center">
                        <div className="text-md font-bold text-red-700 flex gap-2">PREDIKSI <div>W{getWeek(new Date(getStartEnd(new  Date(MAX_DATE)).currentDate))} ({getStartEnd(new Date(MAX_DATE)).startText} - {getStartEnd(new Date(MAX_DATE),new Date(MAX_DATE)).currentText})</div></div>
                        <div onClick={()=>setPOPDOWNLOAD(true)} className="cursor-pointer flex items-center gap-1" style={{fontSize:'0.8em',color:RAWDATA.length ? 'black' :'gray'}}>
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
                            {topLoading ? (
                                Array.from({ length: 12 }).map((_, i) => (
                                    <tr key={`prediction-skeleton-${i}`}>
                                        {Array.from({ length: 10 }).map((__, j) => (
                                            <td
                                                key={`prediction-skeleton-${i}-${j}`}
                                                className="border border-gray-800 bg-white p-[3.5px]"
                                            >
                                                <Skeleton.Input
                                                    active
                                                    size="small"
                                                    style={{ width: "100%" }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <>
                                    {Object.keys(TBSITE).map((T,i)=>(
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
                                    ))}
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
                                </>
                            )}
                        </tbody>
                    </table>
                    </div>
                    <div className="grid grid-rows-2 gap-3">
                        <div>
                            <div className="flex flex-col items-center justify-center w-full">
                                <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center font-bold">SITE PL 18 HOURS</div>
                                <div className="rounded-b-lg text-sm bg-to-green-600 flex flex-col items-center bg-linear-to-r from-sky-400 to-sky-200 w-full justify-center py-2">
                                    {topLoading ? (
                                        <div className="w-full px-4 py-2">
                                            <Skeleton.Input active size="large" style={{ width: "100%", height: 42 }} />
                                            <div className="mt-3 flex flex-col items-center gap-2">
                                                <Skeleton.Input active size="small" style={{ width: "55%" }} />
                                                <Skeleton.Input active size="small" style={{ width: "70%" }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div onClick={PopPL18Hours} className="cursor-pointer text-3xl py-2 font-bold text-sky-800">{PL18}</div>
                                            <div>SITE</div>
                                            <div>PACKETLOSS</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col items-center justify-center w-full">
                                <div className="py-2 bg-sky-700 text-white rounded-t-lg text-lg w-full text-center font-bold">SITE JITTER 2 DAYS</div>
                                <div className="rounded-b-lg text-sm bg-to-green-600 flex flex-col items-center bg-linear-to-r from-sky-400 to-sky-200 w-full justify-center py-2">
                                    {topLoading ? (
                                        <div className="w-full px-4 py-2">
                                            <Skeleton.Input active size="large" style={{ width: "100%", height: 42 }} />
                                            <div className="mt-3 flex flex-col items-center gap-2">
                                                <Skeleton.Input active size="small" style={{ width: "55%" }} />
                                                <Skeleton.Input active size="small" style={{ width: "60%" }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div onClick={PopJITTER} className="cursor-pointer text-3xl py-2 font-bold text-red-600">{JIT2}</div>
                                            <div>SITE</div>
                                            <div>JITTER</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DailyTracking start={getStartEnd(new Date(MAX_DATE)).start} end={getStartEnd(new Date(MAX_DATE)).end}></DailyTracking>
    </div>);
}

export default Prediction 
