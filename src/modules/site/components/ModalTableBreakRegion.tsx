import { Modal, Table } from "antd"
import { useLazyGetDetailRegionQuery } from "../rtk/site.rtk"
import { useCallback, useEffect, useState } from "react"

const ModalTableBreakRegion = ({ open, onCancel, name }) => {
    const [data, setData] = useState([])
    const columns = [
        {
            title: 'No',
            dataIndex: 'No',
            key: 'No',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Issue',
            dataIndex: 'Issue',
            key: 'Issue',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Jumlah',
            dataIndex: 'Jumlah',
            key: 'Jumlah',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Open',
            dataIndex: 'Open',
            key: 'Open',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'On Progress',
            dataIndex: 'OnProgress',
            key: 'OnProgress',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Done',
            dataIndex: 'Done',
            key: 'Done',
            onHeaderCell: () => ({
                className: "!p-1 !text-center !bg-neutral-800 !text-white",
            })
        },
    ]
    const [getDetailRegion] = useLazyGetDetailRegionQuery()
    const getData = useCallback(async () => {
        const result = await getDetailRegion({ query: { name } })
        console.log(result);
        setData(result)

    }, [name])

    useEffect(() => {
        if(name) getData()
    }, [name])
    return (
        <Modal open={open} onCancel={onCancel} footer={null} centered>
            <Table columns={columns}  dataSource={data}/>
        </Modal>
    )
}

export { ModalTableBreakRegion }