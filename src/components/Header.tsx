import React, { useMemo } from 'react';
import { 
  GradeLevel, 
  EvaluationPeriod, 
  AppState, 
  AppUser 
} from '../types';
import { 
  Building2, 
  Database, 
  FileSpreadsheet, 
  Printer, 
  SlidersHorizontal,
  GraduationCap,
  LayoutGrid,
  CheckSquare,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  QrCode,
  RefreshCw,
  Download,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FolderSync,
  ArrowRightLeft,
  UserCheck,
  Lock,
  User,
  LogOut,
  ShieldAlert,
  Home,
  Upload
} from 'lucide-react';

interface HeaderProps {
  state: AppState;
  currentUser: AppUser;
  activeTab: 'portal' | 'matrix' | 'observations' | 'bulletin' | 'dashboard' | 'students' | 'teacher-dashboard';
  setActiveTab: (tab: 'portal' | 'matrix' | 'observations' | 'bulletin' | 'dashboard' | 'students' | 'teacher-dashboard') => void;
  onGradeChange: (grade: GradeLevel) => void;
  onSectionChange: (section: string) => void;
  onPeriodChange: (period: EvaluationPeriod) => void;
  onOpenSettings: () => void;
  onOpenStudentManager: () => void;
  onOpenTeacherAccess: () => void;
  onOpenUserManager?: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onExportExcel: () => void;
  onPrintBulletin: () => void;
  onCleanEvaluations: () => void;
  onOpenMoveStudent?: () => void;
  onOpenBulkObservations?: () => void;
  cloudSyncStatus?: 'idle' | 'saving' | 'synced' | 'error';
  lastCloudSyncTime?: string;
  onManualCloudSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  currentUser,
  activeTab,
  setActiveTab,
  onGradeChange,
  onSectionChange,
  onPeriodChange,
  onOpenSettings,
  onOpenStudentManager,
  onOpenTeacherAccess,
  onOpenUserManager,
  onOpenProfile,
  onLogout,
  onExportExcel,
  onPrintBulletin,
  onCleanEvaluations,
  onOpenMoveStudent,
  onOpenBulkObservations,
  cloudSyncStatus = 'synced',
  lastCloudSyncTime = '',
  onManualCloudSync
}) => {
  const currentPeriod = state.currentPeriod;
  const isDocente = currentUser.role === 'docente';
  const isCoordinadora = currentUser.role === 'coordinadora';
  const isAdmin = currentUser.role === 'administrador';

  // Calculate pending evaluations for this scope
  const totalPendingEvals = useMemo(() => {
    let pending = 0;
    const targetStudents = isDocente
      ? state.students.filter(s => s.grade === currentUser.grade && s.section === currentUser.section)
      : state.students;

    targetStudents.forEach(st => {
      const evalRec = state.evaluations[st.id]?.[currentPeriod];
      const hasScores = evalRec && Object.values(evalRec.scores).some(v => v !== '');
      if (!hasScores) pending++;
    });
    return pending;
  }, [state.students, state.evaluations, currentPeriod, isDocente, currentUser]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40';
      case 'coordinadora':
        return 'bg-purple-500/30 text-purple-300 border-purple-400/40';
      default:
        return 'bg-blue-500/30 text-blue-300 border-blue-400/40';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrador': return 'ADMIN';
      case 'coordinadora': return 'COORDINADORA';
      default: return 'DOCENTE';
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 shadow-sm">
      
      {/* 1. TOP OFFICIAL MINISTERIAL BAR */}
      <div className="bg-[#0b1b3d] text-white text-xs px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Official Dominican Header Text */}
          <div className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="uppercase text-[11px] sm:text-xs text-amber-200">
              República Dominicana · MINERD
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-[11px] text-slate-300">
              Dirección de Educación Inicial (Segundo Ciclo)
            </span>
          </div>

          {/* Right: Quick Action Buttons & User Profile Pill */}
          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            
            {/* Admin-only: User Manager */}
            {isAdmin && onOpenUserManager && (
              <button
                onClick={onOpenUserManager}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gestión de Usuarios</span>
              </button>
            )}

            {/* Admin-only: Carga Masiva Observaciones (CSV) */}
            {isAdmin && onOpenBulkObservations && (
              <button
                onClick={onOpenBulkObservations}
                title="Carga masiva de fortalezas y recomendaciones desde archivo CSV o Excel"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Carga Masiva Obs. (CSV)</span>
              </button>
            )}

            {/* Admin-only: Matrícula & Aulas */}
            {isAdmin && (
              <button
                onClick={onOpenStudentManager}
                className="bg-indigo-700/80 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
              >
                <span>⚙️ Matrícula & Aulas</span>
              </button>
            )}

            {/* Admin-only: Mover Estudiantes */}
            {isAdmin && onOpenMoveStudent && (
              <button
                onClick={onOpenMoveStudent}
                title="Mover estudiantes de una sección a otra"
                className="bg-violet-700/90 hover:bg-violet-600 text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Mover Sección</span>
              </button>
            )}

            {/* Admin-only: Limpiar / Reutilizar */}
            {isAdmin && (
              <button
                onClick={onCleanEvaluations}
                title="Borrar evaluaciones para iniciar ciclo limpio"
                className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}

            {/* Admin & Coord: Respaldo JSON */}
            {(isAdmin || isCoordinadora) && (
              <button
                onClick={onOpenSettings}
                className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
              >
                <span>💾 Respaldo</span>
              </button>
            )}

            {/* Supabase Auto-Sync Pill (Visible for all roles so teachers can see save status) */}
            <button
              onClick={onManualCloudSync || onOpenSettings}
              title={cloudSyncStatus === 'saving' ? 'Guardando en la nube...' : 'Sincronizar con Supabase'}
              className={`${
                cloudSyncStatus === 'saving'
                  ? 'bg-amber-600 text-white animate-pulse'
                  : cloudSyncStatus === 'error'
                  ? 'bg-rose-700 text-white'
                  : 'bg-teal-700/80 hover:bg-teal-600 text-white'
              } px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer`}
            >
              <RefreshCw className={`w-3 h-3 ${cloudSyncStatus === 'saving' ? 'animate-spin' : ''}`} />
              <span>{cloudSyncStatus === 'saving' ? 'Guardando...' : cloudSyncStatus === 'error' ? 'Reintentar Nube' : 'Nube'}</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/15 transition-all cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left flex items-center gap-1.5">
                  <span className="font-bold text-xs group-hover:text-amber-300 transition-colors">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-1 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. SUBHEADER: TITLE, GRADES & PERIOD SELECTOR */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: App Logo & System Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b1b3d] text-amber-400 flex items-center justify-center font-black shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  Sistema de Evaluación Nivel Inicial (SENI)
                </span>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded border border-blue-100">
                  MINERD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {state.schoolInfo.name} · {state.schoolInfo.district}
              </p>
            </div>
          </div>

          {/* Right: Section Lock / Switcher + Period selector pills */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Grade & Section Control */}
            {isDocente ? (
              // Locked for Teacher: displays her section exclusively
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Mi Aula Asignada: <strong>{currentUser.grade} "{currentUser.section}"</strong></span>
              </div>
            ) : (
              // Dropdowns for Admin & Coordinadora to inspect any classroom
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-bold px-1.5 text-[11px]">Aula:</span>
                <select
                  value={state.selectedGrade}
                  onChange={e => onGradeChange(e.target.value as GradeLevel)}
                  className="bg-white px-2 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Prekínder">Prekínder (3a)</option>
                  <option value="Kínder">Kínder (4a)</option>
                  <option value="Preprimario">Preprimario (5a)</option>
                </select>
                <select
                  value={state.selectedSection}
                  onChange={e => onSectionChange(e.target.value)}
                  className="bg-white px-2 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                >
                  <option value="A">Sec. A</option>
                  <option value="B">Sec. B</option>
                  <option value="C">Sec. C</option>
                </select>
              </div>
            )}

            {/* Period Selector Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold px-1.5 hidden sm:inline text-[11px]">Período:</span>
              <button
                onClick={() => onPeriodChange('P1')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentPeriod === 'P1'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                P1 (Nov)
              </button>
              <button
                onClick={() => onPeriodChange('P2')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentPeriod === 'P2'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                P2 (Mar)
              </button>
              <button
                onClick={() => onPeriodChange('P3')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentPeriod === 'P3'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                P3 (Jun)
              </button>
            </div>

            {/* Pending count alert badge */}
            {totalPendingEvals > 0 ? (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{totalPendingEvals} pendientes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Al día</span>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 3. MAIN NAVIGATION TABS (ROLE-BASED) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto">
          
          <nav className="flex items-center gap-1 py-1 text-xs font-semibold whitespace-nowrap">
            
            {/* DOCENTE SPECIFIC TABS */}
            {isDocente ? (
              <>
                {/* Teacher Dashboard */}
                <button
                  onClick={() => setActiveTab('teacher-dashboard')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'teacher-dashboard'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Home className="w-4 h-4 text-blue-600" />
                  <span>Mi Aula (Dashboard)</span>
                </button>

                {/* Evaluation Matrix */}
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'matrix'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Matriz de Calificación</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full font-mono font-bold">
                    {currentUser.grade} "{currentUser.section}"
                  </span>
                </button>

                {/* Qualitative Observations */}
                <button
                  onClick={() => setActiveTab('observations')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'observations'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Observaciones Cualitativas</span>
                </button>

                {/* Report Card Bulletin */}
                <button
                  onClick={() => setActiveTab('bulletin')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'bulletin'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Boletines Oficiales (PDF)</span>
                </button>
              </>
            ) : (
              // COORDINADORA & ADMINISTRADOR TABS
              <>
                {/* Supervision Dashboard */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'dashboard'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Supervisión de Docentes</span>
                </button>

                {/* Portal de Secciones */}
                <button
                  onClick={() => setActiveTab('portal')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'portal'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Portal de Secciones</span>
                </button>

                {/* Matriz de Evaluación */}
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'matrix'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Matriz de Evaluación</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-mono">
                    {state.selectedGrade} {state.selectedSection}
                  </span>
                </button>

                {/* Observaciones Cualitativas */}
                <button
                  onClick={() => setActiveTab('observations')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'observations'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Observaciones & Estilo</span>
                </button>

                {/* Boletines Oficiales */}
                <button
                  onClick={() => setActiveTab('bulletin')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'bulletin'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Boletines Oficiales (PDF)</span>
                </button>

                {/* Listado de Estudiantes */}
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3.5 py-2 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'students'
                      ? 'border-blue-600 text-blue-700 bg-white font-bold rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Listado de Estudiantes ({state.students.length})</span>
                </button>
              </>
            )}

          </nav>

          {/* Right Action: Sábana Excel */}
          <div className="hidden lg:flex items-center gap-2 py-1">
            <button
              onClick={onExportExcel}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Exportar Excel ({isDocente ? `${currentUser.grade} ${currentUser.section}` : `${state.selectedGrade} ${state.selectedSection}`})
              </span>
            </button>
          </div>

        </div>
      </div>

    </header>
  );
};
