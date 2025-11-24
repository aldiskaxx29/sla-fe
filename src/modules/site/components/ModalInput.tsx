import {
  Modal,
  Input,
  Upload,
  Button,
  Form,
  Select,
  Checkbox,
  CheckboxProps,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useCallback, useEffect, useState } from "react";
import { useSite } from "../hooks/site.hooks";
import { useLazyDownload_evidanceQuery } from "../rtk/site.rtk";
import { toast } from "react-toastify";

type DataModal = { parameter: string; id: string };

type SiteDetail = {
  site_id: string;
  group_rca: string;
  note: string;
  evidence?: string;
  ttr_slisih?: string;
  kpi: string[];
  site_sos: boolean;
  site_exclude: boolean;
};

const GroupingOptions = [
  { group1: "Capacity", group2: "Cap End Site Need Order" },
  { group1: "Capacity", group2: "Cap End Site Order" },
  { group1: "Capacity", group2: "Cap Intermediate / Hub" },
  { group1: "Capacity", group2: "Cap 3rd Party" },
  { group1: "Capacity", group2: "Cap OLT" },
  { group1: "Capacity", group2: "Cap Link Backup" },

  { group1: "Hardware / Software Capab", group2: "Hardware / Software Capab" },

  { group1: "Power", group2: "Power TSEL" },
  { group1: "Power", group2: "Power Non TSEL" },

  { group1: "QE", group2: "QE Redaman" },
  { group1: "QE", group2: "QE Jarak" },

  { group1: "ISR", group2: "ISR Segel Balmon" },
  { group1: "ISR", group2: "ISR Interference Internal" },
  { group1: "ISR", group2: "ISR Interference External" },

  { group1: "Warranty", group2: "Warranty New Link" },
  { group1: "Warranty", group2: "Warranty Redeploy" },

  { group1: "Gamas", group2: "Gamas SKKL" },
  { group1: "Gamas", group2: "Gamas FO Darat / SKSO" },
  { group1: "Gamas", group2: "Gamas Repetitive" },

  { group1: "Temperature", group2: "Temperature TSEL" },
  { group1: "Temperature", group2: "Temperature Non TSEL" },

  { group1: "Technical", group2: "Comcase Quality" },
  { group1: "Technical", group2: "Force Majeur" },
  { group1: "Technical", group2: "Routing TSEL" },
  { group1: "Technical", group2: "Routing TIF" },
  { group1: "Technical", group2: "Technical TSEL" },
  { group1: "Technical", group2: "Technical TIF" },
  { group1: "Technical", group2: "Technical Unknown" },
  { group1: "Technical", group2: "Vandalisme" },
  { group1: "Technical", group2: "Issue Tower" },
  { group1: "Technical", group2: "Obstacle" },
  { group1: "Technical", group2: "Sparepart Readiness" },
];

