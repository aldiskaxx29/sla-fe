import {
 CloseOutlined,DownloadOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DownloadTemplate = () => {
    const data = [
    { year: "2026", week:1 , site_id: "ABCD",progress:'CLOSED',rca:'Issue TSEL',rca2:'Power TSEL' },
    ];
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, "template_recon_progress.xlsx");
};
const PopupUpload = ({close}) =>{
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 
  // { type: "success" | "error", text: "..." }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({ type: "error", text: "Silakan pilih file dulu" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage(null);

    try {
        let qosmo = true ? "https://qosmo.telkom.co.id/baseapi/upload.php" : "http://10.60.174.187:90/api/upload.php"
      const response = await fetch(qosmo, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        setMessage({ type: "success", text: result.message });
        setFile(null);
      } else {
        setMessage({ type: "error", text: result.message });
      }

    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan koneksi" });
    }

    setLoading(false);
  };

    return(
         <div className="fixed flex top-20 justify-center left-0 right-0 bottom-0">
            <div className="bg-gray-900 opacity-70 absolute h-full w-full"></div>
            <div className="bg-white px-3 py-5 mx-auto rounded-sm border border-gray-200 relative h-fit z-2 top-10 mb-15">
                <CloseOutlined onClick={close} className="absolute cursor-pointer right-0 text-white bg-red-600 w-8 h-8 flex justify-center items-center rounded-full" style={{color:'#fff',right:-15,top:-20}}></CloseOutlined>
                {/* <div className="italic text-red-700 font-bold text-md text-center">{title}</div> */}
                <div className="h-full py-2">
                <div className="overflow-y-auto scrollbar-thin mb-2" style={{minHeight:'50px',maxHeight:'65vh'}}>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-center text-sky-600 mb-6">
                            Upload Recon Progress
                        </h2>

                        {message && (
                            <div className={`p-3 rounded-lg text-white ${
                                message.type === "success" ? "bg-green-500" : "bg-red-500"
                            }`}
                            >
                            {message.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-sky-400"
                            />

                            <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg transition duration-300 disabled:opacity-50"
                            >
                            {loading ? "Uploading..." : "Upload & Insert"}
                            </button>
                        </form>

                        <div className="mt-6 text-sm text-gray-500 text-center">
                            ⚠ Pastikan baris pertama Excel = nama kolom tabel
                        </div>
                        <div onClick={DownloadTemplate} className="cursor-pointer text-sky-700 text-xs border border-sky-700 rounded-sm w-fit mx-auto px-2 py-1 flex gap-2 font-semibold">
                            <DownloadOutlined></DownloadOutlined>
                            Download Template</div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}

export default PopupUpload