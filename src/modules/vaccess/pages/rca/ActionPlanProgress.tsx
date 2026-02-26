import {
 RightOutlined,
 CaretDownOutlined
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import Popup from "./Popup";
const ActionPlanProgress = React.memo(({mode,week,ShowPopup,DATATABLE})=>{
    const [POPUP,setPOPUP] = useState(false)
    const [POPDATA,setPOPDATA] = useState([])
    const [DATA,setData] = useState({Capacity:{OGP:[],Closed:[]},"Impact Gamas":{OGP:[],Closed:[]},Technical:{OGP:[],Closed:[]},"Issue TSEL":{OGP:[],Closed:[]}})
    const TB = {
        SUMBAGUT : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SUMBAGSEL : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        "JAWA BARAT" : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        "JAWA TENGAH" : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        "JAWA TIMUR" : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        BALINUSRA : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        KALIMANTAN : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SULAWESI : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SUMBAGTENG : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        PUMA : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JABOTABEK_OUTER : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
    }
    const [dropdown,setDropdown] = useState({
        capacity1:false,
        capacity2:false,
        capacity3:false,
        gamas1:false,
        gamas2:false,
        gamas3:false,
        tsel1:false,
        tsel2:false,
        tsel3:false,
        technical1:false,
        technical2:false,
        technical3:false,
        technical4:false,
        technical5:false,
    })

    function DropdownSelect(select){
        let dropdownT = dropdown
        dropdownT[select] = !dropdownT[select]
        setDropdown({...dropdownT})
    }

    async function PopTableAction(rca,rca2,status){
        let sites = []
        Object.keys(DATATABLE.sites).forEach(b=>{
            if(DATATABLE.sites[b]){
                let POPD = DATATABLE.sites[b].filter(a=>a.rca==rca && a.rca2==rca2 && a.status==status).map(a=>a) || [];
                sites = [...sites,...POPD]
                // console.log(sites)
            }
        })
        // console.log(DATATABLE,sites)
        setPOPUP(true);
        setPOPDATA(sites)
    }

      async function Init(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=action-plan&traffic='+mode.split('_')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}&dist=${mode.split('_')[1]}`)
        let {data} = await res.json()
        try {
            let d = DATA
            d = {...DATA,...data}
            setData(d)            
        } catch (error) {
            
        }
    }

    useEffect(()=>{
        Init()
    },[mode,week])
    
    return(
        <div className="flex flex-col">
            {POPUP && <Popup close={()=>setPOPUP(false)} data={POPDATA}></Popup>}
            <div className="text-md font-bold text-red-700 flex gap-2">ACTION PLAN & PROGRESS</div>
            <div className="grid grid-cols-2 gap-2 items-top h-full" style={{gridTemplateRows:'0.5fr 1fr'}}>
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="py-2 bg-sky-700 text-white rounded-t-lg text-md font-bold w-full text-center">CAPACITY ISSUE</div>
                    <div className="rounded-b-lg flex flex-col bg-gray-300 to-sky-200 w-full h-46 py-1 px-4">
                            <div className="uppercase w-full grid whitespace-nowrap items-center text-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800"> &nbsp;</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Action Plan</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">OGP</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Close</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Total</div>
                            </div>
                            <div className="uppercase w-full grid whitespace-nowrap items-center h-full overflow-y-auto" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">1</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('capacity1')}><RightOutlined/>Channel Spacing</div>
                                <div onClick={()=>PopTableAction('Capacity','Channel Spacing','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].OGP || {}).map(a=>DATA.Capacity["Channel Spacing"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Capacity','Channel Spacing','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].CLOSED || {}).map(a=>DATA.Capacity["Channel Spacing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].OGP || {}).map(a=>DATA.Capacity["Channel Spacing"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].CLOSED || {}).map(a=>DATA.Capacity["Channel Spacing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               
                                 {dropdown.capacity1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].OGP && DATA.Capacity["Channel Spacing"].OGP[a] ? DATA.Capacity["Channel Spacing"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].CLOSED && DATA.Capacity["Channel Spacing"].CLOSED[a] ? DATA.Capacity["Channel Spacing"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].OGP && DATA.Capacity["Channel Spacing"].OGP[a] ? DATA.Capacity["Channel Spacing"].OGP[a] : 0)+(DATA.Capacity["Channel Spacing"] && DATA.Capacity["Channel Spacing"].CLOSED && DATA.Capacity["Upgrade Redeploy"].CLOSED[a] ? DATA.Capacity["Channel Spacing"].CLOSED[a] : 0)}</div>
                                          </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('capacity2')}><RightOutlined/>Upgrade Redeploy</div>
                                <div onClick={()=>PopTableAction('Capacity','Upgrade Redeploy','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].OGP || {}).map(a=>DATA.Capacity["Upgrade Redeploy"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Capacity','Upgrade Redeploy','Closed')}  className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].CLOSED || {}).map(a=>DATA.Capacity["Upgrade Redeploy"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].OGP || {}).map(a=>DATA.Capacity["Upgrade Redeploy"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].CLOSED || {}).map(a=>DATA.Capacity["Upgrade Redeploy"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                 { dropdown.capacity2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].OGP && DATA.Capacity["Upgrade Redeploy"].OGP[a] ? DATA.Capacity["Upgrade Redeploy"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].CLOSED && DATA.Capacity["Upgrade Redeploy"].CLOSED[a] ? DATA.Capacity["Upgrade Redeploy"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].OGP && DATA.Capacity["Upgrade Redeploy"].OGP[a] ? DATA.Capacity["Upgrade Redeploy"].OGP[a] : 0)+(DATA.Capacity["Upgrade Redeploy"] && DATA.Capacity["Upgrade Redeploy"].CLOSED && DATA.Capacity["Upgrade Redeploy"].CLOSED[a] ? DATA.Capacity["Upgrade Redeploy"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('capacity3')}><RightOutlined/>New Redeploy</div>
                                <div onClick={()=>PopTableAction('Capacity','New Redeploy','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].OGP || {}).map(a=>DATA.Capacity["New Redeploy"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Capacity','New Redeploy','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].CLOSED || {}).map(a=>DATA.Capacity["New Redeploy"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].OGP || {}).map(a=>DATA.Capacity["New Redeploy"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].CLOSED || {}).map(a=>DATA.Capacity["New Redeploy"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               
                                {  dropdown.capacity3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].OGP && DATA.Capacity["New Redeploy"].OGP[a] ? DATA.Capacity["New Redeploy"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].CLOSED && DATA.Capacity["New Redeploy"].CLOSED[a] ? DATA.Capacity["New Redeploy"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].OGP && DATA.Capacity["New Redeploy"].OGP[a] ? DATA.Capacity["New Redeploy"].OGP[a] : 0)+(DATA.Capacity["New Redeploy"] && DATA.Capacity["New Redeploy"].CLOSED && DATA.Capacity["New Redeploy"].CLOSED[a] ? DATA.Capacity["New Redeploy"].CLOSED[a] : 0)}</div>
                                       </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity.OGP || {}).map(a=>DATA.Capacity.OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity.CLOSED || {}).map(a=>DATA.Capacity.CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Capacity.OGP || {}).map(a=>DATA.Capacity.OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Capacity.CLOSED || {}).map(a=>DATA.Capacity.CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                            </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="py-2 bg-sky-700 text-white rounded-t-lg text-md w-full font-bold text-center">IMPACT GAMAS</div>
                    <div className="rounded-b-lg flex flex-col bg-gray-300 to-sky-200 w-full h-46 py-1 px-4">
                            <div className="uppercase w-full grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800"> &nbsp;</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Action Plan</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">OGP</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Close</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Total</div>
                            </div>
                            <div className="uppercase w-full grid whitespace-nowrap items-center h-full overflow-y-auto" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">1</div>
                                <div className="px-2 py- border-b-2 border-gray-800 cursor-pointer whitespace-normal" onClick={()=>DropdownSelect('gamas1')}><RightOutlined/>Gamas Close, Link Back to Normal Quality</div>
                                <div onClick={()=>PopTableAction('Impact Gamas','Gamas Close','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Close"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Impact Gamas','Gamas Close','Close')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Close"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Close"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Close"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                {dropdown.gamas1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                           <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].OGP && DATA["Impact Gamas"]["Gamas Close"].OGP[a] ? DATA["Impact Gamas"]["Gamas Close"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].CLOSED && DATA["Impact Gamas"]["Gamas Close"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Close"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].OGP && DATA["Impact Gamas"]["Gamas Close"].OGP[a] ? DATA["Impact Gamas"]["Gamas Close"].OGP[a] : 0)+(DATA["Impact Gamas"]["Gamas Close"] && DATA["Impact Gamas"]["Gamas Close"].CLOSED && DATA["Impact Gamas"]["Gamas Close"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Close"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2  border-b-2 border-gray-800 cursor-pointer whitespace-normal" onClick={()=>DropdownSelect('gamas2')}><RightOutlined/>Gamas Close,Link NY Back to Normal Quality</div>
                                 <div onClick={()=>PopTableAction('Impact Gamas','Gamas Close NY','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Close NY"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Impact Gamas','Gamas Close NY','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Close NY"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                              { dropdown.gamas2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].OGP && DATA["Impact Gamas"]["Gamas Close NY"].OGP[a] ? DATA["Impact Gamas"]["Gamas Close NY"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].OGP && DATA["Impact Gamas"]["Gamas Close NY"].OGP[a] ? DATA["Impact Gamas"]["Gamas Close NY"].OGP[a] : 0)+(DATA["Impact Gamas"]["Gamas Close NY"] && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED && DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Close NY"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('gamas3')}><RightOutlined/>Gamas Open</div>
                                <div onClick={()=>PopTableAction('Impact Gamas','Gamas Open','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Open"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Impact Gamas','Gamas Open','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Open"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].OGP || {}).map(a=>DATA["Impact Gamas"]["Gamas Open"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].CLOSED || {}).map(a=>DATA["Impact Gamas"]["Gamas Open"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                              
                                {   dropdown.gamas3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].OGP && DATA["Impact Gamas"]["Gamas Open"].OGP[a] ? DATA["Impact Gamas"]["Gamas Open"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].CLOSED && DATA["Impact Gamas"]["Gamas Open"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Open"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].OGP && DATA["Impact Gamas"]["Gamas Open"].OGP[a] ? DATA["Impact Gamas"]["Gamas Open"].OGP[a] : 0)+(DATA["Impact Gamas"]["Gamas Open"] && DATA["Impact Gamas"]["Gamas Open"].CLOSED && DATA["Impact Gamas"]["Gamas Open"].CLOSED[a] ? DATA["Impact Gamas"]["Gamas Open"].CLOSED[a] : 0)}</div>
                                              </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"].OGP || {}).map(a=>DATA["Impact Gamas"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"].CLOSED || {}).map(a=>DATA["Impact Gamas"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Impact Gamas"].OGP || {}).map(a=>DATA["Impact Gamas"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Impact Gamas"].CLOSED || {}).map(a=>DATA["Impact Gamas"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                             </div>
                    </div>
                </div>
                <div className="flex flex-col items-cente justify-cente w-full">
                    <div className="py-2 bg-sky-700 text-white rounded-t-lg text-md w-full font-bold text-center">TECHNICAL ISSUE</div>
                    <div className="rounded-b-lg flex flex-col bg-gray-300 to-sky-200 w-full h-66 py-1 px-4">
                            <div className="uppercase w-full grid whitespace-nowrap items-center text-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800"> &nbsp;</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Action Plan</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">OGP</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Close</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Total</div>
                            </div>
                            <div className="uppercase w-full grid whitespace-nowrap items-center h-full overflow-y-auto" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">1</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical1')}><RightOutlined/>Redaman</div>
                                 <div onClick={()=>PopTableAction('Technical','Redaman','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].OGP || {}).map(a=>DATA.Technical["Redaman"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Technical','Redaman','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].CLOSED || {}).map(a=>DATA.Technical["Redaman"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].OGP || {}).map(a=>DATA.Technical["Redaman"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].CLOSED || {}).map(a=>DATA.Technical["Redaman"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                {dropdown.technical1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                             <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["Redaman"] && DATA.Technical["Redaman"].OGP && DATA.Technical["Redaman"].OGP[a] ? DATA.Technical["Redaman"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["Redaman"] && DATA.Technical["Redaman"].CLOSED && DATA.Technical["Redaman"].CLOSED[a] ? DATA.Technical["Redaman"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].OGP && DATA.Technical["Redaman"].OGP[a] ? DATA.Technical["Redaman"].OGP[a] : 0)+(DATA.Technical["Redaman"] && DATA.Technical["Redaman"].CLOSED && DATA.Technical["Redaman"].CLOSED[a] ? DATA.Technical["Redaman"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical2')}><RightOutlined/>CRC ROUTING</div>
                                 <div onClick={()=>PopTableAction('Technical','CRC Routing','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].OGP || {}).map(a=>DATA.Technical["CRC Routing"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Technical','CRC Routing','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].CLOSED || {}).map(a=>DATA.Technical["CRC Routing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].OGP || {}).map(a=>DATA.Technical["CRC Routing"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].CLOSED || {}).map(a=>DATA.Technical["CRC Routing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                 { dropdown.technical2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].OGP && DATA.Technical["CRC Routing"].OGP[a] ? DATA.Technical["CRC Routing"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].CLOSED && DATA.Technical["CRC Routing"].CLOSED[a] ? DATA.Technical["CRC Routing"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].OGP && DATA.Technical["CRC Routing"].OGP[a] ? DATA.Technical["CRC Routing"].OGP[a] : 0)+(DATA.Technical["CRC Routing"] && DATA.Technical["CRC Routing"].CLOSED && DATA.Technical["CRC Routing"].CLOSED[a] ? DATA.Technical["CRC Routing"].CLOSED[a] : 0)}</div>
                                         </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical3')}><RightOutlined/>QE</div>
                                  <div onClick={()=>PopTableAction('Technical','QE','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["QE"] && DATA.Technical["QE"].OGP || {}).map(a=>DATA.Technical["QE"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Technical','QE','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["QE"] && DATA.Technical["QE"].CLOSED || {}).map(a=>DATA.Technical["QE"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["QE"] && DATA.Technical["QE"].OGP || {}).map(a=>DATA.Technical["QE"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical["QE"] && DATA.Technical["QE"].CLOSED || {}).map(a=>DATA.Technical["QE"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               
                                {   dropdown.technical3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                             <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["QE"] && DATA.Technical["QE"].OGP && DATA.Technical["QE"].OGP[a] ? DATA.Technical["QE"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["QE"] && DATA.Technical["QE"].CLOSED && DATA.Technical["QE"].CLOSED[a] ? DATA.Technical["QE"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Technical["QE"] && DATA.Technical["QE"].OGP && DATA.Technical["QE"].OGP[a] ? DATA.Technical["QE"].OGP[a] : 0)+(DATA.Technical["QE"] && DATA.Technical["QE"].CLOSED && DATA.Technical["QE"].CLOSED[a] ? DATA.Technical["QE"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">4</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical4')}><RightOutlined/>Routing</div>
                                 <div onClick={()=>PopTableAction('Technical','Routing','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Routing"] && DATA.Technical["Routing"].OGP || {}).map(a=>DATA.Technical["Routing"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Technical','Routing','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Routing"] && DATA.Technical["Routing"].CLOSED || {}).map(a=>DATA.Technical["Routing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["Routing"] && DATA.Technical["Routing"].OGP || {}).map(a=>DATA.Technical["Routing"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical["Routing"] && DATA.Technical["Routing"].CLOSED || {}).map(a=>DATA.Technical["Routing"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               
                                {   dropdown.technical4 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                             <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["Routing"] && DATA.Technical["Routing"].OGP && DATA.Technical["Routing"].OGP[a] ? DATA.Technical["Routing"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["Routing"] && DATA.Technical["Routing"].CLOSED && DATA.Technical["Routing"].CLOSED[a] ? DATA.Technical["Routing"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Technical["Routing"] && DATA.Technical["Routing"].OGP && DATA.Technical["Routing"].OGP[a] ? DATA.Technical["Routing"].OGP[a] : 0)+(DATA.Technical["Routing"] && DATA.Technical["Routing"].CLOSED && DATA.Technical["Routing"].CLOSED[a] ? DATA.Technical["Routing"].CLOSED[a] : 0)}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">5</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical5')}><RightOutlined/>TCont</div>
                                 <div onClick={()=>PopTableAction('Technical','TCont','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["TCont"] && DATA.Technical["TCont"].OGP || {}).map(a=>DATA.Technical["TCont"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Technical','TCont','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["TCont"] && DATA.Technical["TCont"].CLOSED || {}).map(a=>DATA.Technical["TCont"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical["TCont"] && DATA.Technical["TCont"].OGP || {}).map(a=>DATA.Technical["TCont"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical["TCont"] && DATA.Technical["TCont"].CLOSED || {}).map(a=>DATA.Technical["TCont"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               
                                {   dropdown.technical5 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                             <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["TCont"] && DATA.Technical["TCont"].OGP && DATA.Technical["TCont"].OGP[a] ? DATA.Technical["TCont"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA.Technical["TCont"] && DATA.Technical["TCont"].CLOSED && DATA.Technical["TCont"].CLOSED[a] ? DATA.Technical["TCont"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA.Technical["TCont"] && DATA.Technical["TCont"].OGP && DATA.Technical["TCont"].OGP[a] ? DATA.Technical["TCont"].OGP[a] : 0)+(DATA.Technical["TCont"] && DATA.Technical["TCont"].CLOSED && DATA.Technical["TCont"].CLOSED[a] ? DATA.Technical["TCont"].CLOSED[a] : 0)}</div>
                                          </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical.OGP || {}).map(a=>DATA.Technical.OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical.CLOSED || {}).map(a=>DATA.Technical.CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA.Technical.OGP || {}).map(a=>DATA.Technical.OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA.Technical.CLOSED || {}).map(a=>DATA.Technical.CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-cente w-full">
                    <div className="py-2 bg-sky-700 text-white rounded-t-lg text-md w-full font-bold text-center">ISSUE TSEL</div>
                    <div className="rounded-b-lg flex flex-col bg-gray-300 to-sky-200 w-full h-46 py-1 px-4">
                            <div className="uppercase w-full grid whitespace-nowrap items-center text-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800"> &nbsp;</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Action Plan</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">OGP</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Close</div>
                                <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Total</div>
                            </div>
                            <div className="uppercase w-full grid whitespace-nowrap items-center h-full overflow-y-auto" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">1</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('tsel1')}><RightOutlined/>Perbaikan Power</div>
                                <div onClick={()=>PopTableAction('Issue TSEL','Power','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].OGP || {}).map(a=>DATA["Issue TSEL"]["Power"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Issue TSEL','Power','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Power"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].OGP || {}).map(a=>DATA["Issue TSEL"]["Power"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Power"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               {dropdown.tsel1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].OGP && DATA["Issue TSEL"]["Power"].OGP[a] ? DATA["Issue TSEL"]["Power"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].CLOSED && DATA["Issue TSEL"]["Power"].CLOSED[a] ? DATA["Issue TSEL"]["Power"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].OGP && DATA["Issue TSEL"]["Power"].OGP[a] ? DATA["Issue TSEL"]["Power"].OGP[a] : 0)+(DATA["Issue TSEL"]["Power"] && DATA["Issue TSEL"]["Power"].CLOSED && DATA["Issue TSEL"]["Power"].CLOSED[a] ? DATA["Issue TSEL"]["Power"].CLOSED[a] : 0)}</div>
                                       </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('tsel2')}><RightOutlined/>Perbaikan Suhu</div>
                                <div onClick={()=>PopTableAction('Issue TSEL','Suhu','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].OGP || {}).map(a=>DATA["Issue TSEL"]["Suhu"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Issue TSEL','Suhu','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Suhu"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].OGP || {}).map(a=>DATA["Issue TSEL"]["Suhu"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Suhu"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                               { dropdown.tsel2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].OGP && DATA["Issue TSEL"]["Suhu"].OGP[a] ? DATA["Issue TSEL"]["Suhu"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].CLOSED && DATA["Issue TSEL"]["Suhu"].CLOSED[a] ? DATA["Issue TSEL"]["Suhu"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].OGP && DATA["Issue TSEL"]["Suhu"].OGP[a] ? DATA["Issue TSEL"]["Suhu"].OGP[a] : 0)+(DATA["Issue TSEL"]["Suhu"] && DATA["Issue TSEL"]["Suhu"].CLOSED && DATA["Issue TSEL"]["Suhu"].CLOSED[a] ? DATA["Issue TSEL"]["Suhu"].CLOSED[a] : 0)}</div>
                                         </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('tsel3')}><RightOutlined/>Technical</div>
                                 <div onClick={()=>PopTableAction('Issue TSEL','Technical','OGP')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].OGP || {}).map(a=>DATA["Issue TSEL"]["Technical"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={()=>PopTableAction('Issue TSEL','Technical','Closed')} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Technical"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].OGP || {}).map(a=>DATA["Issue TSEL"]["Technical"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].CLOSED || {}).map(a=>DATA["Issue TSEL"]["Technical"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                              
                                {   dropdown.tsel3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment key={i}>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                           <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].OGP && DATA["Issue TSEL"]["Technical"].OGP[a] ? DATA["Issue TSEL"]["Technical"].OGP[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].CLOSED && DATA["Issue TSEL"]["Technical"].CLOSED[a] ? DATA["Issue TSEL"]["Technical"].CLOSED[a] : 0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].OGP && DATA["Issue TSEL"]["Technical"].OGP[a] ? DATA["Issue TSEL"]["Technical"].OGP[a] : 0)+(DATA["Issue TSEL"]["Technical"] && DATA["Issue TSEL"]["Technical"].CLOSED && DATA["Issue TSEL"]["Technical"].CLOSED[a] ? DATA["Issue TSEL"]["Technical"].CLOSED[a] : 0)}</div>
                                            </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"].OGP || {}).map(a=>DATA["Issue TSEL"].OGP[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"].CLOSED || {}).map(a=>DATA["Issue TSEL"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA["Issue TSEL"].OGP || {}).map(a=>DATA["Issue TSEL"].OGP[a]))].reduce((a,b)=>a+b)+[0,0,...(Object.keys(DATA["Issue TSEL"].CLOSED || {}).map(a=>DATA["Issue TSEL"].CLOSED[a]))].reduce((a,b)=>a+b)}</div>
                          </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default ActionPlanProgress