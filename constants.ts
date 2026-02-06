import { EducationLevel, LevelConfig, QuestionType, FormSection } from './types';

// --- Shared Options ---
const YES_NO = ['Yes', 'No'];
const DESIGNATIONS = ['Adviser', 'SPED Coordinator', 'School Head', 'Administrator', 'ALS Facilitator'];
const TREND_OPTS = ['Increase', 'Decrease', 'No Change'];

// --- Quarter to Date Range Mapping (SY 2025-2026) ---
export const QUARTER_DATE_RANGES: Record<string, string[]> = {
  'Q1': ['June 16–30, 2025', 'July 1–31, 2025', 'August 1–22, 2025'],
  'Q2': ['August 26–31, 2025', 'September 1–30, 2025', 'October 1–24, 2025'],
  'Q3': ['November 3–30, 2025', 'December 1–31, 2025', 'January 1–23, 2026'],
  'Q4': ['January 26–31, 2026', 'February 1–28, 2026', 'March 1–20, 2026'],
};

// --- Subject Lists ---

export const SUBJECTS_KINDER = [
  'Language, Literacy, and Communication',
  'Socio-Emotional Development',
  'Values Development',
  'Physical Health and Motor Development',
  'Aesthetic / Creative Development',
  'Mathematics',
  'Understanding of the Physical and Natural Environment',
];

export const SUBJECTS_ELEM_JHS_BASE = [
  'Mother Tongue', // Usually Elem, but sometimes appearing in transitions. We will filter in component if needed, or keep for simplicity.
  'Filipino',
  'English',
  'Mathematics',
  'Science',
  'Araling Panlipunan',
  'Edukasyon sa Pagpapakatao (EsP)',
  'EPP / TLE', // Merged label for generic handling, can be split in UI
  'MAPEH',
];

export const MAPEH_COMPONENTS = ['Music', 'Arts', 'Physical Education', 'Health'];

export const SUBJECTS_SHS_CORE = [
  'Oral Communication',
  'Reading and Writing',
  'English for Academic and Professional Purposes',
  'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
  'Pagbasa at Pagsusuri ng Iba’t Ibang Teksto Tungo sa Pananaliksik',
  '21st Century Literature from the Philippines and the World',
  'Contemporary Philippine Arts from the Region',
  'Understanding Culture, Society and Politics',
  'Introduction to the Philosophy of the Human Person',
  'Media and Information Literacy',
  'Empowerment Technologies',
  'General Mathematics',
  'Statistics and Probability',
  'Earth and Life Science',
  'Physical Science',
  'Physical Education and Health',
  'Personal Development',
];

export const ELEMENTARY_SCHOOLS = [
  'Bacong Central School',
  'Buntod Elementary School',
  'Calangag Elementary School',
  'Fausto Sarono Tubod Elementary School',
  'Isugan Elementary School',
  'Nazario Tale Memorial Elementary School',
  'Sacsac Elementary School',
  'San Miguel Elementary School',
  'Timbanga Elementary School',
  'Timbao Elementary School',
];

export const HIGH_SCHOOLS = [
  'Buntod High School',
  'Ong Che Tee Bacong High School',
  'San Miguel National High School'
];

export const SCHOOLS_LIST = [...ELEMENTARY_SCHOOLS, ...HIGH_SCHOOLS];

export const SCHOOL_YEARS = ['2025-2026'];

