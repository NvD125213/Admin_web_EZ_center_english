import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import * as React from "react";
import TextArea from "../../components/form/input/TextArea";
import { UseFormRegisterReturn, Control, Controller } from "react-hook-form";
import { useState } from "react";
import { TextField } from "@mui/material";

interface Option {
  label: string;
  value: string;
}

interface Field {
  name: string;
  label?: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "date"
    | "email"
    | "fee"
    | "password";
  value?: string | number;
  onChange?: (value: string | number) => void;
  options?: Option[];
  placeholder?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  error?: string;
  selected?: string;
  register?: UseFormRegisterReturn;
  control?: Control<any>;
}

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  fields: Field[];
  onClose: () => void;
  onSubmit?: () => void;
  submitText?: string;
  showSubmitButton?: boolean;
  disabledAll?: boolean;
  errorDetail?: string;
  isLoading?: false;
}

const CommonModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  description,
  fields,
  onClose,
  onSubmit,
  submitText = "Submit",
  showSubmitButton = true,
  disabledAll = false,
  errorDetail,
}) => {
  const gridCols = fields.length >= 6 ? "grid-cols-2" : "grid-cols-1";
  const [value, setValue] = useState("");

  const handleChangeSelect = (event: any) => {
    setValue(event.target.value);
    console.log(
      "Giá trị select đã chọn (trong CommonModal):",
      event.target.value
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          {description && (
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {description}
            </p>
          )}
          {errorDetail && (
            <p className="mb-4 text-sm text-red-500 ">
              Cảnh báo lỗi: {errorDetail}
            </p>
          )}
        </div>
        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="px-2 overflow-y-auto custom-scrollbar">
            <div className={`grid ${gridCols} gap-x-6 gap-y-5`}>
              {fields.map((field) => (
                <div key={field.name}>
                  {field.type === "textarea" ? (
                    <TextArea
                      value={field.value as string}
                      placeholder={field.placeholder}
                      disabled={disabledAll || field.disabled}
                      className={`${
                        disabledAll || field.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${field.error ? "border-red-500" : ""}`}
                    />
                  ) : field.type === "select" && field.options ? (
                    <div className="flex flex-col gap-1">
                      {field.label && (
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                      )}
                      <Controller
                        name={field.name}
                        control={field.control} // Bạn cần truyền control từ useForm
                        defaultValue={field.defaultValue || ""}
                        render={({ field: { onChange, value, ref } }) => (
                          <select
                            id={field.name}
                            value={value}
                            onChange={onChange}
                            ref={ref}
                            disabled={disabledAll || field.disabled}
                            className={`border-b border-gray-300 py-2 bg-transparent text-gray-800 dark:text-white/90 focus:outline-none focus:border-blue-500
            ${
              disabledAll || field.disabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
            ${field.error ? "border-red-500" : ""}`}>
                            <option value="" disabled>
                              {field.placeholder || "-- Chọn --"}
                            </option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                  ) : (
                    <TextField
                      id="standard-basic"
                      label={`${field.label}`}
                      variant="standard"
                      type={field.type}
                      {...field.register}
                      placeholder={field.placeholder}
                      disabled={disabledAll || field.disabled}
                      fullWidth
                      className={`${
                        disabledAll || field.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${field.error ? "border-red-500" : ""}`}
                    />
                  )}
                  {/* ✅ Hiển thị lỗi nếu có */}
                  {field.error && (
                    <p className="mt-1 text-sm text-red-500">{field.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            {/* Nút Đóng luôn hiển thị */}
            <Button size="sm" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {/* ✅ Vô hiệu hóa nút "Lưu" nếu `disabledAll = true` */}
            {showSubmitButton && (
              <Button
                size="sm"
                onClick={onSubmit}
                disabled={disabledAll}
                className={`${
                  disabledAll ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {submitText}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CommonModal;
