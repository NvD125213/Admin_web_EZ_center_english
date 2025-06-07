import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  Button,
  Checkbox,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { CiCircleMore } from "react-icons/ci";
import DropdownMenuAction from "./DropdownAction";
import EmptyState from "./EmptyState";

export type HeaderTable = {
  row?: (value: any, rowData: any) => React.ReactNode;
  sortable?: boolean;
  name: string;
  key: string;
};

export type BaseTableState = {
  selectedItems?: any[];
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
  pageIndex?: number;
  pageSize?: number;
  day?: number;
  month?: number;
  year?: number;
  search?: string;
};

export const DefaultTableState: BaseTableState = {
  selectedItems: [],
  sortBy: "",
  sortOrder: "",
  pageIndex: 1,
  pageSize: 10,
};

// Define a type that extends the base type with string index signature
type RowData = {
  id: string | number;
  [key: string]: any;
};

interface MenuAction {
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick?: (item: any) => void;
}

interface BaseTableProps<T extends RowData> {
  columns: HeaderTable[];
  data: T[];
  tableState?: Partial<BaseTableState>;
  onTableStateChange: (state: BaseTableState) => void;
  hideCheckboxes?: boolean;
  count?: number;
  isPending?: boolean;
  actionsColumn?: {
    label: string;
    actions: MenuAction[];
  };
}

export const BaseTable = <T extends RowData>({
  columns,
  data,
  tableState = DefaultTableState,
  onTableStateChange,
  hideCheckboxes = false,
  count = 0,
  isPending = false,
  actionsColumn,
}: BaseTableProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const open = Boolean(anchorEl);

  const {
    selectedItems = [],
    sortBy,
    sortOrder,
    pageIndex = 0,
    pageSize = 10,
  } = tableState;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const updateTableState = (newState: BaseTableState) => {
    onTableStateChange?.(newState);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSelectedItems = e.target.checked ? data : [];
    updateTableState({ ...tableState, selectedItems: updatedSelectedItems });
  };

  const toggleSelectItem = (row: T) => {
    const exists = selectedItems.some((item) => item.id === row.id);
    const updatedSelectedItems = exists
      ? selectedItems.filter((item) => item.id !== row.id)
      : [...selectedItems, row];
    updateTableState({ ...tableState, selectedItems: updatedSelectedItems });
  };

  const handleSort = (columnKey: string) => {
    const updatedSortOrder =
      sortBy === columnKey
        ? sortOrder === "asc"
          ? "desc"
          : sortOrder === "desc"
          ? ""
          : "asc"
        : "asc";
    const updatedSortBy = updatedSortOrder === "" ? "" : columnKey;
    updateTableState({
      ...tableState,
      sortBy: updatedSortBy,
      sortOrder: updatedSortOrder,
    });
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    updateTableState({ ...tableState, pageIndex: newPage });
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    updateTableState({
      ...tableState,
      pageSize: event.target.value as number,
      pageIndex: 1,
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, item: T) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentItem(null);
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (!isPending && data.length <= 0) return <EmptyState />;

  // Skeleton rows
  const renderSkeleton = () => {
    return Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={index}>
        {!hideCheckboxes && (
          <TableCell className="px-4 py-3 text-start">
            <Skeleton height={24} width={24} />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell key={column.key} className="px-5 py-3 text-start">
            <Skeleton height={24} />
          </TableCell>
        ))}
        {actionsColumn && (
          <TableCell className="px-5 py-3 text-start">
            <Skeleton height={24} width={24} />
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHead className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {!hideCheckboxes && (
                <TableCell className="px-4 py-3 text-start">
                  <Checkbox
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={toggleSelectAll}
                    disabled={isPending}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                  style={{ cursor: column.sortable ? "pointer" : "default" }}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }>
                  <Box display="flex" alignItems="center" gap={1}>
                    {column.name}
                    {column.sortable &&
                      (sortBy === column.key ? (
                        sortOrder === "asc" ? (
                          <ArrowDropUpIcon />
                        ) : sortOrder === "desc" ? (
                          <ArrowDropDownIcon />
                        ) : (
                          <UnfoldMoreIcon />
                        )
                      ) : (
                        <UnfoldMoreIcon />
                      ))}
                  </Box>
                </TableCell>
              ))}
              {actionsColumn && (
                <TableCell
                  style={{
                    paddingLeft: "25px",
                  }}
                  className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                  {actionsColumn.label}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {isPending
              ? renderSkeleton()
              : data.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    {!hideCheckboxes && (
                      <TableCell className="px-4 py-3 text-start">
                        <Checkbox
                          checked={selectedItems.some(
                            (item) => item.id === row.id
                          )}
                          onChange={() => toggleSelectItem(row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                        {column.row
                          ? column.row(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                    {actionsColumn && (
                      <TableCell className="text-start">
                        <Button
                          id="basic-button"
                          aria-controls={open ? "basic-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? "true" : undefined}
                          onClick={(e) => handleClick(e, row)}
                          disabled={isPending}>
                          <CiCircleMore size={24} />
                        </Button>
                        <DropdownMenuAction
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          items={actionsColumn.actions.map((action) => ({
                            label: action.label,
                            icon: action.icon,
                            className: action.className,
                            onClick: () => {
                              action.onClick?.(currentItem);
                              handleClose();
                            },
                          }))}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {count > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Stack
            spacing={isMobile ? 1 : 2}
            alignItems="center"
            width="100%"
            px={{ xs: 1, sm: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={isMobile ? 1 : 2}
              alignItems="center"
              justifyContent={{ sm: "space-between" }}
              width="100%"
              flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  className="text-black dark:text-white"
                  fontSize={isMobile ? "0.75rem" : "1rem"}>
                  Bản ghi / page:
                </Typography>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  size="small"
                  sx={{
                    minWidth: isMobile ? 60 : 80,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  }}>
                  {[5, 10, 20, 50].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <Stack
                direction="row"
                spacing={isMobile ? 0.5 : 1.5}
                alignItems="center"
                flexWrap="wrap"
                gap={3}
                justifyContent="center">
                <Button
                  onClick={() =>
                    handlePageChange(
                      {} as React.ChangeEvent<unknown>,
                      pageIndex - 1
                    )
                  }
                  disabled={pageIndex === 1}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    minWidth: 80,
                    display: { xs: "none", sm: "inline-flex" },
                  }}>
                  Trước
                </Button>

                <Pagination
                  count={totalPages}
                  page={pageIndex}
                  onChange={handlePageChange}
                  showFirstButton={!isMobile}
                  showLastButton={!isMobile}
                  siblingCount={isMobile ? 0 : 1}
                  boundaryCount={1}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />

                <Button
                  onClick={() =>
                    handlePageChange(
                      {} as React.ChangeEvent<unknown>,
                      pageIndex + 1
                    )
                  }
                  disabled={pageIndex >= totalPages}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    minWidth: 80,
                    display: { xs: "none", sm: "inline-flex" },
                  }}>
                  Sau
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </div>
      )}
    </div>
  );
};

export default BaseTable;
