export type ExamType = {
  id?: string;
  name: string;
  subject_id: number | string;
  subject_name?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};
