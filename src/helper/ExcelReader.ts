import * as XLSX from "xlsx";

type ReadExcelCallback = (
  error: Error | null,
  data: { detailQuestions: any[]; examAndSubject: any[] } | null
) => void;

// Helper để đọc file Excel và chuyển thành JSON
export const readExcelFile = (
  file: File,
  callback: ReadExcelCallback
): void => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      // Đọc dữ liệu từ file
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Đọc sheet Detail_question
      const detailQuestionSheet = workbook.Sheets["Detail_question"];
      const detailQuestions = detailQuestionSheet
        ? XLSX.utils.sheet_to_json(detailQuestionSheet)
        : [];

      // Đọc sheet Exam_and_subject
      const examAndSubjectSheet = workbook.Sheets["Exam_and_subject"];
      const examAndSubject = examAndSubjectSheet
        ? XLSX.utils.sheet_to_json(examAndSubjectSheet)
        : [];

      callback(null, {
        detailQuestions,
        examAndSubject,
      });
    } catch (error) {
      callback(
        error instanceof Error ? error : new Error("Lỗi không xác định"),
        null
      );
    }
  };

  reader.onerror = () => {
    callback(new Error("Lỗi khi đọc file"), null);
  };

  reader.readAsArrayBuffer(file);
};
