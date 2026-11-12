// Data types for Dominican Republic MINERD Nivel Inicial Periodic Evaluation System

export type GradeLevel = 'Prekínder' | 'Kínder' | 'Preprimario' | 'Párvulo I' | 'Párvulo II' | 'Párvulo III';
export type EvaluationPeriod = 'P1' | 'P2' | 'P3';
export type ScoreValue = 'L' | 'EP' | 'I' | '';

export interface Domain {
  id: string;
  name: string;
  shortName: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
}

export interface Indicator {
  id: string;
  code: string;
  domainId: string;
  grade: GradeLevel;
  text: string;
  shortText: string;
}

export interface Student {
  id: string;
  fullName: string;
  age: number;
  grade: GradeLevel;
  section: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  parentName?: string;
  photoUrl?: string;
  schoolCode?: string;
  schoolName?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  grade: GradeLevel;
  section: string;
  phone?: string;
}

export interface PeriodEvaluation {
  scores: Record<string, ScoreValue>;
  observations: {
    strengths: string;
    recommendations: string;
  };
  attendance: {
    diasLaborados: number;
    presentes: number;
    ausenciasJustificadas: number;
    ausenciasInjustificadas: number;
  };
  isCompleted: boolean;
  updatedAt: string;
}

export interface StudentEvaluationRecord {
  studentId: string;
  P1: PeriodEvaluation;
  P2: PeriodEvaluation;
  P3: PeriodEvaluation;
}

export interface SchoolInfo {
  code: string;
  name: string;
  district: string;
  regional: string;
  circuit?: string;
  director: string;
  coordinador: string;
  academicYear: string;
  tanda: string;
  address?: string;
  phone?: string;
  logoBase64?: string;
}

export type CronTaskType = 'keep_alive' | 'backup' | 'audit';
export type CronFrequency = 'every_5_min' | 'hourly' | 'daily' | 'weekly';

export interface CronLogEntry {
  id: string;
  timestamp: string;
  task: CronTaskType;
  success: boolean;
  status: number;
  message: string;
  durationMs: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  cronEnabled: boolean;
  cronFrequency: CronFrequency;
  cronIntervalMinutes: number; // fallback or custom minutes
  cronTask: CronTaskType;
  lastPingAt?: string;
  lastPingStatus?: 'success' | 'error' | 'idle';
  lastPingMessage?: string;
  totalPings: number;
  successfulPings: number;
  executionLogs: CronLogEntry[];
}

export interface CustomPhrase {
  id: string;
  domainId: string;
  domainName?: string;
  grade: GradeLevel;
  type: 'strength' | 'recommendation';
  text: string;
  tags?: string[];
}

export type UserRole = 'administrador' | 'coordinadora' | 'docente';

export interface AppUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  teacherId?: string;
  grade?: GradeLevel;
  section?: string;
  phone?: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface AppState {
  schoolInfo: SchoolInfo;
  teachers: Teacher[];
  students: Student[];
  evaluations: Record<string, StudentEvaluationRecord>;
  supabaseConfig: SupabaseConfig;
  customPhrases?: CustomPhrase[];
  selectedGrade: GradeLevel;
  selectedSection: string;
  currentPeriod: EvaluationPeriod;
  users?: AppUser[];
}
