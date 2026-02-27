import {
 RightOutlined,
 CaretDownOutlined,UploadOutlined
} from "@ant-design/icons";

import ActionPlanProgress from "./ActionPlanProgress";

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

import Traffic from "./Traffic";
import React, { useEffect, useState } from "react";
import MTTR from "./Mttr";
import Popup from "./Popup";
import PopupUpload from "./PopupUpload";
function getFriday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Min ... 5=Jum
  const diff = (day >= 5) ? day - 5 : day + 2;
  d.setDate(d.getDate() - diff);
  return d;
}
function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekNumberFriday(date) {
  const d = new Date(date);
  const year = d.getFullYear();

  // 1 Januari tahun tersebut
  const jan1 = new Date(year, 0, 1);

  // Cari Jumat pertama
  const firstFriday = new Date(jan1);
  const day = jan1.getDay(); // 0=Sun ... 5=Fri
  const diff = (5 - day + 7) % 7;
  firstFriday.setDate(jan1.getDate() + diff);

  // Kalau tanggal sebelum Jumat pertama,
  // berarti masuk week terakhir tahun sebelumnya
  if (d < firstFriday) {
    return getWeekNumberFriday(new Date(year - 1, 11, 31));
  }

  const daysDiff = Math.floor((d - firstFriday) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}


function generate52Weeks(max_year=0,max_week=0,totalWeeks = 52, today = new Date()) {
  const result = [];

  const currentFriday = getFriday(today);

  const startFriday = new Date(currentFriday);
  startFriday.setDate(startFriday.getDate() - (totalWeeks - 1) * 7);

  let cursor = new Date(startFriday);

  while (cursor <= currentFriday) {
    const start = new Date(cursor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if(start.getFullYear()==max_year && getWeekNumberFriday(start)>max_week){
      continue;
    }else{
      result.push({
        year: start.getFullYear(),
        week: getWeekNumberFriday(start),
        start: formatYMD(start),
        end: formatYMD(end)
      });
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return result.reverse();
}

// function formatYMD(date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// function generateWeeksByMonth(year, month) {
//   const result = [];

//   const firstDay = new Date(year, month - 1, 1);
//   const lastDay = new Date(year, month, 0);

//   // Week 1–4 (fixed 7 harian dari tanggal 1)
//   for (let i = 0; i < 4; i++) {
//     const start = new Date(year, month - 1, 1 + i * 7);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 6);

//     if (start > lastDay) break;

//     if (end > lastDay) {
//       end.setTime(lastDay.getTime());
//     }

//     result.push({
//       year,
//       month,
//       week: i + 1,
//       label: `W${i + 1}`,
//       start: formatYMD(start),
//       end: formatYMD(end)
//     });
//   }

//   // Tambahkan FM (Full Month)
//   result.push({
//     year,
//     month,
//     week: "FM",
//     label: "FM",
//     start: formatYMD(firstDay),
//     end: formatYMD(lastDay)
//   });

//   return result;
// }

function generateWeeksByMonth(year, month) {
  const result = [];

  const jan1 = new Date(year, 0, 1);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  let cursor = new Date(jan1);
  let week = 1;

  while (cursor <= lastDayOfMonth) {
    const start = new Date(cursor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    // cek apakah week ini bersinggungan dengan bulan yg dipilih
    if (end >= firstDayOfMonth && start <= lastDayOfMonth) {
      result.push({
        year,
        month,
        week,
        label: `W${week}`,
        start: formatYMD(start),
        end: formatYMD(end > lastDayOfMonth ? lastDayOfMonth : end)
      });
    }

    week++;
    cursor.setDate(cursor.getDate() + 7);
  }

  // Tambah FM (Full Month)
  result.push({
    year,
    month,
    week: "FM",
    label: "FM",
    start: formatYMD(firstDayOfMonth),
    end: formatYMD(lastDayOfMonth)
  });

  return result;
}

const ResumeRCA = ()=>{
    const [PARAMETER,setParameter] = useState('MTTRq Critical')
     const [FILTER] = useState({max_year:0,max_week:0,years:[]})
    const [WEEK,setWeek] = useState("")
    const [WEEKTTR,setWeekTTR] = useState("")
    const [YEAR,setYear] = useState(0)
    const [MONTH,setMonth] = useState(1)
    const [MAXYEAR,setMaxYear] = useState(0)
    const [MAXWEEK,setMaxWeek] = useState(0)
    const [YEARS,setYEARS] = useState([])
    const [POPUPLOAD,setPOPUPLOAD] = useState(false)
    const MONTHS = [
      {month:1,name:'January'},
      {month:2,name:'February'},
      {month:3,name:'March'},
      {month:4,name:'April'},
      {month:5,name:'May'},
      {month:6,name:'June'},
      {month:7,name:'July'},
      {month:8,name:'August'},
      {month:9,name:'September'},
      {month:10,name:'October'},
      {month:11,name:'November'},
      {month:12,name:'December'},
    ]
    // const [YEARS,setYEARS] = useState([])
    const WEEKS52 = React.useMemo(() => {
      return generate52Weeks(FILTER.max_year, FILTER.max_week)
    }, [FILTER.max_year, FILTER.max_week])

    const [WEEKSRCA,setWeekRCA] = useState([])


    async function setWeekFilter(){
      let D = {}
      if(!PARAMETER.includes('MTTR')){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=last-week-twamp`)
        let {data} = await res.json()
        D=data
      }else{
         let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vrca.php?cmd=last-week-ticket`)
          let {data} = await res.json()
          D=data
      }

      const maxWeek = Number(D.max_week)
      const maxYear = Number(D.max_year)
      setYear(D.max_year)
      setMaxYear(Number(maxYear))
      setMaxWeek(Number(maxWeek))
      setWeek(`${maxWeek}-${maxYear}`)
    }

    useEffect(()=>{
        setWeekFilter()
        let now = new Date()
        for(let i=Number(now.getFullYear());i>=2025;i--){
          YEARS.push(i)
        }
          setMonth(now.getMonth()+1)
    },[])

    useEffect(()=>{
        let wrca = generateWeeksByMonth(2026,MONTH)
        setWeekRCA([...wrca])
    },[MONTH])

    
    
    if(WEEK){
    return (
        <div className="bg-white text-gray-800 p-2 grid grid-cols-2 gap-2" style={{fontFamily:'Poppins'}}>
            {POPUPLOAD && <PopupUpload close={()=>setPOPUPLOAD(false)}></PopupUpload>}
            <div className="flex gap-2" style={{fontSize:'0.8em'}}>
                <div className="flex">
                    <div className="border px-4 py-1 rounded-l-sm">PARAMETER</div>
                    <select onChange={(e)=>setParameter(e.target.value)} value={PARAMETER} className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                        <option value="packetloss_>5%">Packetloss 5%</option>
                        <option value={"packetloss_1-5%"}>Packetloss 1-5%</option>
                        <option value={"latency"}>LATENCY</option>
                        <option value={"jitter"}>JITTER</option>
                        <option>MTTRq Critical</option>
                        <option>MTTRq Major</option>
                        <option>MTTRq Minor</option>
                    </select>
                </div>
                {PARAMETER.includes('MTTR') && (<React.Fragment>
                  <div className="flex">
                      <div className="border px-4 py-1 rounded-l-sm">Year</div>
                      <select onChange={(e)=>setYear(e.target.value)} name="" id="" className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                          {YEARS.map((a,i)=>{
                              return(<option value={a} key={i}>{a}</option>)
                          })}
                      </select>
                  </div>
                  <div className="flex">
                      <div className="border px-4 py-1 rounded-l-sm">Month</div>
                      <select onChange={(e)=>setMonth(e.target.value)} value={MONTH} name="" id="" className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                          {MONTHS.map((a,i)=>{
                            if(YEAR==(new Date()).getFullYear() && a.month<=(new Date()).getMonth()+1){
                              return(<option value={a.month} key={i} selected={MONTH==a.month ? true :false}>{a.name}</option>)
                            }else if(YEAR<(new Date()).getFullYear()){
                              return(<option value={a.month} key={i} selected={MONTH==a.month ? true :false}>{a.name}</option>)
                            }
                          })}
                      </select>
                  </div>
                  <div className="flex">
                      <div className="border px-4 py-1 rounded-l-sm">WEEK</div>
                      <select onChange={(e)=>setWeek(e.target.value)} name="" id="" className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                          {WEEKSRCA.map((a,i)=>{
                              if(YEAR==(new Date()).getFullYear() && Number(a.week)<=MAXWEEK){
                                return(<option value={`${a.week}-${YEAR}`} key={i}>{`W${a.week} ${YEAR}`}</option>)
                              }else if(YEAR<(new Date()).getFullYear()){
                                return(<option value={`${a.week}-${YEAR}`} key={i}>{`W${a.week} ${YEAR}`}</option>)
                              }
                          })}
                      </select>
                  </div>
                  </React.Fragment>
                )}
                {
                  !PARAMETER.includes('MTTR') && <div className="flex">
                    <div className="border px-4 py-1 rounded-l-sm">WEEK</div>
                    <select onChange={(e)=> setWeek(e.target.value)} className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                        {WEEKS52.map((a,i)=>{
                            if((Number(a.year)<MAXYEAR) || (Number(a.year)==MAXYEAR && a.week<=MAXWEEK)){
                              return(<option value={`${a.week}-${a.year}`} key={i}>{`W${a.week} ${a.year}`}</option>)
                            }
                        })}
                    </select>
                    {/* <div className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">W10 <CaretDownOutlined/></div> */}
                  </div>
                  
                }
                {
                  !PARAMETER.includes('MTTR') && <div onClick={()=>setPOPUPLOAD(true)} className="cursor-pointer text-white flex gap-2 items-center py-1 px-3 rounded-sm bg-sky-700"><UploadOutlined></UploadOutlined>Upload</div>
                }
            </div>
            <div></div>
            {(PARAMETER!='MTTRq Major' && PARAMETER!='MTTRq Minor' && PARAMETER!='MTTRq Critical') ? <Traffic mode={PARAMETER} week={WEEK}/> : <MTTR parameter={PARAMETER} week={WEEK}/>}
        </div>
);}
}

export default ResumeRCA