const ModalInput = ({ open, parameter, onCancel, onSave, dataModal, week }) => {
  const [form] = Form.useForm();
  const { getDetailSite } = useSite();
  const [selectedGroup1, setSelectedGroup1] = useState("");
  const [preview, setPreview] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [checked, setChecked] = useState(false);
  const [exclude, setExclude] = useState(false);
  const [optionsKpi, setOptionsKpi] = useState([]);

  const [downloadEvidance] = useLazyDownload_evidanceQuery();

  const userData = localStorage.getItem("user_data");
  const user = JSON.parse(userData);
  const isRegional = user.unit === "regional";

  const labelText = isRegional ? "Grouping RCA Regional" : "Grouping RCA Cnq";

  // const nameField = isRegional
  //   ? "grouping_rca_regional"
  //   : "grouping_rca";
  let nameField = "";
  switch (parameter) {
    case "packetloss ran to core":
      nameField = isRegional
        ? "grouping_rca_packetloss_regional"
        : "grouping_rca_packetloss_cnq";
      break;
    case "jitter ran to core":
      nameField = isRegional
        ? "grouping_rca_latency_regional"
        : "grouping_rca_latency_cnq";
      break;
    case "latency ran to core":
      nameField = isRegional
        ? "grouping_rca_jitter_regional"
        : "grouping_rca_jitter_cnq";
      break;

    default:
      break;
  }

  console.log("user data", userData, dataModal, parameter);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("vall", values, week);
        onSave({ ...values, site_sos: checked, exclude });
        form.resetFields();
        setPreview("");
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const getDetailData = useCallback(
    async (dataModal: DataModal) => {
      try {
        const result = await getDetailSite({
          query: {
            parameter: dataModal.parameter,
            id: dataModal.id,
            week: week,
          },
        }).unwrap();
        const siteDetail = result as SiteDetail;
        const siteDetails = {
          ...result,
          week: week,
        } as SiteDetail;
        setOptionsKpi(result?.options);
        setChecked(result?.site_sos);
        setExclude(result?.site_exclude);
        form.setFieldsValue(siteDetails);
        const parserEvidance = siteDetails.evidence
          ? JSON.parse(siteDetails?.evidence)
          : "";
        const dataPreview = parserEvidance[0]?.url;
        setPreview(dataPreview || "");
      } catch (error) {
        console.log(error);
      }
    },
    [form, getDetailSite, week]
  );

  useEffect(() => {
    if (open && dataModal) {
      getDetailData(dataModal);
      setFileList([]);
    } else if (!open) {
      form.resetFields();
    }
  }, [open, dataModal, form, getDetailData]);

  const handleChange = (info: any) => {
    const newList = info.fileList.slice(-1);
    setFileList(newList);
    form.setFieldsValue({ evidence: newList });
    const file = info.file;

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };
  const { Option } = Select;

  const label = `${checked ? "Yes" : "No"}`;

  const onChange: CheckboxProps["onChange"] = (e) => {
    setChecked(e.target.checked);
  };

  const handleIconDownload = async () => {
    try {
      const result = await downloadEvidance({
        query: {
          id: dataModal.id,
          kpi: form.getFieldValue("kpi")[0],
        },
      }).unwrap();

      const blobUrl = URL.createObjectURL(result as Blob);

      const tempLink = document.createElement("a");
      console.log(result);
      console.log("blobUrl", blobUrl);

      tempLink.href = blobUrl;

      tempLink.setAttribute("download", "evidance.xlsx");

      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Failed to download the file:", error);
    }
  };
  const getGroup2 = (group1) => {
    return GroupingOptions.filter((item) => item.group1 === group1).map(
      (item) => item.group2
    );
  };

  const group1Options = [...new Set(GroupingOptions.map((i) => i.group1))];

  const group2Options = GroupingOptions.filter(
    (i) => i.group1 === selectedGroup1
  ).map((i) => i.group2);

  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
      <div>
        <p className="text-xl font-bold text-center w-full my-6">
          Update Site Exlcude
        </p>
        <Form form={form} layout="vertical">
          <Form.Item name="id" className="hidden">
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          <Form.Item name="month" className="hidden">
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          <Form.Item name="week" className="hidden">
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          <Form.Item name="detail_rca" className="hidden">
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          <Form.Item name="ticket_id" className="hidden">
            <Input placeholder="Masukkan Ticket ID" />
          </Form.Item>

          <Form.Item
            label="Site ID"
            name="site_id"
            rules={[{ required: true, message: "Masukkan Site ID" }]}
          >
            <Input placeholder="Masukkan Site ID" readOnly />
          </Form.Item>
          {(dataModal?.parameter == "mttrq major" ||
            dataModal?.parameter == "mttrq minor") && (
            <Form.Item
              label="Ttr Selisih"
              name="ttr_selisih"
              rules={[{ required: true, message: "Masukkan Ttr Selisih" }]}
            >
              <Input type="text" placeholder="Masukkan Ttr Selisih" />
            </Form.Item>
          )}
          {(dataModal?.parameter == "mttrq major" ||
            dataModal?.parameter == "mttrq minor") && (
            <Form.Item
              label="Ticket Id"
              name="ticket_id"
              rules={[{ required: true, message: "Masukkan Ticket Id" }]}
            >
              <Input type="text" placeholder="Masukkan Ticket Id" readOnly />
            </Form.Item>
          )}
          {dataModal?.parameter != "mttrq major" &&
            dataModal?.parameter != "mttrq minor" && (
              <Form.Item name="site_sos" label="Site SOS">
                <Checkbox onChange={onChange} checked={checked}>
                  {label}
                </Checkbox>
              </Form.Item>
            )}
          {!dataModal?.parameter?.includes("mttrq") ? (
            <div>
              <Form.Item
                label={labelText + " 1"}
                name={nameField + "_1"}
                rules={[{ required: true, message: "Masukkan Grouping RCA" }]}
              >
                <Select
                  placeholder="Pilih Grouping RCA 1"
                  onChange={(value) => setSelectedGroup1(value)}
                >
                  {group1Options.map((g1) => (
                    <Option key={g1} value={g1}>
                      {g1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={labelText + " 2"}
                name={nameField + "_2"}
                rules={[{ required: true, message: "Masukkan Grouping RCA" }]}
              >
                <Select
                  placeholder="Pilih Grouping RCA 2"
                  disabled={!selectedGroup1}
                >
                  {group2Options.map((g2) => (
                    <Option key={g2} value={g2}>
                      {g2}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          ) : (
            <Form.Item
              label="Grouping RCA"
              name="grouping_rca"
              rules={[{ required: true, message: "Masukkan Grouping RCA" }]}
            >
              <Select placeholder="Pilih Grouping RCA">
                <Option value="QE (Quality Enhancement)">
                  QE (Quality Enhancement)
                </Option>
                <Option value="Double Ticket">⁠Double Ticket</Option>
                <Option value="ISR">⁠ISR</Option>
                <Option value="⁠Pengiriman Sparepart">
                  ⁠Pengiriman Sparepart
                </Option>
                <Option value="⁠Action Butuh CRA / CRQ">
                  ⁠Action Butuh CRA / CRQ
                </Option>
                <Option value="Ticket Ceragon">Ticket Ceragon</Option>
                <Option value="Perjalanan menunggu transportasi">
                  Perjalanan menunggu transportasi
                </Option>
                <Option value="Comcase">Comcase</Option>
                <Option value="⁠Issue TSEL">⁠Issue TSEL</Option>
                <Option value="⁠Warranty">⁠Warranty</Option>
                <Option value="⁠Waiting DWS">⁠Waiting DWS</Option>
              </Select>
            </Form.Item>
          )}

          {dataModal?.parameter != "mttrq major" &&
            dataModal?.parameter != "mttrq minor" && (
              <Form.Item
                label="KPI"
                name="kpi"
                rules={[{ required: true, message: "Pilih KPI" }]}
              >
                <Select mode="multiple" placeholder="Pilih KPI">
                  {optionsKpi?.map((kpi) => (
                    <Option key={kpi} value={kpi}>
                      {kpi}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

          <Form.Item
            label="Keterangan Rekon"
            name="note"
            rules={[{ required: true, message: "Masukkan Keterangan Rekon" }]}
          >
            <TextArea placeholder="Masukkan Keterangan Rekon" />
          </Form.Item>

          <Form.Item
            label="Evidence"
            name="evidence"
            rules={[{ required: true, message: "Masukkan Evidance" }]}
          >
            <Upload.Dragger
              name="evidence"
              beforeUpload={() => false}
              style={{ padding: "10px" }}
              fileList={fileList}
              onChange={handleChange}
              onRemove={() => setPreview("")}
            >
              {preview ? (
                <div style={{ marginTop: 16 }}>
                  <img
                    src={preview}
                    alt="evidence preview"
                    style={{
                      display: "block",
                      maxWidth: "200px",
                      marginTop: 8,
                    }}
                  />
                </div>
              ) : (
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                  <p>Upload File</p>
                </p>
              )}
            </Upload.Dragger>
            {/* {preview && (
              <Button className="mt-3" onClick={handleIconDownload}>
                Download Evidance
              </Button>
            )} */}
          </Form.Item>

          {dataModal?.parameter != "mttrq major" &&
            dataModal?.parameter != "mttrq minor" && (
              <Form.Item name="site_exclude" label="Exclude?">
                <Checkbox
                  onChange={() => setExclude(!exclude)}
                  checked={exclude}
                >
                  {label}
                </Checkbox>
              </Form.Item>
            )}

          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setPreview("");
                onCancel();
              }}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={handleOk}>
              Save
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalInput;
