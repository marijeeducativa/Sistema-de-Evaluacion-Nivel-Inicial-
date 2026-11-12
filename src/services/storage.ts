import { AppState, Student, StudentEvaluationRecord, EvaluationPeriod } from '../types';
import { INITIAL_SCHOOL_INFO, INITIAL_TEACHERS, INITIAL_STUDENTS, generateInitialEvaluations, buildDefaultStudentEvaluation } from '../data/initialData';
import { INITIAL_USERS } from '../data/initialUsers';
import { extractFamilyName } from '../utils/familyName';

const STORAGE_KEY = 'minerd_evaluacion_periodica_oficial_v3';

export const DEFAULT_SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  ? String(import.meta.env.VITE_SUPABASE_URL) 
  : 'https://kbotzvpasfgpnyurdchg.supabase.co';

export const DEFAULT_SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? String(import.meta.env.VITE_SUPABASE_ANON_KEY)
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib3R6dnBhc2ZncG55dXJkY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Mzg1MjEsImV4cCI6MjEwNjMxNDUyMX0.jyaTmZ6D4whZXhvmWGzieF1lzlIK455WCSHERu8WRtc';

export function getInitialState(): AppState {
  if (typeof window === 'undefined') {
    return createFreshState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.students && parsed.evaluations && parsed.schoolInfo) {
        if (!parsed.supabaseConfig?.url) {
          parsed.supabaseConfig = {
            url: DEFAULT_SUPABASE_URL,
            anonKey: DEFAULT_SUPABASE_ANON_KEY,
            tableName: 'evaluaciones_inicial',
            cronEnabled: true,
            cronFrequency: 'daily',
            cronIntervalMinutes: 1440,
            cronTask: 'keep_alive',
            totalPings: 0,
            successfulPings: 0,
            lastPingStatus: 'idle',
            executionLogs: []
          };
        } else {
          // Keep cron on daily frequency to minimize Supabase load
          parsed.supabaseConfig.cronFrequency = 'daily';
          parsed.supabaseConfig.cronIntervalMinutes = 1440;
        }
        if (Array.isArray(parsed.students)) {
          parsed.students = parsed.students.map((st: Student) => {
            if (!st.parentName || st.parentName.includes(' / ') || !st.parentName.startsWith('Familia ')) {
              return {
                ...st,
                parentName: extractFamilyName(st.fullName)
              };
            }
            return st;
          });
        }

        // Ensure users list is populated and contains all required initial users
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        } else {
          // Merge any missing initial users by email and sync admin name
          const existingEmails = new Set(parsed.users.map((u: any) => u.email.toLowerCase()));
          INITIAL_USERS.forEach(initUser => {
            if (!existingEmails.has(initUser.email.toLowerCase())) {
              parsed.users.push(initUser);
            }
          });

          // Ensure admin user name is Víctor Valdez
          parsed.users = parsed.users.map((u: any) => {
            if (u.email && u.email.toLowerCase() === 'vivaldez@gmail.com') {
              return { ...u, name: 'Víctor Valdez' };
            }
            return u;
          });
        }

        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }

  return createFreshState();
}

export function resetEvaluationsOnly(state: AppState): AppState {
  const cleanEvals: Record<string, any> = {};
  state.students.forEach(st => {
    cleanEvals[st.id] = buildDefaultStudentEvaluation(st);
  });
  return {
    ...state,
    evaluations: cleanEvals
  };
}

export function createFreshState(): AppState {
  const evaluations = generateInitialEvaluations(INITIAL_STUDENTS);
  return {
    schoolInfo: INITIAL_SCHOOL_INFO,
    teachers: INITIAL_TEACHERS,
    students: INITIAL_STUDENTS,
    evaluations,
    supabaseConfig: {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
      tableName: 'evaluaciones_inicial',
      cronEnabled: true,
      cronFrequency: 'daily',
      cronIntervalMinutes: 1440,
      cronTask: 'keep_alive',
      totalPings: 0,
      successfulPings: 0,
      lastPingStatus: 'idle',
      executionLogs: []
    },
    customPhrases: [],
    selectedGrade: 'Preprimario',
    selectedSection: 'A',
    currentPeriod: 'P1',
    users: INITIAL_USERS
  };
}

export function markLocalUserEdit(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('minerd_last_user_edit', Date.now().toString());
  } catch {}
}

export function getLastUserEditTime(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('minerd_last_user_edit');
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveStateToStorage(state: AppState, isUserEdit: boolean = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (isUserEdit) {
      markLocalUserEdit();
    }
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
}

export function exportStateAsJson(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `MINERD_Evaluacion_${state.schoolInfo.code || 'Centro'}_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function mergeEvaluations(
  cloudEvals: Record<string, StudentEvaluationRecord> = {},
  localEvals: Record<string, StudentEvaluationRecord> = {}
): Record<string, StudentEvaluationRecord> {
  const merged: Record<string, StudentEvaluationRecord> = { ...cloudEvals };

  Object.keys(localEvals || {}).forEach(studentId => {
    if (!merged[studentId]) {
      merged[studentId] = localEvals[studentId];
      return;
    }

    const periods: EvaluationPeriod[] = ['P1', 'P2', 'P3'];
    periods.forEach(p => {
      const localPeriod = localEvals[studentId]?.[p];
      const cloudPeriod = merged[studentId]?.[p];

      if (!cloudPeriod && localPeriod) {
        merged[studentId] = {
          ...merged[studentId],
          [p]: localPeriod
        };
        return;
      }

      if (localPeriod && cloudPeriod) {
        const localTime = localPeriod.updatedAt ? new Date(localPeriod.updatedAt).getTime() : 0;
        const cloudTime = cloudPeriod.updatedAt ? new Date(cloudPeriod.updatedAt).getTime() : 0;

        const localHasScores = Object.values(localPeriod.scores || {}).some(v => v !== '');
        const cloudHasScores = Object.values(cloudPeriod.scores || {}).some(v => v !== '');

        const localHasObs = !!(localPeriod.observations?.strengths?.trim() || localPeriod.observations?.recommendations?.trim());
        const cloudHasObs = !!(cloudPeriod.observations?.strengths?.trim() || cloudPeriod.observations?.recommendations?.trim());

        // Merge scores: combine and prioritize whichever is defined and newest
        const mergedScores = { ...(cloudPeriod.scores || {}) };
        Object.keys(localPeriod.scores || {}).forEach(k => {
          if (localPeriod.scores[k] && (!mergedScores[k] || localTime >= cloudTime)) {
            mergedScores[k] = localPeriod.scores[k];
          }
        });

        // Merge observations: take newest or non-empty
        let mergedObs = cloudPeriod.observations || { strengths: '', recommendations: '' };
        if (localHasObs && (!cloudHasObs || localTime >= cloudTime)) {
          mergedObs = localPeriod.observations;
        }

        merged[studentId] = {
          ...merged[studentId],
          [p]: {
            ...cloudPeriod,
            scores: mergedScores,
            observations: mergedObs,
            attendance: localPeriod.attendance?.diasLaborados ? localPeriod.attendance : cloudPeriod.attendance,
            isCompleted: !!(mergedObs.strengths?.trim() && mergedObs.recommendations?.trim()),
            updatedAt: localTime >= cloudTime ? localPeriod.updatedAt : cloudPeriod.updatedAt
          }
        };
      }
    });
  });

  return merged;
}
