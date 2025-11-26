import { Table } from "antd"

const TableDetailReportSupport = ({data}) => {

    const columns = [
        {
            title: 'No',
            dataIndex: 'No',
            key: 'No',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Issue',
            dataIndex: 'Issue',
            key: 'Issue',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Jumlah',
            dataIndex: 'Jumlah',
            key: 'Jumlah',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Open',
            dataIndex: 'Open',
            key: 'Open',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
        {
            title: 'On Progress',
            dataIndex: 'OnProgress',
            key: 'OnProgress',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
        {
            title: 'Done',
            dataIndex: 'Done',
            key: 'Done',
            onHeaderCell: () => ({
                className: "!bg-neutral-800 !text-white",
            })
        },
    ]
    return (
        <Table className="mt-4" columns={columns} dataSource={data} />
    )
}

export { TableDetailReportSupport }