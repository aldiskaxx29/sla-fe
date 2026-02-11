import {
 RightOutlined,
 CaretDownOutlined
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
import { useEffect, useState } from "react";
import MTTR from "./Mttr";
import Popup from "./Popup";
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
  const year = date.getFullYear();

  // Jumat pertama di tahun
  const firstDay = new Date(year, 0, 1);
  const firstFriday = getFriday(firstDay);

  // pastikan Jumat pertama benar-benar di tahun berjalan
  if (firstFriday.getFullYear() < year) {
    firstFriday.setDate(firstFriday.getDate() + 7);
  }

  const currentFriday = getFriday(date);

  const diffDays = Math.floor(
    (currentFriday - firstFriday) / (1000 * 60 * 60 * 24)
  );

  return Math.floor(diffDays / 7) + 1;
}


function generate52Weeks(totalWeeks = 52, today = new Date()) {
  const result = [];

  const currentFriday = getFriday(today);

  const startFriday = new Date(currentFriday);
  startFriday.setDate(startFriday.getDate() - (totalWeeks - 1) * 7);

  let cursor = new Date(startFriday);

  while (cursor <= currentFriday) {
    const start = new Date(cursor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    result.push({
      year: start.getFullYear(),
      week: getWeekNumberFriday(start),
      start: formatYMD(start),
      end: formatYMD(end)
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return result.reverse();
}




const ResumeRCA = ()=>{
    const [PARAMETER,setParameter] = useState('LATENCY')
    const [POP,setPOP] = useState(false)
    const [WEEK,setWeek] = useState("")
    function PopTable(){
        setPOP(true);
    }
    let WEEKS52 = generate52Weeks()
    
    useEffect(()=>{
        // console.log(generate52Weeks())
        setWeek(`${WEEKS52[0].week}-${WEEKS52[0].year}`)
        // console.log(WEEK,WEEKS52[0].week)
    },[])
    
    return (
        <div className="bg-white text-gray-800 p-2 grid grid-cols-2 gap-2" style={{fontFamily:'Poppins'}}>
            {POP && <Popup close={setPOP}></Popup>}
            <div className="flex gap-2" style={{fontSize:'0.8em'}}>
                <div className="flex">
                    <div className="border px-4 py-1 rounded-l-sm">PARAMETER</div>
                    <select onChange={(e)=>setParameter(e.target.value)} className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                        <option value="packetloss-5%">PL 5%</option>
                        <option value={"packetloss-1-5%"}>PL 1-5%</option>
                        <option value={"latency"}>LATENCY</option>
                        <option value={"jitter"}>JITTER</option>
                        <option>MTTRq Major</option>
                        <option>MTTRq Minor</option>
                    </select>
                </div>
                <div className="flex">
                    <div className="border px-4 py-1 rounded-l-sm">WEEK</div>
                    <select onChange={(e)=>setWeek(e.target.value)} name="" id="" className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">
                        {WEEKS52.map((a,i)=>{
                            return(<option value={`${a.week}-${a.year}`} key={i}>{`W${a.week} ${a.year}`}</option>)
                        })}
                    </select>
                    {/* <div className="border-r border-t border-b px-4 py-1 rounded-r-sm bg-gray-100">W10 <CaretDownOutlined/></div> */}
                </div>
            </div>
            <div></div>
            {(PARAMETER!='MTTRq Major' && PARAMETER!='MTTRq Minor') && <Traffic ShowPopup={PopTable} mode={PARAMETER} week={WEEK}/> || <MTTR parameter={PARAMETER} week={WEEK}/>}
        </div>
);
}

export default ResumeRCA