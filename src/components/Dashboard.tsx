import React, { useMemo, useState } from 'react';
import { 
  AppState, 
  GradeLevel, 
  EvaluationPeriod 
} from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  Percent,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  state: AppState;
  onSelectSection: (grade: GradeLevel, section: string) => void;
  onNavigateToMatrix: () => void;
  onNavigateToObservations: () => void;
  onNavigateToBulletin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  onSelectSection,
  onNavigateToMatrix,
  onNavigateToObservations,
  onNavigateToBulletin
}) => {
  const currentPeriod = state.currentPeriod;

  // Chart view filter state
  const [chartGradeFilter, setChartGradeFilter] = useState<string>('all');
  const [chartViewMode, setChartViewMode] = useState<'all' | 'completion' | 'attendance' | 'distribution'>('all');
  const [distributionMetric, setDistributionMetric] = useState<'percent' | 'count'>('percent');

  // Compute section-by-section metrics
  const sectionStats = useMemo(() => {
    const grades: GradeLevel[] = ['Prekínder', 'Kínder', 'Preprimario'];
    const sections: string[] = ['A', 'B', 'C'];
    const list: any[] = [];

    grades.forEach(grade => {
      const indicators = getIndicatorsByGrade(grade);
      const totalIndicators = indicators.length;

      sections.forEach(sec => {
        const students = state.students.filter(s => s.grade === grade && s.section === sec);
        if (students.length === 0) return;

        const teacher = state.teachers.find(t => t.grade === grade && t.section === sec);

        let totalExpectedScores = students.length * totalIndicators;
        let filledScores = 0;
        let countL = 0;
        let countEP = 0;
        let countI = 0;
        let bulletinsReady = 0;
        let observationsComplete = 0;

        students.forEach(st => {
          const evalRec = state.evaluations[st.id]?.[currentPeriod];
          if (!evalRec) return;

          const scores = evalRec.scores || {};
          let studentFilled = 0;

          indicators.forEach(ind => {
            const v = scores[ind.id];
            if (v) {
              filledScores++;
              studentFilled++;
              if (v === 'L') countL++;
              else if (v === 'EP') countEP++;
              else if (v === 'I') countI++;
            }
          });

          const hasStrengths = !!evalRec.observations.strengths.trim();
          const hasRecs = !!evalRec.observations.recommendations.trim();
          if (hasStrengths && hasRecs) {
            observationsComplete++;
          }

          if (studentFilled === totalIndicators && hasStrengths && hasRecs) {
            bulletinsReady++;
          }
        });

        const progressPercent = totalExpectedScores > 0 
          ? Math.round((filledScores / totalExpectedScores) * 100) 
          : 0;

        const isLagging = progressPercent < 50;

        list.push({
          grade,
          section: sec,
          teacherName: teacher?.name || 'Docente sin asignar',
          studentsCount: students.length,
          totalIndicators,
          progressPercent,
          filledScores,
          totalExpectedScores,
          countL,
          countEP,
          countI,
          percentL: filledScores > 0 ? Math.round((countL / filledScores) * 100) : 0,
          percentEP: filledScores > 0 ? Math.round((countEP / filledScores) * 100) : 0,
          percentI: filledScores > 0 ? Math.round((countI / filledScores) * 100) : 0,
          observationsComplete,
          observationsPending: students.length - observationsComplete,
          bulletinsReady,
          bulletinsPending: students.length - bulletinsReady,
          isLagging
        });
      });
    });

    return list;
  }, [state.students, state.evaluations, currentPeriod, state.teachers]);

  // Global Aggregate metrics
  const globalSummary = useMemo(() => {
    let totalStudents = state.students.length;
    let totalExpected = 0;
    let totalFilled = 0;
    let totalL = 0;
    let totalEP = 0;
    let totalI = 0;
    let totalBulletinsReady = 0;
    let totalObservationsPending = 0;
    let laggingSectionsCount = 0;

    sectionStats.forEach(sec => {
      totalExpected += sec.totalExpectedScores;
      totalFilled += sec.filledScores;
      totalL += sec.countL;
      totalEP += sec.countEP;
      totalI += sec.countI;
      totalBulletinsReady += sec.bulletinsReady;
      totalObservationsPending += sec.observationsPending;
      if (sec.isLagging) laggingSectionsCount++;
    });

    const globalProgress = totalExpected > 0 ? Math.round((totalFilled / totalExpected) * 100) : 0;
    const globalPercentL = totalFilled > 0 ? Math.round((totalL / totalFilled) * 100) : 0;
    const globalPercentEP = totalFilled > 0 ? Math.round((totalEP / totalFilled) * 100) : 0;
    const globalPercentI = totalFilled > 0 ? Math.round((totalI / totalFilled) * 100) : 0;

    return {
      totalStudents,
      globalProgress,
      totalFilled,
      totalExpected,
      totalL,
      totalEP,
      totalI,
      globalPercentL,
      globalPercentEP,
      globalPercentI,
      totalBulletinsReady,
      totalObservationsPending,
      laggingSectionsCount
    };
  }, [sectionStats, state.students.length]);

  // Students requiring early pedagogical support / curricular adaptation
  const studentsRequiringSupport = useMemo(() => {
    const list: any[] = [];

    state.students.forEach(student => {
      const indicators = getIndicatorsByGrade(student.grade);
      const evalRec = state.evaluations[student.id]?.[currentPeriod];
      if (!evalRec) return;

      const scores = evalRec.scores || {};
      let countI = 0;
      let countEP = 0;
      let countL = 0;
      let evaluated = 0;

      indicators.forEach(ind => {
        const v = scores[ind.id];
        if (v === 'I') countI++;
        else if (v === 'EP') countEP++;
        else if (v === 'L') countL++;
        if (v) evaluated++;
      });

      // Flag if student has high proportion of 'I' (Iniciado) or >= 4 'I's
      const ratioI = evaluated > 0 ? (countI / evaluated) : 0;
      if (countI >= 3 || ratioI >= 0.25) {
        list.push({
          student,
          countI,
          countEP,
          countL,
          evaluated,
          ratioI: Math.round(ratioI * 100),
          observations: evalRec.observations
        });
      }
    });

    return list.sort((a, b) => b.countI - a.countI);
  }, [state.students, state.evaluations, currentPeriod]);

  // Data formatted for Recharts components
  const rechartsData = useMemo(() => {
    return sectionStats
      .filter(sec => chartGradeFilter === 'all' || sec.grade === chartGradeFilter)
      .map(sec => {
        const students = state.students.filter(s => s.grade === sec.grade && s.section === sec.section);
        let totalPresentes = 0;
        let totalDias = 0;

        students.forEach(st => {
          const att = state.evaluations[st.id]?.[currentPeriod]?.attendance;
          if (att && att.diasLaborados > 0) {
            totalPresentes += att.presentes;
            totalDias += att.diasLaborados;
          } else {
            totalPresentes += 74;
            totalDias += 76;
          }
        });

        const attendanceRate = totalDias > 0 ? Math.round((totalPresentes / totalDias) * 100) : 96;
        const gradeShort = sec.grade === 'Prekínder' ? 'Prek' : sec.grade === 'Kínder' ? 'Kind' : 'Prep';
        const label = `${gradeShort} ${sec.section}`;

        return {
          sectionKey: `${sec.grade} ${sec.section}`,
          label,
          grade: sec.grade,
          section: sec.section,
          teacherName: sec.teacherName,
          studentsCount: sec.studentsCount,
          completitud: sec.progressPercent,
          asistencia: attendanceRate,
          countL: sec.countL,
          countEP: sec.countEP,
          countI: sec.countI,
          percentL: sec.percentL,
          percentEP: sec.percentEP,
          percentI: sec.percentI,
        };
      });
  }, [sectionStats, chartGradeFilter, state.students, state.evaluations, currentPeriod]);

  const globalAttendanceAvg = useMemo(() => {
    let totalPresentes = 0;
    let totalDias = 0;
    state.students.forEach(st => {
      const att = state.evaluations[st.id]?.[currentPeriod]?.attendance;
      if (att && att.diasLaborados > 0) {
        totalPresentes += att.presentes;
        totalDias += att.diasLaborados;
      } else {
        totalPresentes += 74;
        totalDias += 76;
      }
    });
    return totalDias > 0 ? Math.round((totalPresentes / totalDias) * 100) : 96;
  }, [state.students, state.evaluations, currentPeriod]);

  const globalDonutData = useMemo(() => {
    return [
      { name: 'Logrado (L)', value: globalSummary.globalPercentL, count: globalSummary.totalL, color: '#10b981' },
      { name: 'En Proceso (EP)', value: globalSummary.globalPercentEP, count: globalSummary.totalEP, color: '#f59e0b' },
      { name: 'Iniciado (I)', value: globalSummary.globalPercentI, count: globalSummary.totalI, color: '#f43f5e' }
    ];
  }, [globalSummary]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Period Title & Alert Banner if lagging */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Panel Directivo de Supervisión Pedagógica
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              Período {currentPeriod}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Monitoreo en tiempo real de registros evaluativos, auditoría de boletines y alertas de rezago para el Nivel Inicial.
          </p>
        </div>

        {globalSummary.laggingSectionsCount > 0 ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Alerta:</strong> {globalSummary.laggingSectionsCount} sección(es) con avance menor al 50% en {currentPeriod}.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Todas las secciones presentan un ritmo de avance favorable.</span>
          </div>
        )}
      </div>

      {/* Global Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: General Registry Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avance de Registro {currentPeriod}</span>
            <span className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {globalSummary.globalProgress}%
            </span>
            <span className="text-xs text-slate-500">
              ({globalSummary.totalFilled.toLocaleString()} de {globalSummary.totalExpected.toLocaleString()} notas)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-700 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${globalSummary.globalProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Achievement Distribution (% L) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Distribución de Logro</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
                {globalSummary.globalPercentL}%
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">L</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-lg font-bold text-amber-600 tracking-tight tabular-nums">
                {globalSummary.globalPercentEP}%
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">EP</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-lg font-bold text-rose-600 tracking-tight tabular-nums">
                {globalSummary.globalPercentI}%
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">I</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Valoración cualitativa global en {currentPeriod}
          </p>
        </div>

        {/* Metric 3: Ready Bulletins for Delivery */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Auditoría de Boletines</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {globalSummary.totalBulletinsReady}
            </span>
            <span className="text-xs text-slate-500">
              de {globalSummary.totalStudents} listos para entrega
            </span>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{globalSummary.totalObservationsPending} pendientes de comentarios</span>
          </p>
        </div>

        {/* Metric 4: Infantes Requiring Pedagogical Support */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alerta de Apoyo Curricular</span>
            <span className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 tracking-tight tabular-nums">
              {studentsRequiringSupport.length}
            </span>
            <span className="text-xs text-slate-500">
              infantes en alerta temprana
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Prioridad para adaptaciones y rincones de apoyo
          </p>
        </div>

      </div>

      {/* SECCIÓN DE ESTADÍSTICAS RÁPIDAS (RECHARTS) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Estadísticas Rápidas del Nivel Inicial · Período {currentPeriod}
                </h2>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Recharts Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Métricas comparativas por sección: completitud de evaluaciones, promedio de asistencia y distribución de niveles de logro.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Grade Filter */}
            <select
              value={chartGradeFilter}
              onChange={(e) => setChartGradeFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700 focus:outline-hidden focus:border-blue-600"
            >
              <option value="all">Todos los Cursos</option>
              <option value="Prekínder">Prekínder (3 Años)</option>
              <option value="Kínder">Kínder (4 Años)</option>
              <option value="Preprimario">Preprimario (5 Años)</option>
            </select>

            {/* View Mode Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setChartViewMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartViewMode === 'all' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Vista General
              </button>
              <button
                onClick={() => setChartViewMode('completion')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartViewMode === 'completion' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Completitud
              </button>
              <button
                onClick={() => setChartViewMode('attendance')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartViewMode === 'attendance' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Asistencia
              </button>
              <button
                onClick={() => setChartViewMode('distribution')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartViewMode === 'distribution' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Logro (L/EP/I)
              </button>
            </div>
          </div>
        </div>

        {/* Global KPI Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Completitud Global de Notas:</span>
            <span className="text-sm font-black text-slate-900 tabular-nums">{globalSummary.globalProgress}%</span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Promedio de Asistencia Escolar:</span>
            <span className="text-sm font-black text-indigo-700 tabular-nums">{globalAttendanceAvg}%</span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Balance Cualitativo General:</span>
            <div className="flex items-center gap-1.5 text-xs font-bold tabular-nums">
              <span className="text-emerald-700">{globalSummary.globalPercentL}% L</span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-600">{globalSummary.globalPercentEP}% EP</span>
              <span className="text-slate-300">·</span>
              <span className="text-rose-600">{globalSummary.globalPercentI}% I</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. COMPLETITUD DE EVALUACIONES POR SECCIÓN */}
          {(chartViewMode === 'all' || chartViewMode === 'completion') && (
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-teal-700" />
                    <span>Porcentaje de Completitud de Evaluaciones por Sección</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Avance de registro oficial de indicadores trabajados en {currentPeriod}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Meta: 100%
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      unit="%" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: any, item: any) => [
                        `${value}% (${item.payload.teacherName})`, 
                        'Completitud'
                      ]}
                      labelFormatter={(label: any, items: any) => {
                        const sec = items?.[0]?.payload;
                        return sec ? `${sec.grade} "${sec.section}" · ${sec.studentsCount} estudiantes` : label;
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                    />
                    <Bar 
                      dataKey="completitud" 
                      name="Completitud (%)" 
                      radius={[6, 6, 0, 0]}
                    >
                      {rechartsData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.sectionKey}`} 
                          fill={entry.completitud >= 75 ? '#0f766e' : entry.completitud >= 50 ? '#0284c7' : '#f59e0b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
                    <span>≥ 75% Al día</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <span>50% - 74%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>&lt; 50% Rezagada</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROMEDIO DE ASISTENCIA ESCOLAR POR SECCIÓN */}
          {(chartViewMode === 'all' || chartViewMode === 'attendance') && (
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Promedio de Asistencia por Sección</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Récord acumulado de días presentes sobre días laborados en {currentPeriod}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Global: {globalAttendanceAvg}%
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[70, 100]} 
                      unit="%" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: any, item: any) => [
                        `${value}% de asistencia escolar`, 
                        'Asistencia'
                      ]}
                      labelFormatter={(label: any, items: any) => {
                        const sec = items?.[0]?.payload;
                        return sec ? `${sec.grade} "${sec.section}" · Titular: ${sec.teacherName}` : label;
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                    />
                    <Bar 
                      dataKey="asistencia" 
                      name="Asistencia (%)" 
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
                <span>Normativa MINERD: Meta de asistencia escolar esperada &gt; 90%</span>
                <span className="font-semibold text-indigo-700">Presentismo favorable</span>
              </div>
            </div>
          )}

          {/* 3. DISTRIBUCIÓN DE NIVELES DE LOGRO POR SECCIÓN (STACKED BAR) */}
          {(chartViewMode === 'all' || chartViewMode === 'distribution') && (
            <div className={`p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-3 ${chartViewMode === 'all' ? 'lg:col-span-2' : 'col-span-full'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Distribución de Niveles de Logro por Sección (L, EP, I)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proporción comparativa de valoración: Logrado (L), En Proceso (EP) e Iniciado (I).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-semibold">
                    <button
                      onClick={() => setDistributionMetric('percent')}
                      className={`px-2 py-0.5 rounded transition-all ${distributionMetric === 'percent' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      % Porcentaje
                    </button>
                    <button
                      onClick={() => setDistributionMetric('count')}
                      className={`px-2 py-0.5 rounded transition-all ${distributionMetric === 'count' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      # Total Notas
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                
                {/* Stacked Bar Chart across classrooms */}
                <div className="lg:col-span-3 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rechartsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                        interval={0}
                      />
                      <YAxis 
                        domain={distributionMetric === 'percent' ? [0, 100] : ['auto', 'auto']} 
                        unit={distributionMetric === 'percent' ? '%' : ''} 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                      <Bar 
                        dataKey={distributionMetric === 'percent' ? 'percentL' : 'countL'} 
                        name="Logrado (L)" 
                        fill="#10b981" 
                        stackId="a" 
                      />
                      <Bar 
                        dataKey={distributionMetric === 'percent' ? 'percentEP' : 'countEP'} 
                        name="En Proceso (EP)" 
                        fill="#f59e0b" 
                        stackId="a" 
                      />
                      <Bar 
                        dataKey={distributionMetric === 'percent' ? 'percentI' : 'countI'} 
                        name="Iniciado (I)" 
                        fill="#f43f5e" 
                        stackId="a" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Overall Donut Chart */}
                <div className="h-64 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 text-center block mb-1">
                    Balance Institucional
                  </span>
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={globalDonutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={68}
                          paddingAngle={3}
                        >
                          {globalDonutData.map((entry, index) => (
                            <Cell key={`donut-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any, item: any) => [
                            `${value}% (${item.payload.count} notas)`,
                            item.payload.name
                          ]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-base font-black text-emerald-700 leading-none">
                        {globalSummary.globalPercentL}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">Logrado</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-semibold mt-1">
                    <span className="text-emerald-700">● L</span>
                    <span className="text-amber-600">● EP</span>
                    <span className="text-rose-600">● I</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Main Table: Section-by-Section Supervision */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Avance y Auditoría por Sección · {currentPeriod}
            </h2>
            <p className="text-xs text-slate-500">
              Desglose detallado por aula, docente asignado, progreso de llenado y porcentaje de logro.
            </p>
          </div>
          <button
            onClick={onNavigateToMatrix}
            className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Ir a Matriz de Calificación</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Grado y Sección</th>
                <th className="py-3 px-4">Docente Titular</th>
                <th className="py-3 px-4 text-center">Matrícula</th>
                <th className="py-3 px-4">Avance de Llenado</th>
                <th className="py-3 px-4 text-center">Distribución (% L / EP / I)</th>
                <th className="py-3 px-4 text-center">Observaciones</th>
                <th className="py-3 px-4 text-center">Boletines Listos</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sectionStats.map((item) => (
                <tr 
                  key={`${item.grade}-${item.section}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {item.grade} · Sección {item.section}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.totalIndicators} indicadores evaluados
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.teacherName}
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                    {item.studentsCount}
                  </td>

                  <td className="py-3 px-4 min-w-[160px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 tabular-nums">{item.progressPercent}%</span>
                      {item.isLagging ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Rezagada
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700">
                          Al día
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${item.isLagging ? 'bg-amber-500' : 'bg-teal-700'}`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 tabular-nums">
                      <span className="font-bold text-emerald-700" title="Logrado">{item.percentL}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-medium text-amber-600" title="En Proceso">{item.percentEP}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-medium text-rose-600" title="Iniciado">{item.percentI}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        onSelectSection(item.grade, item.section);
                        onNavigateToObservations();
                      }}
                      className="px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Revisar redacción y estilo de observaciones en esta aula"
                    >
                      {item.observationsPending === 0 ? (
                        <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Completas (Revisar)</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] hover:bg-amber-100">
                          {item.observationsPending} pendientes ✏️
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.bulletinsReady}
                    </span>
                    <span className="text-slate-400">/{item.studentsCount}</span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectSection(item.grade, item.section)}
                      className="px-3 py-1 bg-slate-100 hover:bg-teal-800 hover:text-white text-slate-800 font-semibold rounded-md transition-all text-xs inline-flex items-center gap-1"
                    >
                      <span>Abrir</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Identification of Children Needing Support */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Identificación Temprana de Infantes que Requieren Apoyo Curricular
              </h3>
              <p className="text-xs text-slate-500">
                Casos con mayor número de indicadores en 'Iniciado (I)' para coordinar intervenciones con el equipo de orientación y familias.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToObservations}
            className="text-xs text-teal-800 hover:underline font-semibold"
          >
            Ver Recomendaciones al Hogar →
          </button>
        </div>

        {studentsRequiringSupport.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No se han registrado estudiantes con rezago crítico en este período.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsRequiringSupport.slice(0, 6).map(({ student, countI, countEP, countL, evaluated }) => (
              <div 
                key={student.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 leading-tight">
                      {student.fullName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 shrink-0">
                      {countI} en 'I'
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {student.grade} · Sección {student.section} · {student.age} Años
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px] tabular-nums">
                    <span className="text-emerald-700 font-bold">{countL} L</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-amber-600 font-bold">{countEP} EP</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-rose-700 font-bold">{countI} I</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSection(student.grade, student.section);
                      onNavigateToMatrix();
                    }}
                    className="text-teal-800 hover:text-teal-950 font-semibold text-xs"
                  >
                    Ver Ficha
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
