import {
 CloseOutlined,
 FileExcelFilled
} from "@ant-design/icons";
import { useRef } from "react";
import * as XLSX from "xlsx";

const PopupDownload = ({LAST,NOW,RAWDATA,RAWDATALAST,close}) =>{
    return(
        <div className="fixed flex top-20 justify-center left-0 right-0 bottom-0">
            <div className="bg-gray-900 opacity-70 absolute h-full w-full"></div>
            <div className="bg-white px-3 py-5 mx-auto rounded-sm border border-gray-200 relative h-fit z-2 mt-8 mb-30">
                <CloseOutlined onClick={()=>close(false)} className="absolute cursor-pointer right-0 text-white bg-red-600 w-8 h-8 flex justify-center items-center rounded-full" style={{color:'#fff',right:-15,top:-20}}></CloseOutlined>
                <div className="italic text-red-700 font-bold text-md text-center">Download RAW DATA</div>
                <div className="grid grid-cols-2 text-sm font-bold gap-3">
                    <div onClick={LAST} className="p-2 cursor-pointer rounded-sm text-white bg-blue-600 text-center" style={{background:RAWDATALAST.length ? '' : 'gray'}}>LAST WEEK</div>
                    <div onClick={NOW} className="p-2 cursor-pointer rounded-sm text-white bg-green-600 text-center"  style={{background:RAWDATA.length ? '' : 'gray'}}>THIS WEEK</div>
                </div>
            </div>
        </div>
    )
}

export default PopupDownload