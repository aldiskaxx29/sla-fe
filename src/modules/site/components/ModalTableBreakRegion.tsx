import { Modal, Table } from "antd"
import { useLazyGetDetailRegionQuery } from "../rtk/site.rtk"
import { useCallback, useEffect, useState } from "react"

const ModalTableBreakRegion = ({ open, onCancel, name }) => {
    const [data, setData] = useState([])
    const columns = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'No',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Issue',
            dataIndex: 'issue',
            key: 'Issue',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Jumlah',
            dataIndex: 'jumlah',
            key: 'Jumlah',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Open',
            dataIndex: 'open',
            key: 'Open',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'On Progress',
            dataIndex: 'on_progress',
            key: 'OnProgress',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Done',
            dataIndex: 'done',
            key: 'Done',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
    ]
    const [getDetailRegion] = useLazyGetDetailRegionQuery()
    const getData = useCallback(async () => {
        const result = await getDetailRegion({ query: { name } })
        setData(result.data)

    }, [name])

    useEffect(() => {
        if(name) getData()
    }, [name])
    return (
        <Modal open={open} onCancel={onCancel} footer={null} centered title={name.toUpperCase() + " PER REGION "}>
            <Table columns={columns}  dataSource={data}/>
        </Modal>
    )
}

export { ModalTableBreakRegion }