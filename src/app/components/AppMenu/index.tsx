import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type AppMenuProps = MenuProps;

const AppMenu: React.FC<AppMenuProps> = ({
  defaultSelectedKeys,
  selectedKeys,
  onClick,
  ...rest
}) => {
  const [current, setCurrent] = useState<string | undefined>(
    defaultSelectedKeys?.[0]
  );
  const { menuId } = useParams();

  // Sync selected key with props (route changes)
  useEffect(() => {
    if (menuId) setCurrent(menuId);
    else if (selectedKeys?.[0]) {
      setCurrent(selectedKeys[0]);
    }
  }, [menuId, selectedKeys]);

  const handleClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
    onClick?.(e); // Pass event to parent
  };

  return <Menu onClick={handleClick} selectedKeys={[current!]} {...rest} />;
};

export { AppMenu };
