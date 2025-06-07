import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import React from "react";

interface MenuAction {
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  className?: string;
  onClick?: () => void;
}

interface DropdownMenuActionProps {
  items: (MenuAction | "divider")[];
  width?: number | string;
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

const DropdownMenuAction: React.FC<DropdownMenuActionProps> = ({
  items,
  width = 220,
  anchorEl,
  open,
  onClose,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width, maxWidth: "100%", borderRadius: 2, boxShadow: "none" },
      }}>
      {items.map((item, index) => {
        if (item === "divider") {
          return <Divider key={`divider-${index}`} />;
        }

        return (
          <MenuItem
            key={index}
            className={item.className}
            onClick={() => {
              item.onClick?.();
              onClose(); // Đóng menu sau khi click
            }}
            sx={{ py: 1 }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
            {item.shortcut && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", ml: 2 }}>
                {item.shortcut}
              </Typography>
            )}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default DropdownMenuAction;
