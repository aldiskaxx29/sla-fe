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

type DataModal = { parameter: string; id: string };

type SiteDetail = {
  site_id: string;
  group_rca: string;
  note: string;
  evidence?: string;
  ttr_slisih?: string;
  kpi: string[];
  site_sos: boolean;
};

const ModalInput = ({ open, onCancel, onSave, dataModal, week }) => {
  const [form] = Form.useForm();
  const { getDetailSite } = useSite();
  const [preview, setPreview] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [checked, setChecked] = useState(false);
  const [optionsKpi, setOptionsKpi] = useState([]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('vall', values, week)
        onSave({ ...values, site_sos: checked });
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
          },
        }).unwrap();
        const siteDetail = result as SiteDetail;
        const siteDetails = {
          ...result,
          week: week,
        } as SiteDetail;
        console.log("ress", result, "-> replaced week:", week, siteDetails);

        setOptionsKpi(result?.options);
        setChecked(result?.site_sos);
        form.setFieldsValue(siteDetails);
        const parserEvidance = siteDetails.evidence
          ? JSON.parse(siteDetails?.evidence)
          : "";
        const dataPreview = `${parserEvidance[0]?.url}`;
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
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          {(dataModal?.parameter == "mttrq major" ||
            dataModal?.parameter == "mttrq minor") && (
              <Form.Item
                label="Ttr Selisih"
                name="ttr_selisih"
                rules={[{ required: true, message: "Masukkan Ttr Selisih" }]}
              >
                <Input type="time" placeholder="Masukkan Ttr Selisih" />
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
            <Form.Item
              label="Grouping RCA"
              name="grouping_rca"
              rules={[{ required: true, message: "Masukkan Grouping RCA" }]}
            >
              <Select placeholder="Pilih Grouping RCA">
                <Option value="Cap End Site No Order">
                  Cap End Site No Order
                </Option>
                <Option value="Capacity - Intermediate">
                  Capacity - Intermediate
                </Option>
                <Option value="Cap Under Order">Cap Under Order</Option>
                <Option value="Cap Ada order tapi lambat">
                  Cap Ada order tapi lambat
                </Option>
                <Option value="Availablibilty - Gamas">
                  Availablibilty - Gamas
                </Option>
                <Option value="Cap LAN/Optic/CO">Cap LAN/Optic/CO</Option>
                <Option value="Cap Hardware / Software">
                  Cap Hardware / Software
                </Option>
                <Option value="Cap Intermediate / Hub">
                  Cap Intermediate / Hub
                </Option>
                <Option value="Cap 3rd Party">Cap 3rd Party</Option>
                <Option value="Power TSEL">Power TSEL</Option>
                <Option value="Warranty New Link">Warranty New Link</Option>
                <Option value="Warranty Redeploy">Warranty Redeploy</Option>
                <Option value="Temperature TSEL">Temperature TSEL</Option>
                <Option value="Routing TSEL">Routing TSEL</Option>
                <Option value="Quality TSEL">Quality TSEL</Option>
                <Option value="Issue Tower">Issue Tower</Option>
              </Select>
            </Form.Item>
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
          </Form.Item>

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
