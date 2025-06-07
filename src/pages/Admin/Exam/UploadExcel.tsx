import DropzoneComponent from "../../../components/form/form-elements/DropZone";
import { readExcelFile } from "../../../helper/ExcelReader";
import { questionServices } from "../../../services/questionServices";
import toast from "react-hot-toast";
// import { useNavigate } from "react-router";

const UploadExcel = () => {
  // const navigate = useNavigate();

  const handleExcelData = async (
    error: Error | null,
    data: { detailQuestions: any[]; examAndSubject: any[] } | null
  ) => {
    if (error) {
      console.error("Error reading Excel file:", error);
      toast.error("Lỗi khi đọc file Excel");
      return;
    }

    if (data) {
      try {
        const promise = questionServices.uploadExcel({
          file: {
            detailQuestions: data.detailQuestions,
            examAndSubject: data.examAndSubject,
          },
        });

        toast.promise(promise, {
          loading: "Đang tải lên dữ liệu...",
          success: () => {
            return "Tải lên thành công!";
          },
          error: (err) => err?.response?.data?.error,
        });

        await promise;
      } catch (error: any) {
        console.error("Error uploading Excel:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          Tải lên câu hỏi từ Excel
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Kéo thả file Excel hoặc click để chọn file
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <DropzoneComponent
          onFileAccepted={(file) => readExcelFile(file, handleExcelData)}
          accept={{
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
              [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
          }}
          maxFiles={1}
        />
      </div>
    </div>
  );
};

export default UploadExcel;
