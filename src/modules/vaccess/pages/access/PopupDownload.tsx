import {
 CloseOutlined,
 FileExcelFilled
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

const PopupDownload = ({close}) =>{
    const [RAW,setRAW] = useState([])
    async function RawList(){
        let res = await fetch(`https://qosmo.telkom.co.id/baseapi/vaccess.php?cmd=raw-list`)
        let {data} = await res.json()
        setRAW(data)
    }

    useEffect(()=>{
        RawList()
    },[])
    return(
        <div className="fixed flex top-20 justify-center left-0 right-0 bottom-0">
            <div className="bg-gray-900 opacity-70 absolute h-full w-full"></div>
            <div className="bg-white px-3 py-5 mx-auto rounded-sm border border-gray-200 relative h-fit z-2 mt-8 mb-30">
                <CloseOutlined onClick={()=>close(false)} className="absolute cursor-pointer right-0 text-white bg-red-600 w-8 h-8 flex justify-center items-center rounded-full" style={{color:'#fff',right:-15,top:-20}}></CloseOutlined>
                <div className="italic text-red-700 font-bold text-md text-center">Download RAW DATA</div>
                <div className="grid grid-cols-4 text-sm font-bold gap-3">
                    {RAW.map(a=>{
                        return(<a href={`https://qosmo.telkom.co.id/rawgen/exports/${a.filename}`} target="_blank" className="visited:text-gray-800 active:text-gray-800 inline-block [color:inherit] text-xs text-gray-800 text-decoration-none border rounded-sm px-2 py-1 text-center hover:text-white hover:bg-gray-700 cursor-pointer" style={{color:'black'}}>{a.filename}</a>)
                    })}
                </div>
            </div>
        </div>
    )
}

export default PopupDownload