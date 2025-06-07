import { useState } from "react";
import {
  useGetMenusQuery,
  useReorderMenusMutation,
  useDeleteMenuMutation,
  Menu,
} from "../../../services/menuServices";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { IoRemoveOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Menu Item Component
const SortableMenuItem = ({
  menu,
  level = 0,
  onEdit,
  onDelete,
  onRestore,
}: {
  menu: Menu & { is_deleted?: boolean };
  level?: number;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onRestore: (menu: Menu) => void;
}) => {
  const theme = useTheme();
  const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : menu.is_deleted ? 0.6 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <>
      <Box ref={setNodeRef} style={style} {...attributes}>
        <Accordion
          sx={{
            "&:before": { display: "none" },
            boxShadow: "none",
            borderBottom: "1px dashed",
            borderColor: "divider",
            mb: 1,
            borderRadius: 1,
            backgroundColor: menu.is_deleted
              ? alpha(theme.palette.error.main, 0.05)
              : "transparent",
            transition: "all 0.2s ease-in-out",
            "&.Mui-expanded": {
              margin: "0 0 8px 0",
              backgroundColor: menu.is_deleted
                ? alpha(theme.palette.error.main, 0.08)
                : alpha(theme.palette.primary.main, 0.02),
            },
            cursor: "grab",
            "&:active": {
              cursor: "grabbing",
            },
          }}>
          <AccordionSummary
            expandIcon={
              hasChildren ? (
                <FiChevronDown />
              ) : (
                <IoRemoveOutline
                  style={{ color: theme.palette.text.secondary, opacity: 0.6 }}
                />
              )
            }
            sx={{
              pl: level * 3,
              minHeight: 56,
              "& .MuiAccordionSummary-content": {
                margin: "12px 0",
              },
            }}
            {...listeners}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                pr: 2,
                gap: 2,
              }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  gap: 2,
                }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: level === 0 ? 600 : 400,
                    color: menu.is_deleted
                      ? "error.main"
                      : level === 0
                      ? "primary.main"
                      : "text.primary",
                    textDecoration: menu.is_deleted ? "line-through" : "none",
                  }}>
                  {menu.name}
                </Typography>
                {hasChildren && menu.children && (
                  <Chip
                    size="small"
                    label={`${menu.children.length} mục con`}
                    sx={{
                      backgroundColor: menu.is_deleted
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.1),
                      color: menu.is_deleted ? "error.main" : "primary.main",
                      fontWeight: 500,
                    }}
                  />
                )}
                {menu.is_deleted && (
                  <Chip
                    size="small"
                    label="Đã xóa"
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: "error.main",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  opacity: menu.is_deleted ? 0.6 : 0.8,
                  "&:hover": { opacity: menu.is_deleted ? 0.6 : 1 },
                }}
                onClick={(e) => e.stopPropagation()}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}>
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: menu.is_deleted
                        ? "error.main"
                        : menu.status === "Open"
                        ? "success.main"
                        : "error.main",
                      display: "inline-block",
                      mr: 0.5,
                    }}
                  />
                  {menu.is_deleted
                    ? "Đã xóa"
                    : menu.status === "Open"
                    ? "Active"
                    : "Inactive"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minWidth: 80,
                    textAlign: "right",
                  }}>
                  Thứ tự: {menu.sort}
                </Typography>
                {menu.is_deleted ? (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      ml: 1,
                    }}>
                    <Tooltip title="Khôi phục">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(menu);
                        }}
                        sx={{
                          color: "success.main",
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.success.main,
                              0.1
                            ),
                          },
                        }}>
                        <FiPlus />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(menu);
                        }}
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}>
                        <FiEdit2 />
                      </Box>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      ml: 1,
                    }}>
                    <Tooltip title="Chỉnh sửa">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(menu);
                        }}
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}>
                        <FiEdit2 />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(menu);
                        }}
                        sx={{
                          color: "error.main",
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.1
                            ),
                          },
                        }}>
                        <FiTrash2 />
                      </Box>
                    </Tooltip>
                  </Box>
                )}
              </Stack>
            </Box>
          </AccordionSummary>
          {hasChildren && (
            <AccordionDetails
              sx={{
                p: 0,
                pl: 2,
                borderLeft: "2px dashed",
                borderColor: "divider",
                ml: 2,
              }}>
              <SortableContext
                items={menu.children?.map((child) => child.id) ?? []}
                strategy={verticalListSortingStrategy}>
                {menu.children?.map((child) => (
                  <SortableMenuItem
                    key={child.id}
                    menu={child}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                ))}
              </SortableContext>
            </AccordionDetails>
          )}
        </Accordion>
      </Box>
    </>
  );
};

