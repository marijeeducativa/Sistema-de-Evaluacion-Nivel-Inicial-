import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppState, 
  GradeLevel, 
  EvaluationPeriod, 
  ScoreValue, 
  SchoolInfo, 
  SupabaseConfig, 
  Student,
  CustomPhrase,
  AppUser
} from './types';
import { 
  getInitialState, 
  saveStateToStorage, 
  createFreshState,
  resetEvaluationsOnly,
  mergeEvaluations,
  markLocalUserEdit,
  getLastUserEditTime
} from './services/storage';
import { 
  syncStateToSupabase, 
  fetchLatestStateFromSupabase, 
  runCronMaintenanceTask, 
  getCronIntervalMs 
} from './services/supabaseService';
import { exportSectionSheetToExcel } from './services/excelExport';
import { buildDefaultStudentEvaluation } from './data/initialData';
import { extractFamilyName } from './utils/familyName';
import { Header } from './components/Header';
import { SectionPortalLanding } from './components/SectionPortalLanding';
import { Dashboard } from './components/Dashboard';
import { EvaluationMatrix } from './components/EvaluationMatrix';
import { QualitativeObservations } from './components/QualitativeObservations';
import { ReportCardView } from './components/ReportCardView';
import { PedagogicalReport } from './components/PedagogicalReport';
import { StudentListView } from './components/StudentListView';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { StudentManager } from './components/StudentManager';
import { TeacherAccessModal } from './components/TeacherAccessModal';
import { MoveStudentModal } from './components/MoveStudentModal';
import { LoginScreen } from './components/LoginScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { UserManagerModal } from './components/UserManagerModal';
import { BulkObservationsModal } from './components/BulkObservationsModal';
import { getIndicatorsByGrade } from './data/minerdCurriculum';

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState);

  // Authentication State with persistent session in localStorage
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('minerd_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        const users = getInitialState().users || [];
        const found = users.find((u: AppUser) => u.id === parsed.id || u.email.toLowerCase() === parsed.email?.toLowerCase());
        if (found) return found;
      }
    } catch (e) {
      console.error('Error loading auth session:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'portal' | 'matrix' | 'observations' | 'bulletin' | 'dashboard' | 'students' | 'teacher-dashboard'>(() => {
    return 'dashboard';
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isTeacherAccessOpen, setIsTeacherAccessOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isBulkObservationsOpen, setIsBulkObservationsOpen] = useState(false);
  const [moveStudentTargetId, setMoveStudentTargetId] = useState<string | undefined>();
  const [targetStudentForDetails, setTargetStudentForDetails] = useState<string | undefined>();

  // Cloud Auto-Sync State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'error'>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Enforce teacher classroom lock on currentUser change
  useEffect(() => {
    if (currentUser?.role === 'docente' && currentUser.grade && currentUser.section) {
      setState(prev => {
        if (prev.selectedGrade !== currentUser.grade || prev.selectedSection !== currentUser.section) {
          return {
            ...prev,
            selectedGrade: currentUser.grade!,
            selectedSection: currentUser.section!
          };
        }
        return prev;
      });
    }
  }, [currentUser]);

  // 1. Initial Cloud Sync on Startup: pull latest data if mobile/pc has older cache
  useEffect(() => {
    const pullLatestCloudState = async () => {
      if (!state.supabaseConfig.url || !state.supabaseConfig.anonKey) return;
      try {
        setCloudSyncStatus('saving');
        const res = await fetchLatestStateFromSupabase(state.supabaseConfig);
        if (res.success && res.data) {
          const cloudTime = res.updatedAt ? new Date(res.updatedAt).getTime() : 0;
          const localUserEditTime = getLastUserEditTime();

          // Normalise students
          const normalizedStudents = (res.data.students || []).map((st: Student) => {
            if (!st.parentName || st.parentName.includes(' / ') || !st.parentName.startsWith('Familia ')) {
              return {
                ...st,
                parentName: extractFamilyName(st.fullName)
              };
            }
            return st;
          });

          setState(prev => {
            // Intelligent evaluation merge: merges grades from both devices without data loss!
            const mergedEvaluations = mergeEvaluations(res.data!.evaluations || {}, prev.evaluations || {});

            // Teacher classroom lock: NEVER let cloud state override a logged-in teacher's classroom
            const isDocente = currentUser?.role === 'docente';
            const targetGrade = (isDocente && currentUser?.grade) 
              ? currentUser.grade 
              : (prev.selectedGrade || res.data!.selectedGrade || 'Preprimario');

            const targetSection = (isDocente && currentUser?.section) 
              ? currentUser.section 
              : (prev.selectedSection || res.data!.selectedSection || 'A');

            const mergedState: AppState = {
              ...res.data!,
              students: normalizedStudents.length > 0 ? normalizedStudents : prev.students,
              evaluations: mergedEvaluations,
              selectedGrade: targetGrade,
              selectedSection: targetSection,
              users: (res.data!.users && res.data!.users.length > 0) ? res.data!.users : prev.users,
              supabaseConfig: {
                ...res.data!.supabaseConfig,
                ...prev.supabaseConfig,
                url: prev.supabaseConfig.url || res.data!.supabaseConfig.url,
                anonKey: prev.supabaseConfig.anonKey || res.data!.supabaseConfig.anonKey,
              }
            };

            saveStateToStorage(mergedState, false);
            return mergedState;
          });

          setCloudSyncStatus('synced');
          if (res.updatedAt) {
            setLastCloudSyncTime(new Date(res.updatedAt).toLocaleTimeString());
          }
        } else {
          setCloudSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Initial cloud sync check:', err);
        setCloudSyncStatus('error');
      }
    };

    pullLatestCloudState();
  }, []);

  // 2. Debounced Auto-Save to Supabase whenever evaluations or data change
  useEffect(() => {
    // LocalStorage: Always instant
    saveStateToStorage(state, false);

    // Skip cloud save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!state.supabaseConfig.url || !state.supabaseConfig.anonKey) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setCloudSyncStatus('saving');

    // Debounce 800ms for fast multi-device reactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await syncStateToSupabase(state);
        if (res.success) {
          setCloudSyncStatus('synced');
          setLastCloudSyncTime(new Date().toLocaleTimeString());
        } else {
          setCloudSyncStatus('error');
        }
      } catch {
        setCloudSyncStatus('error');
      }
    }, 800);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.evaluations, state.students, state.schoolInfo, state.teachers, state.customPhrases]);

  // Manual immediate cloud sync
  const handleManualCloudSync = useCallback(async () => {
    if (!state.supabaseConfig.url || !state.supabaseConfig.anonKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    setCloudSyncStatus('saving');
    try {
      const res = await syncStateToSupabase(state);
      if (res.success) {
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(new Date().toLocaleTimeString());
      } else {
        setCloudSyncStatus('error');
      }
    } catch {
      setCloudSyncStatus('error');
    }
  }, [state]);

  // 3. Supabase Maintenance Background Cron Job (for prolonged inactivity)
  const cronTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeCronMaintenance = useCallback(async () => {
    if (!state.supabaseConfig.cronEnabled || !state.supabaseConfig.url) return;
    
    try {
      const { updatedConfig } = await runCronMaintenanceTask(state);
      setState(prev => ({
        ...prev,
        supabaseConfig: updatedConfig
      }));
    } catch (e) {
      console.error('Error executing Cron Maintenance Task:', e);
    }
  }, [state]);

  useEffect(() => {
    if (cronTimerRef.current) {
      clearInterval(cronTimerRef.current);
      cronTimerRef.current = null;
    }

    if (state.supabaseConfig.cronEnabled && state.supabaseConfig.url) {
      const intervalMs = getCronIntervalMs(
        state.supabaseConfig.cronFrequency || 'daily',
        state.supabaseConfig.cronIntervalMinutes || 1440
      );
      // Run initial check
      executeCronMaintenance();
      // Setup scheduled cron interval (daily)
      cronTimerRef.current = setInterval(executeCronMaintenance, intervalMs);
    }

    return () => {
      if (cronTimerRef.current) {
        clearInterval(cronTimerRef.current);
      }
    };
  }, [state.supabaseConfig.cronEnabled, state.supabaseConfig.cronFrequency, state.supabaseConfig.cronIntervalMinutes, state.supabaseConfig.url, executeCronMaintenance]);

  const handleAddCustomPhrase = (newPhrase: CustomPhrase) => {
    setState(prev => ({
      ...prev,
      customPhrases: [...(prev.customPhrases || []), newPhrase]
    }));
  };

  // Authentication & Role-Based Access Handlers
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('minerd_auth_session', JSON.stringify({ id: user.id, email: user.email }));
    } catch (err) {
      console.error('Failed to store auth session:', err);
    }

    if (user.role === 'docente' && user.grade && user.section) {
      setState(prev => ({
        ...prev,
        selectedGrade: user.grade!,
        selectedSection: user.section!
      }));
      setActiveTab('teacher-dashboard');
    } else if (user.role === 'coordinadora') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('minerd_auth_session');
    } catch {}
    setCurrentUser(null);
    setIsProfileOpen(false);
    setIsUserManagerOpen(false);
  };

  const handleUpdatePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    setState(prev => {
      const updatedUsers = (prev.users || []).map(u => 
        u.id === userId ? { ...u, password: newPassword } : u
      );
      const nextState = { ...prev, users: updatedUsers };
      saveStateToStorage(nextState);
      return nextState;
    });

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    }

    return true;
  };

  // Administrator User Management Handlers
  const handleCreateUser = (newUser: Omit<AppUser, 'id' | 'createdAt'>) => {
    const created: AppUser = {
      ...newUser,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const users = [...(prev.users || []), created];
      let teachers = [...prev.teachers];

      if (created.role === 'docente' && created.grade && created.section) {
        const exists = teachers.some(t => t.grade === created.grade && t.section === created.section);
        if (!exists) {
          teachers.push({
            id: `t_${Date.now()}`,
            name: created.name,
            grade: created.grade,
            section: created.section,
            phone: created.phone
          });
        }
      }

      const nextState = { ...prev, users, teachers };
      saveStateToStorage(nextState);
      return nextState;
    });
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setState(prev => {
      const users = (prev.users || []).map(u => u.id === updatedUser.id ? updatedUser : u);
      let teachers = [...prev.teachers];

      if (updatedUser.role === 'docente' && updatedUser.grade && updatedUser.section) {
        const idx = teachers.findIndex(t => t.name.toLowerCase() === updatedUser.name.toLowerCase() || (t.grade === updatedUser.grade && t.section === updatedUser.section));
        if (idx >= 0) {
          teachers[idx] = {
            ...teachers[idx],
            name: updatedUser.name,
            grade: updatedUser.grade,
            section: updatedUser.section,
            phone: updatedUser.phone
          };
        }
      }

      const nextState = { ...prev, users, teachers };
      saveStateToStorage(nextState);
      return nextState;
    });

    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setState(prev => {
      const users = (prev.users || []).filter(u => u.id !== userId);
      const nextState = { ...prev, users };
      saveStateToStorage(nextState);
      return nextState;
    });
  };

  // Section & Grade navigation (Strictly locked if current user is a docente)
  const handleGradeChange = (grade: GradeLevel) => {
    if (currentUser?.role === 'docente') {
      return; // Cannot switch to another teacher's grade
    }
    const availableSections = Array.from(
      new Set(state.students.filter(s => s.grade === grade).map(s => s.section))
    ).sort();
    const newSection = availableSections.includes(state.selectedSection) ? state.selectedSection : (availableSections[0] || 'A');

    setState(prev => ({
      ...prev,
      selectedGrade: grade,
      selectedSection: newSection
    }));
  };

  const handleSectionChange = (section: string) => {
    if (currentUser?.role === 'docente') {
      return; // Cannot switch to another teacher's section
    }
    setState(prev => ({
      ...prev,
      selectedSection: section
    }));
  };

  const handlePeriodChange = (period: EvaluationPeriod) => {
    setState(prev => ({
      ...prev,
      currentPeriod: period
    }));
  };

  // Evaluation updates with optional targetPeriod (defaults to currentPeriod)
  const handleUpdateScore = (
    studentId: string, 
    indicatorId: string, 
    value: ScoreValue, 
    targetPeriod?: EvaluationPeriod
  ) => {
    markLocalUserEdit();
    const period = targetPeriod || state.currentPeriod;
    setState(prev => {
      const studentRec = prev.evaluations[studentId] || buildDefaultStudentEvaluation(
        prev.students.find(s => s.id === studentId)!
      );

      const updatedPeriod = {
        ...studentRec[period],
        scores: {
          ...studentRec[period].scores,
          [indicatorId]: value
        },
        updatedAt: new Date().toISOString()
      };

      return {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [studentId]: {
            ...studentRec,
            [period]: updatedPeriod
          }
        }
      };
    });
  };

  const handleBulkUpdateStudent = (studentId: string, value: ScoreValue, targetPeriod?: EvaluationPeriod) => {
    markLocalUserEdit();
    const period = targetPeriod || state.currentPeriod;
    setState(prev => {
      const student = prev.students.find(s => s.id === studentId);
      if (!student) return prev;
      const indicators = getIndicatorsByGrade(student.grade);
      const studentRec = prev.evaluations[studentId] || buildDefaultStudentEvaluation(student);

      const newScores = { ...studentRec[period].scores };
      indicators.forEach(ind => {
        newScores[ind.id] = value;
      });

      return {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [studentId]: {
            ...studentRec,
            [period]: {
              ...studentRec[period],
              scores: newScores,
              updatedAt: new Date().toISOString()
            }
          }
        }
      };
    });
  };

  const handleBulkUpdateIndicator = (indicatorId: string, value: ScoreValue, targetPeriod?: EvaluationPeriod) => {
    markLocalUserEdit();
    const period = targetPeriod || state.currentPeriod;
    setState(prev => {
      const studentsInSection = prev.students.filter(
        s => s.grade === prev.selectedGrade && s.section === prev.selectedSection
      );

      const newEvals = { ...prev.evaluations };
      studentsInSection.forEach(st => {
        const studentRec = newEvals[st.id] || buildDefaultStudentEvaluation(st);
        newEvals[st.id] = {
          ...studentRec,
          [period]: {
            ...studentRec[period],
            scores: {
              ...studentRec[period].scores,
              [indicatorId]: value
            },
            updatedAt: new Date().toISOString()
          }
        };
      });

      return {
        ...prev,
        evaluations: newEvals
      };
    });
  };

  const handleCopyFromPreviousPeriod = (fromPeriod: 'P1' | 'P2') => {
    if (!confirm(`¿Copiar las calificaciones de ${fromPeriod} hacia el período actual (${state.currentPeriod}) para toda la sección ${state.selectedGrade} ${state.selectedSection}?`)) {
      return;
    }
    markLocalUserEdit();

    setState(prev => {
      const studentsInSection = prev.students.filter(
        s => s.grade === prev.selectedGrade && s.section === prev.selectedSection
      );

      const newEvals = { ...prev.evaluations };
      studentsInSection.forEach(st => {
        const studentRec = newEvals[st.id];
        if (studentRec && studentRec[fromPeriod]) {
          const fromScores = studentRec[fromPeriod].scores;
          const currentScores = { ...studentRec[prev.currentPeriod].scores };
          
          Object.keys(fromScores).forEach(key => {
            if (fromScores[key] && !currentScores[key]) {
              currentScores[key] = fromScores[key];
            }
          });

          newEvals[st.id] = {
            ...studentRec,
            [prev.currentPeriod]: {
              ...studentRec[prev.currentPeriod],
              scores: currentScores,
              updatedAt: new Date().toISOString()
            }
          };
        }
      });

      return {
        ...prev,
        evaluations: newEvals
      };
    });

    alert(`Calificaciones copiadas exitosamente desde ${fromPeriod}.`);
  };

  const handleUpdateObservations = (
    studentId: string, 
    strengths: string, 
    recommendations: string, 
    targetPeriod?: EvaluationPeriod
  ) => {
    markLocalUserEdit();
    const period = targetPeriod || state.currentPeriod;
    setState(prev => {
      const studentRec = prev.evaluations[studentId];
      if (!studentRec) return prev;

      return {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [studentId]: {
            ...studentRec,
            [period]: {
              ...studentRec[period],
              observations: {
                strengths,
                recommendations
              },
              isCompleted: !!(strengths.trim() && recommendations.trim()),
              updatedAt: new Date().toISOString()
            }
          }
        }
      };
    });
  };

  // Bulk update of observations from CSV or Excel file
  const handleBatchUpdateObservations = (
    updates: Array<{
      studentId: string;
      period: EvaluationPeriod;
      strengths: string;
      recommendations: string;
    }>
  ) => {
    markLocalUserEdit();
    setState(prev => {
      const nextEvals = { ...prev.evaluations };
      updates.forEach(u => {
        const student = prev.students.find(s => s.id === u.studentId);
        const studentRec = nextEvals[u.studentId] || (student ? buildDefaultStudentEvaluation(student) : null);
        if (!studentRec) return;

        nextEvals[u.studentId] = {
          ...studentRec,
          [u.period]: {
            ...studentRec[u.period],
            observations: {
              strengths: u.strengths,
              recommendations: u.recommendations
            },
            isCompleted: !!(u.strengths.trim() && u.recommendations.trim()),
            updatedAt: new Date().toISOString()
          }
        };
      });

      return {
        ...prev,
        evaluations: nextEvals
      };
    });
  };

  const handleUpdateAttendance = (
    studentId: string,
    attendance: {
      diasLaborados: number;
      presentes: number;
      ausenciasJustificadas: number;
      ausenciasInjustificadas: number;
    },
    targetPeriod?: EvaluationPeriod
  ) => {
    markLocalUserEdit();
    const period = targetPeriod || state.currentPeriod;
    setState(prev => {
      const studentRec = prev.evaluations[studentId];
      if (!studentRec) return prev;

      return {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [studentId]: {
            ...studentRec,
            [period]: {
              ...studentRec[period],
              attendance,
              updatedAt: new Date().toISOString()
            }
          }
        }
      };
    });
  };

  // Clean all evaluations
  const handleCleanEvaluations = () => {
    if (confirm('¿Limpiar / Reutilizar el sistema? Esta acción borrará todas las calificaciones y observaciones registradas, dejando las listas de estudiantes y maestras intactas para comenzar un nuevo período o año lectivo en limpio.')) {
      const cleaned = resetEvaluationsOnly(state);
      setState(cleaned);
      saveStateToStorage(cleaned);
      alert('Se han borrado todas las evaluaciones. El sistema está 100% en limpio para el registro oficial de indicadores.');
    }
  };

  // Student CRUD
  const handleAddStudent = (newStudent: Student) => {
    setState(prev => ({
      ...prev,
      students: [...prev.students, newStudent],
      evaluations: {
        ...prev.evaluations,
        [newStudent.id]: buildDefaultStudentEvaluation(newStudent)
      }
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setState(prev => {
      const nextEvals = { ...prev.evaluations };
      delete nextEvals[studentId];
      return {
        ...prev,
        students: prev.students.filter(s => s.id !== studentId),
        evaluations: nextEvals
      };
    });
  };

  // Move Student between sections and grades preserving all evaluations and observations
  const handleMoveStudent = (
    studentId: string,
    targetGrade: GradeLevel,
    targetSection: string,
    newAge?: number,
    options?: { navigateToDestination?: boolean }
  ) => {
    setState(prev => {
      const student = prev.students.find(s => s.id === studentId);
      if (!student) return prev;

      const isGradeChange = student.grade !== targetGrade;
      const oldGrade = student.grade;
      const updatedStudent: Student = {
        ...student,
        grade: targetGrade,
        section: targetSection,
        age: newAge !== undefined ? newAge : student.age
      };

      const studentRec = prev.evaluations[studentId] || buildDefaultStudentEvaluation(student);
      let updatedStudentRec = { ...studentRec };

      if (isGradeChange) {
        const oldIndicators = getIndicatorsByGrade(oldGrade);
        const newIndicators = getIndicatorsByGrade(targetGrade);
        const periods: EvaluationPeriod[] = ['P1', 'P2', 'P3'];

        periods.forEach(p => {
          const periodData = studentRec[p];
          if (!periodData) return;

          // Map old scores by indicator code (e.g. 'SE-1', 'ART-1', 'COM-2')
          const oldCodeMap: Record<string, ScoreValue> = {};
          oldIndicators.forEach(ind => {
            if (periodData.scores[ind.id]) {
              oldCodeMap[ind.code] = periodData.scores[ind.id];
            }
          });

          // Generate new scores object for targetGrade indicators
          const newScores: Record<string, ScoreValue> = { ...periodData.scores };
          newIndicators.forEach(newInd => {
            if (oldCodeMap[newInd.code]) {
              newScores[newInd.id] = oldCodeMap[newInd.code];
            } else if (newScores[newInd.id] === undefined) {
              newScores[newInd.id] = '';
            }
          });

          updatedStudentRec[p] = {
            ...periodData,
            scores: newScores,
            // Observations and attendance preserved 100%!
            observations: {
              strengths: periodData.observations?.strengths || '',
              recommendations: periodData.observations?.recommendations || ''
            },
            attendance: { ...periodData.attendance },
            updatedAt: new Date().toISOString()
          };
        });
      }

      return {
        ...prev,
        students: prev.students.map(s => s.id === studentId ? updatedStudent : s),
        evaluations: {
          ...prev.evaluations,
          [studentId]: updatedStudentRec
        },
        ...(options?.navigateToDestination ? {
          selectedGrade: targetGrade,
          selectedSection: targetSection
        } : {})
      };
    });
  };

  // Batch move students from a section to another classroom
  const handleBatchMoveStudents = (
    studentIds: string[],
    targetGrade: GradeLevel,
    targetSection: string,
    options?: { navigateToDestination?: boolean }
  ) => {
    setState(prev => {
      let nextStudents = [...prev.students];
      let nextEvaluations = { ...prev.evaluations };

      studentIds.forEach(studentId => {
        const student = nextStudents.find(s => s.id === studentId);
        if (!student) return;

        const isGradeChange = student.grade !== targetGrade;
        const oldGrade = student.grade;
        nextStudents = nextStudents.map(s => s.id === studentId ? { ...s, grade: targetGrade, section: targetSection } : s);

        const studentRec = nextEvaluations[studentId] || buildDefaultStudentEvaluation(student);
        let updatedStudentRec = { ...studentRec };

        if (isGradeChange) {
          const oldIndicators = getIndicatorsByGrade(oldGrade);
          const newIndicators = getIndicatorsByGrade(targetGrade);
          const periods: EvaluationPeriod[] = ['P1', 'P2', 'P3'];

          periods.forEach(p => {
            const periodData = studentRec[p];
            if (!periodData) return;

            const oldCodeMap: Record<string, ScoreValue> = {};
            oldIndicators.forEach(ind => {
              if (periodData.scores[ind.id]) {
                oldCodeMap[ind.code] = periodData.scores[ind.id];
              }
            });

            const newScores: Record<string, ScoreValue> = { ...periodData.scores };
            newIndicators.forEach(newInd => {
              if (oldCodeMap[newInd.code]) {
                newScores[newInd.id] = oldCodeMap[newInd.code];
              } else if (newScores[newInd.id] === undefined) {
                newScores[newInd.id] = '';
              }
            });

            updatedStudentRec[p] = {
              ...periodData,
              scores: newScores,
              observations: {
                strengths: periodData.observations?.strengths || '',
                recommendations: periodData.observations?.recommendations || ''
              },
              attendance: { ...periodData.attendance },
              updatedAt: new Date().toISOString()
            };
          });
        }

        nextEvaluations[studentId] = updatedStudentRec;
      });

      return {
        ...prev,
        students: nextStudents,
        evaluations: nextEvaluations,
        ...(options?.navigateToDestination ? {
          selectedGrade: targetGrade,
          selectedSection: targetSection
        } : {})
      };
    });
  };

  const handleResetData = () => {
    const fresh = createFreshState();
    setState(fresh);
    saveStateToStorage(fresh);
    alert('Base de datos restablecida a los datos iniciales oficiales (con 0 evaluaciones).');
  };

  const handleImportJson = (importedState: AppState) => {
    setState(importedState);
    saveStateToStorage(importedState);
  };

  // If user is not authenticated, show institutional MINERD Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        users={state.users || []}
        onLogin={handleLogin}
        schoolName={state.schoolInfo.name}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        state={state}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGradeChange={handleGradeChange}
        onSectionChange={handleSectionChange}
        onPeriodChange={handlePeriodChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStudentManager={() => setIsStudentManagerOpen(true)}
        onOpenTeacherAccess={() => setIsTeacherAccessOpen(true)}
        onOpenUserManager={() => setIsUserManagerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onExportExcel={() => exportSectionSheetToExcel(state, state.selectedGrade, state.selectedSection, state.currentPeriod)}
        onPrintBulletin={() => window.print()}
        onCleanEvaluations={handleCleanEvaluations}
        onOpenMoveStudent={() => {
          setMoveStudentTargetId(undefined);
          setIsMoveModalOpen(true);
        }}
        onOpenBulkObservations={() => setIsBulkObservationsOpen(true)}
        cloudSyncStatus={cloudSyncStatus}
        lastCloudSyncTime={lastCloudSyncTime}
        onManualCloudSync={handleManualCloudSync}
      />

      {/* Main Content Area */}
      <main className="grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* Teacher Dedicated Dashboard (Warm welcome & pending alerts) */}
        {activeTab === 'teacher-dashboard' && (
          <TeacherDashboard
            state={state}
            currentUser={currentUser}
            onNavigateToMatrix={() => setActiveTab('matrix')}
            onNavigateToObservations={() => setActiveTab('observations')}
            onNavigateToBulletin={(id) => {
              if (id) setTargetStudentForDetails(id);
              setActiveTab('bulletin');
            }}
            onExportExcel={() => {
              const grade = currentUser.grade || state.selectedGrade;
              const section = currentUser.section || state.selectedSection;
              exportSectionSheetToExcel(state, grade, section, state.currentPeriod);
            }}
          />
        )}

        {/* Landing Page: Portal de Secciones */}
        {activeTab === 'portal' && (
          <SectionPortalLanding
            state={state}
            onEnterSection={(grade, sec) => {
              handleGradeChange(grade);
              handleSectionChange(sec);
              setActiveTab('matrix');
            }}
            onPrintSectionBulletins={(grade, sec) => {
              handleGradeChange(grade);
              handleSectionChange(sec);
              setActiveTab('bulletin');
            }}
            onExportSectionExcel={(grade, sec) => {
              exportSectionSheetToExcel(state, grade, sec, state.currentPeriod);
            }}
            onOpenObservations={(grade, sec) => {
              handleGradeChange(grade);
              handleSectionChange(sec);
              setActiveTab('observations');
            }}
          />
        )}

        {/* Evaluation Matrix */}
        {activeTab === 'matrix' && (
          <EvaluationMatrix
            state={state}
            currentUser={currentUser}
            onUpdateScore={handleUpdateScore}
            onBulkUpdateStudent={handleBulkUpdateStudent}
            onBulkUpdateIndicator={handleBulkUpdateIndicator}
            onCopyFromPreviousPeriod={handleCopyFromPreviousPeriod}
            onUpdateObservations={handleUpdateObservations}
            onUpdateAttendance={handleUpdateAttendance}
            onNavigateToBulletin={(id) => {
              if (id) setTargetStudentForDetails(id);
              setActiveTab('bulletin');
            }}
            onAddCustomPhrase={handleAddCustomPhrase}
            onOpenMoveStudent={(studentId) => {
              setMoveStudentTargetId(studentId);
              setIsMoveModalOpen(true);
            }}
          />
        )}

        {/* Qualitative Observations & Phrase Bank */}
        {activeTab === 'observations' && (
          <QualitativeObservations
            state={state}
            currentUser={currentUser}
            initialStudentId={targetStudentForDetails}
            onUpdateObservations={handleUpdateObservations}
            onUpdateAttendance={handleUpdateAttendance}
            onNavigateToBulletin={(id) => {
              setTargetStudentForDetails(id);
              setActiveTab('bulletin');
            }}
            onAddCustomPhrase={handleAddCustomPhrase}
            onGradeChange={handleGradeChange}
            onSectionChange={handleSectionChange}
            onPeriodChange={handlePeriodChange}
            onOpenBulkObservations={() => setIsBulkObservationsOpen(true)}
          />
        )}

        {/* Official Foldable Report Card View */}
        {activeTab === 'bulletin' && (
          <ReportCardView
            state={state}
            currentUser={currentUser}
            initialStudentId={targetStudentForDetails}
            onSelectStudent={(id) => setTargetStudentForDetails(id)}
          />
        )}

        {/* Executive Dashboard & Pedagogical Supervision */}
        {activeTab === 'dashboard' && (
          <Dashboard
            state={state}
            onSelectSection={(grade, sec) => {
              handleGradeChange(grade);
              handleSectionChange(sec);
              setActiveTab('matrix');
            }}
            onNavigateToMatrix={() => setActiveTab('matrix')}
            onNavigateToObservations={() => setActiveTab('observations')}
            onNavigateToBulletin={() => setActiveTab('bulletin')}
          />
        )}

        {/* Full Matricula Student List */}
        {activeTab === 'students' && (
          <StudentListView
            state={state}
            onSelectStudent={(student) => {
              handleGradeChange(student.grade);
              handleSectionChange(student.section);
              setTargetStudentForDetails(student.id);
              setActiveTab('matrix');
            }}
            onOpenAddStudent={() => setIsStudentManagerOpen(true)}
            onOpenMoveStudent={(studentId) => {
              setMoveStudentTargetId(studentId || undefined);
              setIsMoveModalOpen(true);
            }}
            onUpdateStudent={handleUpdateStudent}
          />
        )}

      </main>

      {/* Modals */}
      <UserProfileModal
        currentUser={currentUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdatePassword={handleUpdatePassword}
        onLogout={handleLogout}
        schoolName={state.schoolInfo.name}
      />

      {currentUser.role === 'administrador' && (
        <UserManagerModal
          state={state}
          currentUser={currentUser}
          isOpen={isUserManagerOpen}
          onClose={() => setIsUserManagerOpen(false)}
          onCreateUser={handleCreateUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      <SchoolSettingsModal
        state={state}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSchoolInfo={(info) => setState(prev => ({ ...prev, schoolInfo: info }))}
        onSaveSupabaseConfig={(config) => setState(prev => ({ ...prev, supabaseConfig: config }))}
        onResetData={handleResetData}
        onImportJson={handleImportJson}
      />

      <StudentManager
        state={state}
        isOpen={isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        onOpenMoveStudent={(studentId) => {
          setMoveStudentTargetId(studentId);
          setIsMoveModalOpen(true);
        }}
      />

      <TeacherAccessModal
        state={state}
        isOpen={isTeacherAccessOpen}
        onClose={() => setIsTeacherAccessOpen(false)}
        onSelectTeacherSection={(grade, sec) => {
          handleGradeChange(grade);
          handleSectionChange(sec);
          setActiveTab('matrix');
        }}
      />

      <MoveStudentModal
        state={state}
        isOpen={isMoveModalOpen}
        initialStudentId={moveStudentTargetId}
        onClose={() => {
          setIsMoveModalOpen(false);
          setMoveStudentTargetId(undefined);
        }}
        onMoveStudent={handleMoveStudent}
        onBatchMoveStudents={handleBatchMoveStudents}
      />

      {currentUser.role === 'administrador' && (
        <BulkObservationsModal
          state={state}
          isOpen={isBulkObservationsOpen}
          onClose={() => setIsBulkObservationsOpen(false)}
          onBatchUpdateObservations={handleBatchUpdateObservations}
        />
      )}

    </div>
  );
}
