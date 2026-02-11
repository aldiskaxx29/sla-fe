import {
 CloseOutlined
} from "@ant-design/icons";

const PopupTTR = ({close,data}) =>{
    return(
        <div className="fixed flex top-20 justify-center left-0 right-0 bottom-0">
            <div className="bg-gray-900 opacity-70 absolute h-full w-full"></div>
            <div className="bg-white px-3 py-5 mx-auto rounded-sm border border-gray-200 relative h-fit z-2 top-10 mb-15">
                <CloseOutlined onClick={()=>close(false)} className="absolute cursor-pointer right-0 text-white bg-red-600 w-8 h-8 flex justify-center items-center rounded-full" style={{color:'#fff',right:-15,top:-20}}></CloseOutlined>
                {/* <div className="italic text-red-700 font-bold text-md text-center">{title}</div> */}
                <div className="h-full py-2">
                <div className="overflow-y-auto scrollbar-thin mb-2" style={{minHeight:'fit-content',maxHeight:'65vh'}}>
                    <table className="w-220 border">
                        <thead>
                            <tr>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>No</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>Ticket ID</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>Regional</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>Treshold</th>
                                <th className="py-0.5 px-2 sticky top-0 text-center border border-gray-800 bg-blue-200 text-gray-800" style={{boxShadow:'inset 0px 0.2px 0px #000,inset 0px -0.2px 0px #000'}}>TTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((a,i)=>{
                                return(<tr key={i}>
                                    <td className="py-0.5 px-2 border border-gray-800 text-center">{i+1}</td>
                                    <td className="py-0.5 px-2 border border-gray-800 text-center">{a.ticket_id}</td>
                                    <td className="py-0.5 px-2 border border-gray-800 text-center">{a.region}</td>
                                    <td className="py-0.5 px-2 border border-gray-800 text-center">{a.treshold}</td>
                                    <td className="py-0.5 px-2 border border-gray-800 text-center">{Number(a.ttr).toFixed(2)}</td>
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

export default PopupTTR