const MenuView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const [reorderMenus] = useReorderMenusMutation();
  const [deleteMenu] = useDeleteMenuMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [menuToRestore, setMenuToRestore] = useState<Menu | null>(null);

  const { data, isLoading } = useGetMenusQuery({
    search: searchTerm || undefined,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the parent menu that contains both active and over items
      const findParentMenu = (menus: Menu[]): Menu | null => {
        for (const menu of menus) {
          if (menu.children) {
            const activeChild = menu.children.find(
              (child) => child.id === active.id
            );
            const overChild = menu.children.find(
              (child) => child.id === over.id
            );
            if (activeChild && overChild) {
              return menu;
            }
            const foundInChildren = findParentMenu(menu.children);
            if (foundInChildren) {
              return foundInChildren;
            }
          }
        }
        return null;
      };

      const parentMenu = findParentMenu(data?.data ?? []);
      const menusToReorder = parentMenu ? parentMenu.children : data?.data;

      if (menusToReorder) {
        const oldIndex = menusToReorder.findIndex(
          (menu) => menu.id === active.id
        );
        const newIndex = menusToReorder.findIndex(
          (menu) => menu.id === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedMenus = arrayMove(menusToReorder, oldIndex, newIndex);
          const updatedSorts = reorderedMenus.map((menu, index) => ({
            id: menu.id,
            sort: index + 1,
          }));

          try {
            await toast.promise(reorderMenus(updatedSorts).unwrap(), {
              loading: "Đang cập nhật thứ tự menu...",
              success: "Cập nhật thứ tự menu thành công!",
              error: (err) => {
                return (
                  err?.data?.error || "Có lỗi xảy ra khi cập nhật thứ tự menu!"
                );
              },
            });
          } catch (error) {
            console.error("Error reordering menus:", error);
          }
        }
      }
    }
  };

  const handleCreateMenu = () => {
    navigate("/menu/detail");
  };

  const handleEditMenu = (menu: Menu) => {
    navigate(`/menu/detail/${menu.id}`);
  };

  const handleDeleteMenu = (menu: Menu) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
  };

  const handleRestoreMenu = (menu: Menu) => {
    setMenuToRestore(menu);
    setRestoreDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;

    try {
      await toast.promise(deleteMenu(menuToDelete.id).unwrap(), {
        loading: "Đang xóa menu...",
        success: "Xóa menu thành công!",
        error: (err) => {
          return err?.data?.error || "Có lỗi xảy ra khi cập nhật thứ tự menu!";
        },
      });
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMenuToDelete(null);
  };

  const handleCloseRestoreDialog = () => {
    setRestoreDialogOpen(false);
    setMenuToRestore(null);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý menu" />
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: "#fff",
          }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}>
            <Box sx={{ position: "relative", width: 300 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <FiSearch
                      style={{
                        marginRight: 8,
                        color: theme.palette.text.secondary,
                      }}
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.default",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleCreateMenu}
              startIcon={<FiPlus />}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 1,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                },
              }}>
              Tạo menu mới
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "#fff",
            maxWidth: 1200,
            mx: "auto",
          }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}>
              <Typography color="text.secondary">Đang tải...</Typography>
            </Box>
          ) : data?.data.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
                flexDirection: "column",
                gap: 2,
              }}>
              <Typography color="text.secondary">
                Không tìm thấy menu nào
              </Typography>
              <Button
                variant="outlined"
                onClick={handleCreateMenu}
                startIcon={<FiPlus />}>
                Tạo menu đầu tiên
              </Button>
            </Box>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={data?.data.map((menu) => menu.id) ?? []}
                strategy={verticalListSortingStrategy}>
                {data?.data.map((menu) => (
                  <SortableMenuItem
                    key={menu.id}
                    menu={menu}
                    onEdit={handleEditMenu}
                    onDelete={handleDeleteMenu}
                    onRestore={handleRestoreMenu}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </Paper>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">Xác nhận xóa menu</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Bạn có chắc chắn muốn xóa menu "{menuToDelete?.name}"? Menu sẽ
              được chuyển sang trạng thái không hoạt động.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              Hủy
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={restoreDialogOpen}
          onClose={handleCloseRestoreDialog}
          aria-labelledby="restore-dialog-title"
          aria-describedby="restore-dialog-description">
          <DialogTitle id="restore-dialog-title">
            Xác nhận khôi phục menu
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="restore-dialog-description">
              Bạn có chắc chắn muốn khôi phục menu "{menuToRestore?.name}"? Menu
              sẽ được chuyển sang trạng thái hoạt động.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRestoreDialog} color="inherit">
              Hủy
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default MenuView;
