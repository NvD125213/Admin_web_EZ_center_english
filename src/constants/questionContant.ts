export const QUESTION_API = {
  GET_BY_EXAM_ID_AND_PART_ID: (
    examId: number | string,
    partId: number | string,
    page: number | string,
    limit: number | string
  ) =>
    `/question/getQuestionByPartAndExam?part_id=${partId}&exam_id=${examId}&page=${page}&limit=${limit}`,
};
