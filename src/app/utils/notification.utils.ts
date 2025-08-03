// Antd
import { notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";

type TNotification = "success" | "info" | "warning" | "error";
type TNotificationPayload = {
  key: string;
  message: string;
  description?: string;
  placement?: NotificationPlacement;
};

/**
 * @description Open notification
 *
 * @return {void} void
 */
export const notificationUtils_open = (
  type: TNotification,
  payload: TNotificationPayload
): void => {
  notification[type]({
    ...payload,
    placement: payload?.placement || "topRight",
    style: {
      backgroundColor: "#FBE4E8",
      borderRadius: "4px",
      boxShadow: "0 7px 15px 0 rgba(0, 0, 0, 0.1)",
      color: "#FF647C",
      fontSize: "12px",
      minWidth: "448px",
    },
  });
};
