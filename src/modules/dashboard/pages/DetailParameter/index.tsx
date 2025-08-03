import warningIcon from "@/assets/warning.svg";
import checkIcon from "@/assets/check.svg";
import { TableDetailParameterMSA } from "../../componets/TableDetailParameterMSA";
import { Button, Image, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { TableDetailParameterCNOP } from "../../componets/TableDetailParameterCNOP";

import history from "@/assets/history.svg";
import filterIcon from "@/assets/filter.svg";

const DetailParameter = () => {
  const { getCNP, dataCNP, isLoadingCNP } = useDashboard();
  const [filter, setFilter] = useState("by total ne");
  const { menuId, detailParameter } = useParams();
  const navigate = useNavigate();

  const dataWithIndex = (dataSource) => {
    return dataSource?.map((item, index) => {
      return {
        ...item,
        no:
          !item.parameter.toLowerCase().includes("weighted") &&
          !item.parameter.toLowerCase().includes("service ")
            ? index + 1
            : null,
      };
    });
  };

  const fetchCNP = useCallback(async () => {
    await getCNP({
      query: {
        type: menuId,
        filter,
        parameter: detailParameter?.replace(/%20/g, " "),
        sort: "asc",
      },
    }).unwrap();
  }, [detailParameter, menuId, filter]);

  const filterOptions = [
    {
      label: "By Ach",
      value: "by ach",
    },
    {
      label: "By Total Ne",
      value: "by total ne",
    },
  ];

  useEffect(() => {
    fetchCNP();
  }, [detailParameter, menuId, filter]);

  return (
    <div>
      {menuId == "cnop" && (
        <div className="flex justify-end mb-6">
          <Select
            placeholder="Filter By"
            className="w-32"
            options={filterOptions}
            onChange={(value) => setFilter(value)}
            suffixIcon={
              <Image src={filterIcon} alt="icon" width={20} preview={false} />
            }
          ></Select>
        </div>
      )}
      <div className="bg-white rounded-xl p-6 ">
        <div className="flex gap-3">
          <ArrowLeftOutlined onClick={() => navigate(-1)} />
          <p className="text-brand-secondary font-semibold text-base">
            {snakeToPascal_Utils(detailParameter?.replace(/%20/g, " "))
              .replace("Pl", "Packetloss")
              .replace("%3e", ">")}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 my-4">
            <div className="flex bg-gray-50 rounded-lg p-2">
              <Image src={checkIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2">
                <p className="text-[10px] text-gray-600 font-bold">
                  Total MSA Not Comply - Juny
                </p>
                <p className="text-sm text-brand-secondary font-semibold">
                  0 Parameter
                </p>
              </div>
            </div>
            <div className="flex bg-gray-50 rounded-lg p-2">
              <Image src={warningIcon} alt="icon" width={36} preview={false} />
              <div className="ml-2">
                <p className="text-[10px] text-gray-600 font-bold">
                  Total SLA CNOP Not Comply - Juny
                </p>
                <p className="text-sm text-brand-secondary font-semibold">
                  12 Parameter
                </p>
              </div>
            </div>
          </div>
          {menuId == "cnop" && (
            <Button
              onClick={() => {}}
              className="!h-11 !border-2 !border-brand-secondary !px-6 bg-white "
            >
              <p className="text-brand-secondary font-medium">History</p>
              <Image src={history} alt="icon" width={16} preview={false} />
            </Button>
          )}
        </div>
        {menuId == "msa" && (
          <div className="w-auto overflow-x-auto ">
            <TableDetailParameterMSA
              data={dataWithIndex(dataCNP?.data)}
              loadingMainData={isLoadingCNP}
            ></TableDetailParameterMSA>
          </div>
        )}
        {menuId == "cnop" && (
          <div className="w-auto overflow-x-auto ">
            <TableDetailParameterCNOP
              filterBy={filter}
              data={dataWithIndex(dataCNP?.data)}
              loadingMainData={isLoadingCNP}
            ></TableDetailParameterCNOP>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailParameter;
