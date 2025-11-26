import { Table } from "antd"

const TableDetailReportSupport = ({data}) => {

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
            title: 'OGP',
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
    return (
        <Table className="mt-4" columns={columns} dataSource={data} />
    )
}

export { TableDetailReportSupport }