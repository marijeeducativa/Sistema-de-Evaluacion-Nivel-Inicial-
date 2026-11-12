import React, { useMemo, useState } from 'react';
import { AppState, AppUser, GradeLevel, EvaluationPeriod, Student } from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Printer, 
  FileSpreadsheet, 
  ArrowRight, 
  TrendingUp,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Calendar,
  HeartHandshake,
  Award
} from 'lucide-react';

interface TeacherDashboardProps {
  state: AppState;
  currentUser: AppUser;
  onNavigateToMatrix: () => void;
  onNavigateToObservations: () => void;
  onNavigateToBulletin: (studentId?: string) => void;
  onExportExcel: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  state,
  currentUser,
  onNavigateToMatrix,
  onNavigateToObservations,
  onNavigateToBulletin,
  onExportExcel
}) => {
  const currentPeriod = state.currentPeriod;
  const grade = currentUser.grade || state.selectedGrade;
  const section = currentUser.section || state.selectedSection;
  const indicators = useMemo(() => getIndicatorsByGrade(grade), [grade]);
  const totalIndicators = indicators.length;

  const [studentSearch, setStudentSearch] = useState('');
  const [filterPendingOnly, setFilterPendingOnly] = useState<'all' | 'pending-eval' | 'pending-obs' | 'complete'>('all');

  // Filter students in this teacher's section
  const sectionStudents = useMemo(() => {
    return state.students.filter(s => s.grade === grade && s.section === section);
  }, [state.students, grade, section]);

  // Compute metrics for each student and for the whole section
  const studentMetrics = useMemo(() => {
    return sectionStudents.map(student => {
      const evalRec = state.evaluations[student.id]?.[currentPeriod];
      const scores = evalRec?.scores || {};
      
      let scoredCount = 0;
      let countL = 0;
      let countEP = 0;
      let countI = 0;

      indicators.forEach(ind => {
        const val = scores[ind.id];
        if (val) {
          scoredCount++;
          if (val === 'L') countL++;
          else if (val === 'EP') countEP++;
          else if (val === 'I') countI++;
        }
      });

      const strengths = evalRec?.observations?.strengths?.trim() || '';
      const recommendations = evalRec?.observations?.recommendations?.trim() || '';
      const hasObservations = strengths.length > 0 && recommendations.length > 0;
      const isEvaluationComplete = scoredCount === totalIndicators && totalIndicators > 0;
      const isFullyReady = isEvaluationComplete && hasObservations;

      return {
        student,
        scoredCount,
        totalIndicators,
        evalPercentage: totalIndicators > 0 ? Math.round((scoredCount / totalIndicators) * 100) : 0,
        isEvaluationComplete,
        hasObservations,
        strengths,
        recommendations,
        isFullyReady,
        countL,
        countEP,
        countI
      };
    });
  }, [sectionStudents, state.evaluations, currentPeriod, indicators, totalIndicators]);

  // Overall section stats
  const stats = useMemo(() => {
    const totalStudents = studentMetrics.length;
    const completedEvals = studentMetrics.filter(m => m.isEvaluationComplete).length;
    const pendingEvals = totalStudents - completedEvals;
    
    const completedObs = studentMetrics.filter(m => m.hasObservations).length;
    const pendingObs = totalStudents - completedObs;

    const readyBulletins = studentMetrics.filter(m => m.isFullyReady).length;

    const totalScoredInClass = studentMetrics.reduce((acc, m) => acc + m.scoredCount, 0);
    const totalExpectedInClass = totalStudents * totalIndicators;
    const overallEvalProgress = totalExpectedInClass > 0 
      ? Math.round((totalScoredInClass / totalExpectedInClass) * 100) 
      : 0;

    const overallObsProgress = totalStudents > 0 
      ? Math.round((completedObs / totalStudents) * 100) 
      : 0;

    return {
      totalStudents,
      completedEvals,
      pendingEvals,
      completedObs,
      pendingObs,
      readyBulletins,
      overallEvalProgress,
      overallObsProgress
    };
  }, [studentMetrics, totalIndicators]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    return studentMetrics.filter(m => {
      const matchSearch = m.student.fullName.toLowerCase().includes(studentSearch.toLowerCase());
      if (!matchSearch) return false;

      if (filterPendingOnly === 'pending-eval') return !m.isEvaluationComplete;
      if (filterPendingOnly === 'pending-obs') return !m.hasObservations;
      if (filterPendingOnly === 'complete') return m.isFullyReady;
      return true;
    });
  }, [studentMetrics, studentSearch, filterPendingOnly]);

  const hasPendingWork = stats.pendingEvals > 0 || stats.pendingObs > 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* 1. HERO BANNER - Elegant Welcome & Section Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1b3d] via-[#122b61] to-[#1e3a8a] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Espacio Docente Titular · Período Activo: {currentPeriod}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              ¡Bienvenida, Maestra {currentUser.name}!
            </h1>
            
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Aula: <strong className="text-amber-300 font-bold">{grade}</strong> · Sección <strong className="text-amber-300 font-bold">"{section}"</strong> | Centro Educativo: <span className="font-semibold">{state.schoolInfo.name}</span>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <strong>{stats.totalStudents}</strong> Alumnos Matriculados
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <strong>{totalIndicators}</strong> Indicadores de Logro Oficiales
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Acceso exclusivo a tu aula
              </span>
            </div>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onNavigateToMatrix}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              Ir a Matriz de Calificación ({currentPeriod})
            </button>
            <button
              onClick={onNavigateToObservations}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              Redactar Observaciones
            </button>
          </div>
        </div>
      </div>

      {/* 2. ALERTA DE TRABAJO PENDIENTE (Mandatory Requirement) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        hasPendingWork 
          ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm' 
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              hasPendingWork ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-emerald-600 text-white'
            }`}>
              {hasPendingWork ? (
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  {hasPendingWork ? 'Alerta de Trabajo Pendiente para el Período ' + currentPeriod : '¡Enhorabuena! Aula 100% al Día en el Período ' + currentPeriod}
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  hasPendingWork ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {hasPendingWork ? 'Atención Requerida' : 'Completado'}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {hasPendingWork ? (
                  <>
                    Tienes <strong className="text-amber-900 font-black">{stats.pendingEvals} alumnos</strong> con indicadores pendientes de evaluar y <strong className="text-amber-900 font-black">{stats.pendingObs} alumnos</strong> sin redactar observaciones cualitativas (Fortalezas y Recomendaciones).
                  </>
                ) : (
                  <>
                    Todos tus <strong>{stats.totalStudents} estudiantes</strong> tienen sus {totalIndicators} indicadores evaluados y sus observaciones cualitativas completas. Los boletines están listos para firma y entrega a los padres.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stats.pendingEvals > 0 && (
              <button
                onClick={() => setFilterPendingOnly('pending-eval')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Ver los {stats.pendingEvals} sin evaluar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {stats.pendingObs > 0 && (
              <button
                onClick={() => setFilterPendingOnly('pending-obs')}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Ver los {stats.pendingObs} sin observación</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. TRES TARJETAS DE PROGRESO Y MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Evaluación de Competencias */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Matriz de Competencias ({currentPeriod})
              </span>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {stats.overallEvalProgress}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallEvalProgress}%` }}
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Alumnos Completamente Evaluados:</span>
                <strong className="text-slate-900">{stats.completedEvals} de {stats.totalStudents}</strong>
              </div>
              <div className="flex justify-between">
                <span>Alumnos Pendientes de Calificar:</span>
                <strong className={stats.pendingEvals > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {stats.pendingEvals}
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={onNavigateToMatrix}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Abrir Matriz de Calificación</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Observaciones Cualitativas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Observaciones Cualitativas ({currentPeriod})
              </span>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {stats.overallObsProgress}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallObsProgress}%` }}
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Observaciones Redactadas:</span>
                <strong className="text-slate-900">{stats.completedObs} de {stats.totalStudents}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pendientes por Redactar:</span>
                <strong className={stats.pendingObs > 0 ? 'text-purple-700 font-bold' : 'text-emerald-600 font-bold'}>
                  {stats.pendingObs}
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={onNavigateToObservations}
              className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Redactar Observaciones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Boletines Oficiales Listos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                Boletines Listos para Impresión
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {stats.readyBulletins} de {stats.totalStudents}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalStudents > 0 ? Math.round((stats.readyBulletins / stats.totalStudents) * 100) : 0}%` }}
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Formato Oficial MINERD:</span>
                <span className="font-semibold text-slate-800">11 x 8.5 in (Apaisado)</span>
              </div>
              <div className="flex justify-between">
                <span>Exportación a Excel:</span>
                <span className="text-emerald-700 font-semibold">Disponible para tu aula</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
            <button
              onClick={() => onNavigateToBulletin()}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ver Boletines</span>
            </button>
            <button
              onClick={onExportExcel}
              title="Descargar Registro en Excel"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. LISTADO DE ESTUDIANTES CON DETALLE DE PENDIENTES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Estudiantes del Aula ({grade} - Sección "{section}")
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisa el avance individual de cada niño(a) y accede a evaluar o redactar con un solo clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 w-44 sm:w-56"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterPendingOnly('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterPendingOnly === 'all' 
                    ? 'bg-[#0b1b3d] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({stats.totalStudents})
              </button>
              <button
                onClick={() => setFilterPendingOnly('pending-eval')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterPendingOnly === 'pending-eval' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Sin Evaluar ({stats.pendingEvals})
              </button>
              <button
                onClick={() => setFilterPendingOnly('pending-obs')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterPendingOnly === 'pending-obs' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                Sin Obs. ({stats.pendingObs})
              </button>
              <button
                onClick={() => setFilterPendingOnly('complete')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterPendingOnly === 'complete' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Completos ({stats.readyBulletins})
              </button>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10 text-center">#</th>
                <th className="px-4 py-3">Nombre del Estudiante</th>
                <th className="px-4 py-3 text-center">Edad</th>
                <th className="px-4 py-3">Progreso Evaluación ({currentPeriod})</th>
                <th className="px-4 py-3">Observaciones Cualitativas</th>
                <th className="px-4 py-3 text-center">Estado Boletín</th>
                <th className="px-4 py-3 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron alumnos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    {/* # Index */}
                    <td className="px-4 py-3 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.student.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>Código: {item.student.id}</span>
                        {item.student.parentName && (
                          <span className="text-slate-400">· {item.student.parentName}</span>
                        )}
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {item.student.age} años
                      </span>
                    </td>

                    {/* Evaluation Progress */}
                    <td className="px-4 py-3">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-700">
                            {item.scoredCount} / {item.totalIndicators} ind.
                          </span>
                          <span className={`font-bold ${item.isEvaluationComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.evalPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${item.isEvaluationComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${item.evalPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Qualitative Observations */}
                    <td className="px-4 py-3">
                      {item.hasObservations ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Redactadas (Fort. y Rec.)</span>
                        </div>
                      ) : (
                        <button
                          onClick={onNavigateToObservations}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors text-[11px] font-bold"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Pendiente · Redactar</span>
                        </button>
                      )}
                    </td>

                    {/* Bulletin Ready Status */}
                    <td className="px-4 py-3 text-center">
                      {item.isFullyReady ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          <Check className="w-3 h-3 text-emerald-700" />
                          Listo para Imprimir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          En Progreso
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={onNavigateToMatrix}
                          title="Evaluar en Matriz"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                        >
                          Evaluar
                        </button>
                        <button
                          onClick={onNavigateToObservations}
                          title="Redactar Observación"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                        >
                          Observación
                        </button>
                        <button
                          onClick={() => onNavigateToBulletin(item.student.id)}
                          title="Ver Boletín"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <strong>{filteredStudents.length}</strong> de <strong>{sectionStudents.length}</strong> alumnos matriculados en tu sección.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Verde: Completado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Ámbar: Pendiente
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
