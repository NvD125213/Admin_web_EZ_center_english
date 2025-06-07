import {
  MenuItem,
  Box,
  Typography,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { IoIosArrowForward } from "react-icons/io";

export const renderMenuOptions = (menus: any[], level = 0) => {
  const theme = useTheme();

  return menus.flatMap((menu) => {
    const indent = 2 + level * 2; // Tăng khoảng cách theo cấp
    const hasChildren = menu.children?.length > 0;
    const isChild = menu.parent_id !== null; // Kiểm tra xem có phải menu con không

    const items = [
      <MenuItem
        key={menu.id}
        value={String(menu.id)}
        sx={{
          pl: indent,
          fontWeight: level === 0 ? 600 : 400,
          color: level === 0 ? "primary.main" : "text.primary",
          "&:hover": {
            backgroundColor:
              level === 0
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.action.hover, 0.08),
          },
          minHeight: 40,
          py: 1,
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            justifyContent: "space-between",
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              minWidth: 0, // Để text có thể truncate
            }}>
            {isChild && (
              <IoIosArrowForward
                size={14}
                style={{
                  color: theme.palette.text.secondary,
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              variant={level === 0 ? "body1" : "body2"}
              sx={{
                color: level === 0 ? "primary.main" : "text.primary",
                fontWeight: level === 0 ? 600 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                ml: isChild ? 0.5 : 0, // Thêm margin nếu có icon
              }}>
              {menu.name}
            </Typography>
          </Box>
          {hasChildren && (
            <Chip
              size="small"
              label={`${menu.children.length} mục con`}
              sx={{
                ml: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                height: 24,
                flexShrink: 0,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: "0.75rem",
                },
              }}
            />
          )}
        </Box>
      </MenuItem>,
    ];

    // Nếu có children, gọi đệ quy để render tiếp
    if (hasChildren) {
      items.push(...renderMenuOptions(menu.children, level + 1));
    }

    return items;
  });
};
