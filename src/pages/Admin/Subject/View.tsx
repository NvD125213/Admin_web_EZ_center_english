import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import { subjectServices } from "../../../services/subjectServices";
import { SubjectType } from "../../../types/subject";
import CommonTable from "../../../components/common/Table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryString } from "../../../hooks/useQueryString";
import {
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

import { useNavigate } from "react-router";
import { useModal } from "../../../hooks/useModal";
import SubjectAction from "./Action";
import toast from "react-hot-toast";

const columns: { key: keyof SubjectType; label: string }[] = [
  { key: "name", label: "Nhà cung cấp" },
];

const SubjectPage = () => {
  const queryString = useQueryString();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();
  const [page, setPage] = useState(Number(queryString.page) || 1);
  const [limit, setLimit] = useState(Number(queryString.limit) || 10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<
    SubjectType | undefined
  >(undefined);
  const [value, setValue] = useState("");

  const handleChangeSelect = (event: any) => {
    setValue(event.target.value);
  };
  // Sync state with query string changes
  useEffect(() => {
    const newPage = Number(queryString.page) || 1;
    const newLimit = Number(queryString.limit) || 10;
    if (newPage !== page || newLimit !== limit) {
      setPage(newPage);
      setLimit(newLimit);
    }
  }, [queryString.page, queryString.limit]);

  // Redirect to default query params if missing
  useEffect(() => {
    if (!queryString.page || !queryString.limit) {
      navigate(`?page=1&limit=10`, { replace: true });
    }
  }, [navigate, queryString.page, queryString.limit]);

  // Fetch data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subjects", page, limit],
    queryFn: () => subjectServices.get({ page, limit }),
    cacheTime: 10000,
    keepPreviousData: true,
  });

  const totalPages = data?.totalPages || 1;

  // Prefetch next page for faster navigation
  useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["subjects", page + 1, limit],
        queryFn: () => subjectServices.get({ page: page + 1, limit }),
      });
    }
  }, [page, limit, totalPages, queryClient]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    navigate(`?page=${value}&limit=${limit}`);
  };

  const handleChangeLimit = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setPage(1);
    navigate(`?page=1&limit=${newLimit}`);
  };

  // Handle success event when update success
  const handleSuccess = () => {
    queryClient.invalidateQueries(["subjects", page, limit]);
  };

  const handleBulkDelete = async (id: any) => {
    const confirm = window.confirm(
      `Bạn có chắc chắn muốn xóa chủ đề đã chọn không?`
    );
    if (!confirm) return;

    try {
      await subjectServices.delete(id);
      toast.success(`Xóa ${selectedIds.length} chủ đề thành công!`);
      queryClient.invalidateQueries(["subjects", page, limit]);
    } catch (error: any) {
      console.error("Lỗi khi xóa nhiều chủ đề:", error);
      toast.error("Đã xảy ra lỗi khi xóa chủ đề. Vui lòng thử lại!");
    }
  };
  return (
    <>
      <PageBreadcrumb pageTitle="Chủ đề bài thi" />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setSelectedSubject(undefined);
            openModal();
          }}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
          <IoIosAdd size={24} />
          Thêm
        </button>
      </div>
      <div className="space-y-6">
        {isError ? (
          <div className="text-red-500">{(error as any).message}</div>
        ) : (
          <CommonTable
            setSelectedIds={setSelectedIds}
            selectedIds={selectedIds}
            title="Bảng"
            isLoading={isLoading}
            columns={columns}
            pagination={{
              currentPage: page,
              pageSize: limit,
            }}
            onEdit={(row) => {
              setSelectedSubject(row);
              openModal();
            }}
            onDelete={(id) => handleBulkDelete(id)}
            data={data?.data}
          />
        )}

        {totalPages > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChange}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="limit-label">Hiển thị</InputLabel>
              <Select
                labelId="limit-label"
                value={limit}
                label="Hiển thị"
                onChange={handleChangeLimit}>
                <MenuItem value={5}>5 / trang</MenuItem>
                <MenuItem value={10}>10 / trang</MenuItem>
                <MenuItem value={20}>20 / trang</MenuItem>
                <MenuItem value={50}>50 / trang</MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
      </div>
      <SubjectAction
        isOpen={isOpen}
        data={selectedSubject}
        onCloseModal={closeModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default SubjectPage;
