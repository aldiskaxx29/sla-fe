import {
 CloseOutlined,
 FileExcelFilled
} from "@ant-design/icons";
import { useRef } from "react";
import * as XLSX from "xlsx";

const Popup = ({title,close,data,mode}) =>{
    function exportExcel() {
        const table = document.getElementById("excel");
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        let filename = title+Date.now()
        XLSX.writeFile(wb, filename+".xlsx");
    }
    const REG = {
        "SUMBAGUT" : "01-SUMBAGUT",
        "SUMBAGSEL" : "02-SUMBAGSEL",
        "JABOTABEK INNER" : "03-JABOTABEK INNER",
        "JAWA BARAT" : "04-JAWA BARAT",
        "JAWA TENGAH" : "05-JAWA TENGAH",
        "JAWA TIMUR" : "06-JAWA TIMUR",
        "BALINUSRA" : "07-BALINUSRA",
        "KALIMANTAN" : "08-KALIMANTAN",
        "SULAWESI" : "09-SULAWESI",
        "SUMBAGTENG" : "10-SUMBAGTENG",
        "PUMA" : "11-PUMA",
        "JABOTABEK OUTER" : "12-JABOTABEK OUTER",
    }
    return(
        <div className="fixed flex top-20 justify-center left-0 right-0 bottom-0">
            <div className="bg-gray-900 opacity-70 absolute h-full w-full"></div>
            <div className="bg-white px-3 py-5 mx-auto rounded-sm border border-gray-200 relative h-fit z-2 mt-8 mb-30">
                <CloseOutlined onClick={()=>close(false)} className="absolute cursor-pointer right-0 text-white bg-red-600 w-8 h-8 flex justify-center items-center rounded-full" style={{color:'#fff',right:-15,top:-20}}></CloseOutlined>
                <div className="italic text-red-700 font-bold text-md text-center">{title}</div>
                <div className="flex justify-end">
                <div onClick={exportExcel} className="cursor-pointer flex items-center gap-1" style={{fontSize:'0.8em'}}>
                        Export As Excel
                        <FileExcelFilled style={{color:'green',fontSize:'1.7em'}}></FileExcelFilled>
                </div>
                </div>
                <div className="h-full py-2">
                <div className="overflow-y-auto scrollbar-thin mb-2" style={{minHeight:'fit-content',maxHeight:'60vh'}}>
                    <table className="w-220 border" id="excel">
                        <thead>
                            <tr>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>No</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>Region</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>Site ID</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>{mode=='lat' || mode=='jit'? mode.toUpperCase() : 'PL'} Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((a,i)=>{
                                return(<tr>
                                <td className="py-0.5 px-2 border border-gray-800 text-center">{i+1}</td>
                                <td className="py-0.5 px-2 border border-gray-800 text-center">{REG[a.region]}</td>
                                <td className="py-0.5 px-2 border border-gray-800 text-center">{a.site_id}</td>
                                <td className="py-0.5 px-2 border border-gray-800 text-center">{Number(a.pop_value).toFixed(2)??0}</td>
                                </tr>)
                            })}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Popup