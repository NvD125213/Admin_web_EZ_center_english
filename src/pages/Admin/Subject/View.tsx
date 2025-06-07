import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import { SubjectType } from "../../../types/subject";
import {
  BaseTable,
  BaseTableState,
  DefaultTableState,
} from "../../../components/common/BaseTable";
import { useQueryString } from "../../../hooks/useQueryString";
import { useNavigate } from "react-router";
import { useModal } from "../../../hooks/useModal";
import SubjectAction from "./Action";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  useGetSubjectsQuery,
  useDeleteSubjectMutation,
} from "../../../services/subjectServices";

// Create a more specific type for our table state
type SubjectTableState = Required<
  Pick<BaseTableState, "selectedItems" | "pageIndex" | "pageSize">
> &
  Pick<BaseTableState, "sortBy" | "sortOrder">;

const columns = [
  {
    key: "name",
    name: "Chủ đề bài thi",
    sortable: true,
  },
];

const SubjectPage = () => {
  const queryString = useQueryString();
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();
  const [tableState, setTableState] = useState<SubjectTableState>({
    selectedItems: [],
    sortBy: "",
    sortOrder: "",
    pageIndex: Number(queryString.page) || 1,
    pageSize: Number(queryString.limit) || 10,
  });
  const [selectedSubject, setSelectedSubject] = useState<
    SubjectType | undefined
  >(undefined);

  // Sync state with query string changes
  useEffect(() => {
    const newPage = Number(queryString.page) || 1;
    const newLimit = Number(queryString.limit) || 10;
    if (newPage !== tableState.pageIndex || newLimit !== tableState.pageSize) {
      setTableState((prev) => ({
        ...prev,
        pageIndex: newPage,
        pageSize: newLimit,
      }));
    }
  }, [queryString.page, queryString.limit]);

  // Redirect to default query params if missing
  useEffect(() => {
    if (!queryString.page || !queryString.limit) {
      navigate(`?page=1&limit=10`, { replace: true });
    }
  }, [navigate, queryString.page, queryString.limit]);

  // Fetch data using RTK Query
  const { data, isLoading, isError, error } = useGetSubjectsQuery({
    page: tableState.pageIndex,
    limit: tableState.pageSize,
  });

  const [deleteSubject] = useDeleteSubjectMutation();

  const totalPages = data?.totalPages || 1;

  const handleTableStateChange = (newState: BaseTableState) => {
    const updatedState: SubjectTableState = {
      selectedItems: newState.selectedItems || [],
      pageIndex: newState.pageIndex || 1,
      pageSize: newState.pageSize || 10,
      sortBy: newState.sortBy || "",
      sortOrder: newState.sortOrder || "",
    };
    setTableState(updatedState);
    navigate(`?page=${updatedState.pageIndex}&limit=${updatedState.pageSize}`);
  };

  // Handle success event when update success
  const handleSuccess = () => {
    // RTK Query will automatically handle cache invalidation
  };

  const handleDelete = async (item: SubjectType) => {
    const confirm = window.confirm(
      `Bạn có chắc chắn muốn xóa chủ đề này không?`
    );
    if (!confirm) return;

    try {
      await deleteSubject(item.id).unwrap();
      toast.success(`Xóa chủ đề thành công!`);
    } catch (error: any) {
      console.error("Lỗi khi xóa chủ đề:", error);
      toast.error("Đã xảy ra lỗi khi xóa chủ đề. Vui lòng thử lại!");
    }
  };

  const handleBulkDelete = async () => {
    if (!tableState.selectedItems?.length) return;

    const confirm = window.confirm(
      `Bạn có chắc chắn muốn xóa ${tableState.selectedItems.length} chủ đề đã chọn không?`
    );
    if (!confirm) return;

    try {
      await Promise.all(
        tableState.selectedItems.map((item) => deleteSubject(item.id).unwrap())
      );
      toast.success(
        `Xóa ${tableState.selectedItems.length} chủ đề thành công!`
      );
    } catch (error: any) {
      console.error("Lỗi khi xóa nhiều chủ đề:", error);
      toast.error("Đã xảy ra lỗi khi xóa chủ đề. Vui lòng thử lại!");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Chủ đề bài thi" />

      <div className="flex justify-end mb-4 gap-2">
        {tableState.selectedItems?.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200">
            <FiTrash2 size={20} />
            Xóa đã chọn
          </button>
        )}
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
          <BaseTable
            columns={columns}
            data={data?.data || []}
            tableState={tableState}
            onTableStateChange={handleTableStateChange}
            count={data?.total || 0}
            isPending={isLoading}
            actionsColumn={{
              label: "Thao tác",
              actions: [
                {
                  label: "Sửa",
                  icon: <FiEdit2 size={20} />,
                  className: "text-blue-600 hover:text-blue-700",
                  onClick: (item) => {
                    setSelectedSubject(item);
                    openModal();
                  },
                },
                {
                  label: "Xóa",
                  icon: <FiTrash2 size={20} />,
                  className: "text-red-600 hover:text-red-700",
                  onClick: handleDelete,
                },
              ],
            }}
          />
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