// --- Common Section (Profile) ---
export const COMMON_PROFILE_SECTION: FormSection = {
  id: 'profile',
  title: 'Basic Information',
  description: 'Please provide school identification and respondent details.',
  questions: [
    { id: 'schoolName', label: 'School Name', type: QuestionType.SELECT, options: SCHOOLS_LIST, required: true },
    { id: 'schoolId', label: 'School ID', type: QuestionType.TEXT, required: true },
    { id: 'district', label: 'District', type: QuestionType.READ_ONLY, required: true },
    { id: 'sy', label: 'School Year', type: QuestionType.SELECT, options: SCHOOL_YEARS, required: true },
    { id: 'quarter', label: 'Quarter', type: QuestionType.SELECT, options: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
    { id: 'respondentName', label: 'Respondent Name', type: QuestionType.TEXT, required: true },
    { id: 'designation', label: 'Designation / Role', type: QuestionType.SELECT, options: DESIGNATIONS, required: true },
  ],
};

// --- Teacher Shared Sections (Elem, HS) ---
// MOVEMENT SECTION (Dynamic based on Quarter)
// Updated: Removed Failures field.
const TEACHER_MOVEMENT_SECTION: FormSection = {
  id: 'movement',
  title: "Monthly Learners' Movement",
  description: "Enter enrollment data for the specific dates below (based on SY 2025-2026 Quarters).",
  questions: [
    { id: 'enroll_total', label: 'Enrollment of the Month', type: QuestionType.NUMBER },
    { id: 'move_in', label: 'Transferred IN', type: QuestionType.NUMBER },
    { id: 'move_out', label: 'Transferred OUT', type: QuestionType.NUMBER },
    { id: 'move_nlpa', label: 'Classified as NLPA', type: QuestionType.NUMBER },
  ],
};

// --- School Head Specific Sections ---
const HEAD_ENROLLMENT_SECTION: FormSection = {
  id: 'head_enrollment',
  title: 'Enrollment Summary',
  questions: [
    { id: 'enrollment_bosy', label: 'Beginning of School Year (BOSY) Enrollment', type: QuestionType.NUMBER },
    { id: 'enrollment_eosy', label: 'End of School Year (EOSY) Enrollment (Prev Year)', type: QuestionType.NUMBER },
    { id: 'enrollment_trend', label: 'Enrollment Trend', type: QuestionType.SELECT, options: TREND_OPTS },
  ],
};

const HEAD_PERSONNEL_SECTION: FormSection = {
  id: 'head_personnel',
  title: 'Personnel Profile',
  questions: [
    { id: 'personnel_teach_m', label: 'Teaching Personnel (Male)', type: QuestionType.NUMBER },
    { id: 'personnel_teach_f', label: 'Teaching Personnel (Female)', type: QuestionType.NUMBER },
    { id: 'personnel_non_m', label: 'Non-Teaching Personnel (Male)', type: QuestionType.NUMBER },
    { id: 'personnel_non_f', label: 'Non-Teaching Personnel (Female)', type: QuestionType.NUMBER },
  ],
};

const HEAD_FACILITIES_SECTION: FormSection = {
  id: 'head_facilities',
  title: 'Facilities & Resources',
  questions: [
    { id: 'fac_classrooms', label: 'Number of Classrooms', type: QuestionType.NUMBER },
    { id: 'fac_toilets', label: 'Number of Functional Toilets', type: QuestionType.NUMBER },
    { id: 'fac_handwash', label: 'Number of Handwashing Facilities', type: QuestionType.NUMBER },
    { id: 'fac_seats', label: 'Number of Seats', type: QuestionType.NUMBER },
  ],
};

const HEAD_GAD_LEARNER_SECTION: FormSection = {
  id: 'head_gad_learner',
  title: 'Learner Welfare (GAD)',
  questions: [
    { id: 'gad_bully', label: 'Total Victims of Bullying', type: QuestionType.NUMBER },
    { id: 'gad_abuse', label: 'Total Victims of Child Abuse', type: QuestionType.NUMBER },
    { id: 'gad_working', label: 'Total Working Students', type: QuestionType.NUMBER },
  ],
};

const HEAD_GAD_PERSONNEL_SECTION: FormSection = {
  id: 'head_gad_personnel',
  title: 'Personnel Welfare & Health (GAD)',
  questions: [
    { id: 'health_senior', label: 'Senior Citizen Personnel', type: QuestionType.NUMBER },
    { id: 'health_comorb', label: 'Personnel with Comorbidities', type: QuestionType.NUMBER },
    { id: 'health_diabetes', label: 'Personnel with Diabetes', type: QuestionType.NUMBER },
    { id: 'health_hyper', label: 'Personnel with Hypertension', type: QuestionType.NUMBER },
    { id: 'health_preg', label: 'Pregnant Personnel', type: QuestionType.NUMBER },
  ],
};

const HEAD_ORGS_SECTION: FormSection = {
  id: 'head_orgs',
  title: 'Student Organizations',
  questions: [
    { id: 'org_unauth', label: 'Presence of Unauthorized Orgs (Yes/No)', type: QuestionType.SELECT, options: YES_NO },
    { id: 'org_list', label: 'List of Organizations (if any)', type: QuestionType.TEXT, placeholder: 'Separate with commas' },
  ],
};

// --- Level Specific Configurations ---

export const LEVEL_CONFIGS: Record<EducationLevel, LevelConfig> = {
  [EducationLevel.KINDER]: {
    id: EducationLevel.KINDER,
    label: 'Kindergarten',
    sections: [
      {
        id: 'kinder_movement',
        title: 'Monthly Learners Movement',
        description: "Enter enrollment data for the specific dates below (based on SY 2025-2026 Quarters).",
        questions: [
            { id: 'k_total', label: 'Total Kindergarten Enrollment', type: QuestionType.NUMBER },
            { id: 'k_trans_in', label: 'Learners Transferred IN', type: QuestionType.NUMBER },
            { id: 'k_trans_out', label: 'Learners Transferred OUT', type: QuestionType.NUMBER },
            { id: 'k_nlpa', label: 'Learners Classified as NLPA', type: QuestionType.NUMBER },
        ]
      },
      {
        id: 'kinder_inclusive',
        title: 'Inclusive Learners (Manifestations)',
        questions: [
            { id: 'k_sped_manif_total', label: 'Total Learners with Manifestations', type: QuestionType.NUMBER },
            { id: 'lbl_breakdown', label: 'Breakdown by Type (Optional)', type: QuestionType.HEADER },
            { id: 'k_sped_visual', label: 'Visual', type: QuestionType.NUMBER },
            { id: 'k_sped_hearing', label: 'Hearing', type: QuestionType.NUMBER },
            { id: 'k_sped_intel', label: 'Intellectual', type: QuestionType.NUMBER },
            { id: 'k_sped_phys', label: 'Physical', type: QuestionType.NUMBER },
            { id: 'k_sped_speech', label: 'Speech / Language', type: QuestionType.NUMBER },
        ]
      },
      {
        id: 'kinder_eccd',
        title: 'ECCD Developmental Pre-Evaluation',
        description: 'Enter the TOTAL count of learners for each development level across all domains (Gross Motor, Fine Motor, Self-Help, Receptive/Expressive Language, Cognitive, Social-Emotional).',
        questions: [
            { id: 'eccd_sig_delay', label: 'Significant Delay', type: QuestionType.NUMBER },
            { id: 'eccd_slight_delay', label: 'Slight Delay', type: QuestionType.NUMBER },
            { id: 'eccd_avg', label: 'Average Development', type: QuestionType.NUMBER },
            { id: 'eccd_adv_slight', label: 'Slightly Advanced', type: QuestionType.NUMBER },
            { id: 'eccd_adv_high', label: 'Highly Advanced', type: QuestionType.NUMBER },
        ]
      }
    ],
  },
  [EducationLevel.SPED]: {
    id: EducationLevel.SPED,
    label: 'SPED (Special Education)',
    sections: [
        {
            id: 'sped_profile',
            title: 'Inclusive Learners Profile',
            questions: [
                { id: 'sped_diag', label: 'Learners with Diagnosis (Medical)', type: QuestionType.NUMBER },
                { id: 'sped_manif', label: 'Learners with Manifestations', type: QuestionType.NUMBER },
            ]
        },
        {
            id: 'sped_class',
            title: 'Disability Classification',
            questions: [
                { id: 'dis_visual', label: 'Visual Impairment', type: QuestionType.NUMBER },
                { id: 'dis_hearing', label: 'Hearing Impairment', type: QuestionType.NUMBER },
                { id: 'dis_intel', label: 'Intellectual Disability', type: QuestionType.NUMBER },
                { id: 'dis_autism', label: 'Autism Spectrum Disorder', type: QuestionType.NUMBER },
                { id: 'dis_ortho', label: 'Orthopedic / Physical', type: QuestionType.NUMBER },
                { id: 'dis_speech', label: 'Speech / Language', type: QuestionType.NUMBER },
                { id: 'dis_multi', label: 'Multiple Disabilities', type: QuestionType.NUMBER },
            ]
        },
        {
            id: 'sped_support',
            title: 'Support Services & Homebound',
            questions: [
                { id: 'homebound_count', label: 'Number of Homebound Learners', type: QuestionType.NUMBER },
                { id: 'sped_teachers', label: 'Availability of SPED Teachers (Yes/No)', type: QuestionType.SELECT, options: YES_NO },
                { id: 'intervention_prog', label: 'Availability of Intervention Programs (Yes/No)', type: QuestionType.SELECT, options: YES_NO },
                { id: 'referral_mech', label: 'Referral Mechanisms in Place (Yes/No)', type: QuestionType.SELECT, options: YES_NO },
            ]
        }
    ],
  },
  [EducationLevel.ELEM]: {
    id: EducationLevel.ELEM,
    label: 'Elementary',
    sections: [
        TEACHER_MOVEMENT_SECTION
    ],
  },
  [EducationLevel.JHS]: {
    id: EducationLevel.JHS,
    label: 'Junior High School (G7-10)',
    sections: [
        TEACHER_MOVEMENT_SECTION
    ],
  },
  [EducationLevel.SHS]: {
    id: EducationLevel.SHS,
    label: 'Senior High School (G11-12)',
    sections: [
        TEACHER_MOVEMENT_SECTION
    ],
  },
  [EducationLevel.ALS]: {
    id: EducationLevel.ALS,
    label: 'Alternative Learning System (ALS)',
    sections: [
        {
            id: 'als_movement',
            title: 'Monthly Learners Movement',
            description: "Enter enrollment data for the specific dates below (based on SY 2025-2026 Quarters).",
            questions: [
                { id: 'als_total', label: 'Total ALS Enrollment', type: QuestionType.NUMBER },
                { id: 'als_in', label: 'Transferred IN', type: QuestionType.NUMBER },
                { id: 'als_out', label: 'Transferred OUT', type: QuestionType.NUMBER },
                { id: 'als_nlpa', label: 'Classified as NLPA', type: QuestionType.NUMBER },
                { id: 'als_fail_drop', label: 'Learners who Failed/Dropped', type: QuestionType.NUMBER },
            ]
        }
    ],
  },
  [EducationLevel.SCHOOL_HEAD]: {
      id: EducationLevel.SCHOOL_HEAD,
      label: 'School Head',
      sections: [
          HEAD_ENROLLMENT_SECTION,
          HEAD_PERSONNEL_SECTION,
          HEAD_FACILITIES_SECTION,
          HEAD_GAD_LEARNER_SECTION,
          HEAD_GAD_PERSONNEL_SECTION,
          HEAD_ORGS_SECTION
      ]
  }
};