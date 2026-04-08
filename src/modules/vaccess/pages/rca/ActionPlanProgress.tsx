import {
 RightOutlined,
 CaretDownOutlined
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import Popup from "./Popup";
const ActionPlanProgress = React.memo(({mode,week,DATATABLE,LABELS})=>{
    const [POPUP,setPOPUP] = useState(false)
    const [POPDATA,setPOPDATA] = useState([])
    const [DATA,setData] = useState({})
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
    const [dropdown,setDropdown] = useState({})

    function DropdownSelect(select){
        let dropdownT = dropdown
        if(!dropdownT.hasOwnProperty(select)){
            dropdownT[select]=true
        }else{
            dropdownT[select] = !dropdownT[select]
        }
        setDropdown({...dropdownT})
    }

    async function PopTableAction(rca,rca2,status,region=''){
        let sites = []
        if(rca2=='' && region==''){
            Object.keys(DATATABLE.sites).forEach(b=>{
                if(DATATABLE.sites[b]){
                    let POPD = DATATABLE.sites[b].filter(a=>a.rca==rca && a.status.toUpperCase()==status.toUpperCase()).map(a=>a) || [];
                    sites = [...sites,...POPD]
                }
            })
        }else if(rca2!='' && region==''){
            Object.keys(DATATABLE.sites).forEach(b=>{
                if(DATATABLE.sites[b]){
                    let POPD = DATATABLE.sites[b].filter(a=>a.rca==rca && a.rca2==rca2 && a.status.toUpperCase()==status.toUpperCase()).map(a=>a) || [];
                    sites = [...sites,...POPD]
                }
            })
        }else{
            // if(DATATABLE.sites[region]){
            //     let POPD = DATATABLE.sites[region].filter(a=>a.rca==rca && a.rca2==rca2 && a.status.toUpperCase().includes(status.toUpperCase())).map(a=>a) || [];
            //     sites = [...sites,...POPD]
            // }
        }
        // console.log(rca,rca2,status,sites)
        setPOPUP(true);
        setPOPDATA(sites)
    }

    async function Init(){
        let res = await fetch('https://qosmo.telkom.co.id/baseapi/vrecon.php?cmd=action-plan&traffic='+mode.split('_')[0].toLowerCase()+`&week=${week.split('-')[0]}&year=${week.split('-')[1]}&dist=${mode.split('_')[1]}`)
        let {data} = await res.json()
        try {
            let d = {}
            if(data){
                d=data
            }
            let blank = {Blank:{}}
            if(d.hasOwnProperty('Blank')){
                blank.Blank = d.Blank
            }
            d = {...data}
            if(d.hasOwnProperty('Blank')){
                delete d.Blank
                d = {...d,...blank}
            }
            Object.keys(d).forEach(a=>{
                let temp = {Blank:{}}
                if(d[a].hasOwnProperty('Blank')){
                    temp.Blank = d[a].Blank
                    delete d[a].Blank
                    d[a] = {...d[a],...temp}
                }
            })
            // console.log(d,blank)
            setData(d)            
        } catch (error) {
            
        }
    }

    useEffect(()=>{
        Init()
    },[mode,week])

    // if(LABELS.length)
    return(
        <div className="flex flex-col" style={{height:'90vh'}}>
            {POPUP && <Popup close={()=>setPOPUP(false)} data={POPDATA}></Popup>}
            <div className="text-md font-bold text-red-700 flex gap-2">ACTION PLAN & PROGRESS</div>
            <div className="columns-2 auto-rows-fr gap-3 items-top" style={{gridTemplateRows:'auto',height:'fit-content'}}>
                {Object.keys(DATA).map((a,i)=>{
                    let num=1
                    return(
                    <div className="flex flex-col break-inside-avoid mb-2 items-cente ustify-center w-full" key={i}>
                        <div className="py-2 bg-sky-700 text-white rounded-t-lg text-md font-bold w-full text-center">{a} Issue</div>
                        <div className="rounded-b-lg flex flex-col bg-gray-300 to-sky-200 w-full py-1 px-4" style={{height:'auto'}}>
                                <div className="uppercase w-full grid whitespace-nowrap items-center text-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                    <div className="px-2 py-2 font-bold border-b-2 border-gray-800"> &nbsp;</div>
                                    <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Action Plan</div>
                                    <div className="px-2 py-2 font-bold border-b-2 border-gray-800">OGP</div>
                                    <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Close</div>
                                    <div className="px-2 py-2 font-bold border-b-2 border-gray-800">Total</div>
                                </div>
                                {Object.keys(DATA[a]).map((b,u)=>{
                                if(!['OGP','CLOSED'].includes(b))
                                return(
                                <div key={a+b} className="uppercas w-full grid whitespace-nowrap items-center overflow-y-auto" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                    <div className="px-2 py-2 h-full flex items-center justify-center border-b-2 border-gray-800">{num++}</div>
                                    <div className="px-2 py-2 h-full flex items-center border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect(a+b)}><RightOutlined/>{b}</div>
                                    <div onClick={()=>PopTableAction(a,b,'OGP')} className="px-2 py-2 h-full flex items-center justify-center cursor-pointer text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a][b] && DATA[a][b].OGP || {}).map(x=>DATA[a][b].OGP[x]))].reduce((z,x)=>z+x)}</div>
                                    <div onClick={()=>PopTableAction(a,b,'CLOSED')} className="px-2 py-2 h-full flex items-center justify-center text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a][b] && DATA[a][b].CLOSED || {}).map(x=>DATA[a][b].CLOSED[x]))].reduce((z,x)=>z+x)}</div>
                                    <div className="px-2 py-2 h-full flex items-center justify-center text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a][b] && DATA[a][b].OGP || {}).map(x=>DATA[a][b].OGP[x]))].reduce((z,x)=>z+x)+[0,0,...(Object.keys(DATA[a][b] && DATA[a][b].CLOSED || {}).map(x=>DATA[a][b].CLOSED[x]))].reduce((z,x)=>z+x)}</div>
                                
                                    {dropdown[a+b] &&
                                        Object.keys(TB).map((c,i)=>{
                                        let TOGP = DATA[a][b] && DATA[a][b].OGP && DATA[a][b].OGP[c] ? DATA[a][b].OGP[c] : 0;
                                        let TCLOSED = DATA[a][b] && DATA[a][b].CLOSED && DATA[a][b].CLOSED[c] ? DATA[a][b].CLOSED[c] : 0;
                                        let TTOTAL = (DATA[a][b] && DATA[a][b].OGP && DATA[a][b].OGP[c] ? DATA[a][b].OGP[c] : 0)+(DATA[a][b] && DATA[a][b].CLOSED && DATA[a][b].CLOSED[c] ? DATA[a][b].CLOSED[c] : 0);
                                        if(TTOTAL>0)
                                        return(<React.Fragment key={a+b+i}>
                                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                                <div className="px-2 py-2 border-b-2 border-gray-800 text-left">{c}</div>
                                                <div onClick={()=>PopTableAction(a,b,'OGP',c.replace('_',' '))} className="px-2 cursor-pointer py-2 border-b-2 border-gray-800 text-center">{TOGP}</div>
                                                <div onClick={()=>PopTableAction(a,b,'CLOSED',c.replace('_',' '))} className="px-2 cursor-pointer py-2 border-b-2 border-gray-800 text-center">{TCLOSED}</div>
                                                <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{TTOTAL}</div>
                                            </React.Fragment>
                                        )})
                                    }
                            </div>
                            )}
                        )}
                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 h-full flex items-center justify-center border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 h-full flex items-center border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div onClick={()=>PopTableAction(a,'','OGP','')} className="px-2 py-2 h-full flex items-center justify-center cursor-pointer text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a].OGP || {}).map(x=>DATA[a].OGP[x]))].reduce((z,x)=>z+x)}</div>
                                <div onClick={()=>PopTableAction(a,'','CLOSED','')} className="px-2 py-2 h-full flex items-center justify-center cursor-pointer text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a].CLOSED || {}).map(x=>DATA[a].CLOSED[x]))].reduce((z,x)=>z+x)}</div>
                                <div className="px-2 py-2 h-full flex items-center justify-center text-center border-b-2 border-gray-800">{[0,0,...(Object.keys(DATA[a].OGP || {}).map(x=>DATA[a].OGP[x]))].reduce((z,x)=>z+x)+[0,0,...(Object.keys(DATA[a].CLOSED || {}).map(x=>DATA[a].CLOSED[x]))].reduce((z,x)=>z+x)}</div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    )
})

export default ActionPlanProgress