import { useEffect, useState } from "react";
import { SubjectType, ExamType } from "../../../types";
import CommonModal from "../../../components/common/Modal";
import { subjectServices } from "../../../services/subjectServices";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { examServices } from "../../../services/examServices";
import useSelectOptionData from "../../../hooks/useSelectOption";

interface ExamModalProps {
  isOpen: boolean;
  data?: ExamType;
  onCloseModal: () => void;
  onSuccess: () => void;
}

const ExamAction: React.FC<ExamModalProps> = ({
  isOpen,
  data,
  onCloseModal,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExamType>({
    defaultValues: { name: "", subject_id: "1" },
  });
  const { data: subjects } = useSelectOptionData<SubjectType>({
    service: () => subjectServices.get({ all: true }), // Giả sử service trả về mảng hoặc object
  });
  const [errorDetail, setErrorDetail] = useState("");
  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        subject_id: data.subject_id,
      });
    } else {
      reset({ name: "", subject_id: "1" });
    }
  }, [data, reset, onCloseModal]);
  const handleClose = () => {
    onCloseModal();
    reset({ name: "", subject_id: "1" }); // Gọi reset khi đóng modal
  };

  const sendRequest = async (formData: ExamType) => {
    try {
      const payload = {
        ...formData,
        skillType: Number(formData.subject_id), // Đảm bảo skillType là số
      };

      if (data?.id) {
        const res = await examServices.update({ ...payload, id: data.id });
        if (res.status === 200) {
          toast.success("Cập nhật bài thi thành công!");
        }
      } else {
        const res = await examServices.create(payload);
        if (res.status === 201) {
          toast.success("Tạo bài thi thành công!");
        }
      }
      onSuccess();
      onCloseModal();
      setErrorDetail("");
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setErrorDetail(error.response.data.message);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <CommonModal
      errorDetail={errorDetail}
      key={data?.id ?? "new"}
      isOpen={isOpen}
      title={data ? "Cập nhật bài thi" : "Tạo bài thi"}
      description="Tạo/cập nhật thông tin chi tiết cho bài thi bài thi."
      fields={[
        {
          name: "name",
          type: "text",
          label: "Nhập tên bài thi",
          register: register("name", {
            required: "Tên bài thi là bắt buộc",
            minLength: {
              value: 2,
              message: "Tên phải có ít nhất 2 ký tự",
            },
          }),
          placeholder: "Nhập tên bài thi",
          error: errors.name?.message,
        },
        {
          name: "subject_id",
          label: "Chủ đề bài thi",
          type: "select",
          control: control,
          options: [
            ...(subjects?.map((sub) => ({
              label: sub.name,
              value: String(sub.id),
              key: sub.id,
            })) || []),
          ],
          register: register("subject_id"),
          error: errors.subject_id?.message,
        },
      ]}
      onClose={handleClose}
      onSubmit={handleSubmit(sendRequest)}
      submitText={data?.id ? "Lưu thay đổi" : "Thêm"}
    />
  );
};

export default ExamAction;
