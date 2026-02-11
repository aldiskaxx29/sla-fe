import {
 RightOutlined,
 CaretDownOutlined
} from "@ant-design/icons";
import React, { useState } from "react";
const ActionPlanProgress = ({ShowPopup})=>{
         const TB = {
        SUMBAGUT : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        SUMBAGSEL : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JABOTABEK_INNER : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_BARAT : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_TENGAH : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
        JAWA_TIMUR : {total_site:0,t_pl5:0,t_pl15:0,t_latency:0,t_jitter:0,r_pl5:0,r_pl15:0,r_latency:0,r_jitter:0},
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
    return(
        <div className="flex flex-col">
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
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 {dropdown.capacity1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('capacity2')}><RightOutlined/>Upgrade Redeploy</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 { dropdown.capacity2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('capacity3')}><RightOutlined/>New Redeploy</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.capacity3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">12</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">18</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">30</div>
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
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 {dropdown.gamas1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2  border-b-2 border-gray-800 cursor-pointer whitespace-normal" onClick={()=>DropdownSelect('gamas2')}><RightOutlined/>Gamas Close,Link NY Back to Normal Quality</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 { dropdown.gamas2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('gamas3')}><RightOutlined/>Gamas Open</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.gamas3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">12</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">18</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">30</div>
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
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 {dropdown.technical1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical2')}><RightOutlined/>CRC ROUTING</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 { dropdown.technical2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical3')}><RightOutlined/>QE</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.technical3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">4</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical4')}><RightOutlined/>Routing</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.technical4 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">5</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('technical5')}><RightOutlined/>TCot</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.technical5 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">20</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">30</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">50</div>
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
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 {dropdown.tsel1 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">2</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('tsel2')}><RightOutlined/>Perbaikan Suhu</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>
                                 { dropdown.tsel2 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                <div className="px-2 py-2 border-b-2 border-gray-800">3</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 cursor-pointer" onClick={()=>DropdownSelect('tsel3')}><RightOutlined/>Technical</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">4</div>
                                <div onClick={ShowPopup} className="px-2 py-2 text-center border-b-2 border-gray-800">6</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">10</div>

                                {   dropdown.tsel3 &&
                                    Object.keys(TB).map((a,i)=>{
                                    return(<React.Fragment>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800">{a}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<4?1:0}</div>
                                            <div onClick={ShowPopup} className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?1:0}</div>
                                            <div className="px-2 py-2 border-b-2 border-gray-800 text-center">{i<6?(i<4?2:1) :0}</div>
                                        </React.Fragment>
                                    )})
                                }
                                
                            </div>

                            <div className="uppercase w-full font-bold grid whitespace-nowrap items-center" style={{gridTemplateColumns:'5% 47% 16% 16% 16%',fontSize:'0.8em'}}>
                                <div className="px-2 py-2 border-b-2 border-gray-800">&nbsp;</div>
                                <div className="px-2 py-2 border-b-2 border-gray-800 font-bold">TOTAL</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">12</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">18</div>
                                <div className="px-2 py-2 text-center border-b-2 border-gray-800">30</div>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActionPlanProgress