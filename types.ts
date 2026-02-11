
export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  HEADER = 'header', // For visual separation within a step
  READ_ONLY = 'read_only', // For auto-filled, non-editable fields
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // For SELECT inputs
  placeholder?: string;
  required?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface LevelConfig {
  id: string;
  label: string;
  sections: FormSection[];
}

export interface FormData {
  [key: string]: string | number;
}

export enum EducationLevel {
  KINDER = 'kindergarten',
  SPED = 'sped',
  ELEM = 'elementary',
  JHS = 'jhs', // Junior High School
  SHS = 'shs', // Senior High School
  ALS = 'als',
  SCHOOL_HEAD = 'school_head',
}

// Old interface (kept for compatibility if needed, though we primarily use Submission now)
export interface MeaReport {
  id: string;
  created_at: string;
  level: EducationLevel;
  school_year: string;
  quarter: string;
  content: FormData & {
    failuresBySubject?: Array<{ subjectName: string; failedCount: number }>;
    _meta?: any;
  };
}

// New Interface for the updated table structure
export interface MeaSubmission {
  id: string;
  created_at: string;
  school_name: string;
  district: string;
  school_year: string;
  quarter: string;
  form_type: EducationLevel;
  monthly_learners_movement: Array<{
    range: string;
    enrollment: number;
    transferred_in: number;
    transferred_out: number;
  }>;
  failures_by_subject: Array<{
    subjectName: string;
    failedCount: number;
    subjectSource?: string;
  }>;
  content: FormData; // Full backup
}
