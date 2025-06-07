import { useEffect } from "react";
import { SubjectType } from "../../../types/subject";
import CommonModal from "../../../components/common/Modal";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "../../../services/subjectServices";

interface SubjectModalProps {
  isOpen: boolean;
  data?: SubjectType;
  onCloseModal: () => void;
  onSuccess: () => void;
}

const SubjectAction: React.FC<SubjectModalProps> = ({
  isOpen,
  data,
  onCloseModal,
  onSuccess,
}) => {
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SubjectType>({
    defaultValues: { name: "", skillType: "1" },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        skillType: data.skillType,
      });
    } else {
      reset({ name: "", skillType: "1" });
    }
  }, [data, reset, onCloseModal]);

  const handleClose = () => {
    onCloseModal();
    reset({ name: "", skillType: "1" });
  };

  const sendRequest = async (formData: SubjectType) => {
    try {
      const payload = {
        ...formData,
        skillType: Number(formData.skillType),
      };

      if (data?.id) {
        await updateSubject({ id: data.id, data: payload }).unwrap();
        toast.success("Cập nhật chủ đề thành công!");
      } else {
        await createSubject(payload).unwrap();
        toast.success("Tạo chủ đề thành công!");
      }
      onSuccess();
      onCloseModal();
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      onCloseModal();
      toast.error(error.data?.error || "Đã xảy ra lỗi");
    }
  };

  return (
    <CommonModal
      key={data?.id ?? "new"}
      isOpen={isOpen}
      title={data ? "Cập nhật chủ đề" : "Tạo chủ đề"}
      description="Tạo/cập nhật thông tin chi tiết cho chủ đề bài thi."
      fields={[
        {
          name: "name",
          type: "text",
          label: "Nhập tên chủ đề",
          register: register("name", {
            required: "Tên chủ đề là bắt buộc",
            minLength: {
              value: 2,
              message: "Tên phải có ít nhất 2 ký tự",
            },
          }),
          placeholder: "Nhập tên chủ đề",
          error: errors.name?.message,
        },
        {
          name: "skillType",
          label: "Trạng thái",
          type: "select",
          control: control,
          options: [
            { label: "Listening and Reading", value: "1" },
            { label: "Speaking and Writing", value: "2" },
          ],
          register: register("skillType"),
          error: errors.skillType?.message,
        },
      ]}
      onClose={handleClose}
      onSubmit={handleSubmit(sendRequest)}
      submitText={data?.id ? "Lưu thay đổi" : "Thêm"}
    />
  );
};

export default SubjectAction;
