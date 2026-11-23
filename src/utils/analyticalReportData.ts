import {
  AppState,
  EvaluationPeriod,
  GradeLevel,
  Student,
  Domain
} from '../types';
import { DOMAINS, getIndicatorsByGrade } from '../data/minerdCurriculum';
import { computeSectionPeriodMetrics, SectionPeriodMetrics } from './evaluationProgress';

export type InterventionPriority = 'Alta' | 'Media' | 'Esperado';
export type DomainDiagnosisStatus = 'Consolidado' | 'En desarrollo' | 'Prioritario' | 'Sin datos';
export type SectionExecutionStatus = 'Completada' | 'Al día' | 'En seguimiento' | 'Rezagada' | 'Sin iniciar';

export interface PeriodSnapshot {
  period: EvaluationPeriod;
  label: string;
  shortLabel: string;
  hasData: boolean;
  progressPercent: number;
  evaluatedCount: number;
  studentsCount: number;
  workedIndicatorsCount: number;
  totalCurriculumIndicators: number;
  countL: number;
  countEP: number;
  countI: number;
  totalScored: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  attendanceAvg: number | null;
  attendanceRecordedCount: number;
  readyBulletinsCount: number;
  observationsCompleteCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
}

export interface PeriodDelta {
  previousPeriod: EvaluationPeriod | null;
  deltaPercentL: number | null;
  deltaPercentEP: number | null;
  deltaPercentI: number | null;
  deltaProgress: number | null;
  deltaAttendance: number | null;
}

export interface DomainAnalyticsItem {
  domain: Domain;
  totalScored: number;
  countL: number;
  countEP: number;
  countI: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  p1PercentL: number | null;
  p2PercentL: number | null;
  p3PercentL: number | null;
  deltaFromPrevL: number | null;
  status: DomainDiagnosisStatus;
  reinforcementStrategy: string;
}

export interface IndicatorAnalyticsItem {
  id: string;
  code: string;
  domainId: string;
  domainShortName: string;
  grade: GradeLevel;
  text: string;
  shortText: string;
  evaluatedStudents: number;
  countL: number;
  countEP: number;
  countI: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  opportunityPercent: number; // % of EP + I
  difficultyScore: number;
}

export interface StudentInterventionItem {
  student: Student;
  grade: GradeLevel;
  section: string;
  teacherName: string;
  scoredCount: number;
  expectedIndicators: number;
  evalPercentage: number;
  countL: number;
  countEP: number;
  countI: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  attendancePercent: number | null;
  unjustifiedAbsences: number;
  hasObservations: boolean;
  priority: InterventionPriority;
  reasons: string[];
  weakDomains: string[];
  recommendedAction: string;
}

export interface SectionAnalyticalReportData {
  generatedAt: string;
  period: EvaluationPeriod;
  periodLabel: string;
  grade: GradeLevel;
  section: string;
  teacherName: string;
  schoolInfo: AppState['schoolInfo'];
  currentMetrics: SectionPeriodMetrics;
  currentSnapshot: PeriodSnapshot;
  longitudinal: Record<EvaluationPeriod, PeriodSnapshot>;
  delta: PeriodDelta;
  domainBreakdown: DomainAnalyticsItem[];
  criticalIndicators: IndicatorAnalyticsItem[];
  strengthIndicators: IndicatorAnalyticsItem[];
  priorityDomainsForAction: DomainAnalyticsItem[];
  allStudentInterventions: StudentInterventionItem[];
  flaggedStudents: StudentInterventionItem[];
  highPriorityCount: number;
  mediumPriorityCount: number;
  expectedCount: number;
  executiveDiagnosis: string;
  actionCommitments: string[];
  baselineComparisonNotes: string;
}

export interface ClassroomComparisonRow {
  grade: GradeLevel;
  section: string;
  teacherName: string;
  studentsCount: number;
  workedIndicatorsCount: number;
  totalCurriculumIndicators: number;
  progressPercent: number;
  evaluatedCount: number;
  readyBulletinsCount: number;
  observationsCompleteCount: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  attendanceAvg: number | null;
  highPriorityCount: number;
  mediumPriorityCount: number;
  status: SectionExecutionStatus;
}

export interface GradeSummaryRow {
  grade: GradeLevel;
  sectionsCount: number;
  studentsCount: number;
  progressPercent: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  p1PercentL: number | null;
  p2PercentL: number | null;
  p3PercentL: number | null;
  attendanceAvg: number | null;
  readyBulletinsCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
}

export interface GeneralLevelAnalyticalReportData {
  generatedAt: string;
  period: EvaluationPeriod;
  periodLabel: string;
  schoolInfo: AppState['schoolInfo'];
  totalStudents: number;
  totalSections: number;
  currentSnapshot: PeriodSnapshot;
  longitudinal: Record<EvaluationPeriod, PeriodSnapshot>;
  delta: PeriodDelta;
  gradeSummaries: GradeSummaryRow[];
  classroomRows: ClassroomComparisonRow[];
  domainBreakdown: DomainAnalyticsItem[];
  criticalIndicatorsByGrade: Record<GradeLevel, IndicatorAnalyticsItem[]>;
  flaggedStudents: StudentInterventionItem[];
  highPriorityCount: number;
  mediumPriorityCount: number;
  laggingSections: ClassroomComparisonRow[];
  executiveDiagnosis: string;
  institutionalDecisions: string[];
  baselineComparisonNotes: string;
}

export const PERIOD_LABELS: Record<EvaluationPeriod, { full: string; short: string }> = {
  P1: { full: '1er Período (Agosto - Diciembre)', short: 'P1 (Nov)' },
  P2: { full: '2do Período (Enero - Marzo)', short: 'P2 (Mar)' },
  P3: { full: '3er Período (Abril - Junio)', short: 'P3 (Jun)' }
};

const DOMAIN_STRATEGIES: Record<string, string> = {
  socioemocional:
    'Reforzar rutinas de asamblea matutina, círculos de diálogo emocional, acuerdos de convivencia visualizados y juegos cooperativos en parejas o pequeños grupos para fortalecer la autorregulación y empatía.',
  artistico:
    'Ampliar experiencias diarias en el rincón de arte y dramatización con modelado en plastilina, rasgado, trazos libres, cantos rítmicos y juego de roles guiado.',
  psicomotor:
    'Implementar circuitos motores diarios (equilibrio, salto, coordinación visomotora), ejercicios de pinza fina (ensartado, trasvasado, uso progresivo de tijeras) y hábitos autónomos de higiene.',
  descubrimiento:
    'Activar el rincón de ciencias y exploración con observación directa, clasificación de elementos naturales, experimentos simples de causa-efecto y proyectos sobre el entorno comunitario.',
  cognitivo:
    'Intensificar juegos manipulativos de conteo, correspondencia uno a uno, seriación por tamaño/color, clasificación lógica, rompecabezas progresivos y nociones espaciales/temporales.',
  comunicativo:
    'Fortalecer la lectura diaria en voz alta con preguntas inferenciales, rincón de biblioteca, rimas, conciencia fonológica lúdica, narración secuencial de cuentos y reconocimiento significativo del nombre propio.'
};

const STANDARD_GRADES: GradeLevel[] = ['Prekínder', 'Kínder', 'Preprimario'];

function getPreviousPeriod(period: EvaluationPeriod): EvaluationPeriod | null {
  if (period === 'P2') return 'P1';
  if (period === 'P3') return 'P2';
  return null;
}

function getStudentAttendanceForPeriod(
  state: AppState,
  studentId: string,
  period: EvaluationPeriod,
  hasStartedPeriod: boolean
): { rate: number | null; unjustified: number; present: number; totalDays: number } {
  const att = state.evaluations[studentId]?.[period]?.attendance;
  if (!att || !att.diasLaborados || att.diasLaborados <= 0) {
    return { rate: null, unjustified: 0, present: 0, totalDays: 0 };
  }
  if (!hasStartedPeriod && !(state.evaluations[studentId]?.[period]?.scores && Object.values(state.evaluations[studentId][period].scores).some(Boolean))) {
    // Period has not started at all; still return null so unstarted periods don't show misleading default 97%
    return { rate: null, unjustified: att.ausenciasInjustificadas || 0, present: att.presentes, totalDays: att.diasLaborados };
  }
  const rate = Math.min(100, Math.max(0, Math.round((att.presentes / att.diasLaborados) * 100)));
  return {
    rate,
    unjustified: att.ausenciasInjustificadas || 0,
    present: att.presentes,
    totalDays: att.diasLaborados
  };
}

function classifyStudentIntervention(
  state: AppState,
  student: Student,
  period: EvaluationPeriod,
  teacherName: string,
  sectionWorkedIndicatorsCount: number,
  hasStartedPeriod: boolean
): StudentInterventionItem {
  const indicators = getIndicatorsByGrade(student.grade);
  const evalRec = state.evaluations[student.id]?.[period];
  const scores = evalRec?.scores || {};

  let scoredCount = 0;
  let countL = 0;
  let countEP = 0;
  let countI = 0;

  const domainCounts: Record<string, { total: number; countI: number; countEP: number }> = {};
  DOMAINS.forEach(d => {
    domainCounts[d.id] = { total: 0, countI: 0, countEP: 0 };
  });

  indicators.forEach(ind => {
    const val = scores[ind.id];
    if (val) {
      scoredCount++;
      domainCounts[ind.domainId].total++;
      if (val === 'L') countL++;
      else if (val === 'EP') {
        countEP++;
        domainCounts[ind.domainId].countEP++;
      } else if (val === 'I') {
        countI++;
        domainCounts[ind.domainId].countI++;
      }
    }
  });

  const percentL = scoredCount > 0 ? Math.round((countL / scoredCount) * 100) : 0;
  const percentEP = scoredCount > 0 ? Math.round((countEP / scoredCount) * 100) : 0;
  const percentI = scoredCount > 0 ? Math.round((countI / scoredCount) * 100) : 0;

  const attStats = getStudentAttendanceForPeriod(state, student.id, period, hasStartedPeriod);
  const hasObservations = Boolean(
    evalRec?.observations?.strengths?.trim() && evalRec?.observations?.recommendations?.trim()
  );

  const ratioI = scoredCount > 0 ? countI / scoredCount : 0;
  const ratioEP = scoredCount > 0 ? countEP / scoredCount : 0;
  const lowAttendance = attStats.rate !== null && attStats.rate < 85;
  const highAbsences = attStats.unjustified >= 3;

  const reasons: string[] = [];
  let priority: InterventionPriority = 'Esperado';

  if (scoredCount > 0 && (countI >= 4 || ratioI >= 0.25)) {
    priority = 'Alta';
    reasons.push(`${countI} ind. en Iniciado (${percentI}%)`);
  } else if (scoredCount > 0 && (countI >= 2 || ratioI >= 0.12 || ratioEP >= 0.5)) {
    priority = 'Media';
    if (countI >= 2) reasons.push(`${countI} ind. en Iniciado`);
    if (ratioEP >= 0.5) reasons.push(`${percentEP}% en Proceso`);
  }

  if (lowAttendance || highAbsences) {
    if (priority === 'Esperado') priority = 'Media';
    else if (priority === 'Media' && attStats.rate !== null && attStats.rate < 78) priority = 'Alta';
    if (attStats.rate !== null && lowAttendance) reasons.push(`Asistencia baja (${attStats.rate}%)`);
    if (highAbsences) reasons.push(`${attStats.unjustified} aus. injustificadas`);
  }

  // Weak domains for this student
  const weakDomains = DOMAINS.map(d => {
    const dc = domainCounts[d.id];
    const risk = dc.total > 0 ? (dc.countI * 2 + dc.countEP) / dc.total : 0;
    return { shortName: d.shortName, risk, countI: dc.countI, countEP: dc.countEP };
  })
    .filter(d => d.countI > 0 || d.risk >= 0.55)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 2)
    .map(d => d.shortName);

  let recommendedAction = 'Mantener acompañamiento regular en rutina de aula y motivación en el hogar.';
  if (priority === 'Alta') {
    if (lowAttendance || highAbsences) {
      recommendedAction =
        'Entrevista urgente con familia, plan de seguimiento de asistencia y refuerzo individualizado en rincones prioritarios.';
    } else {
      recommendedAction =
        'Plan de apoyo individualizado en pequeños grupos, coordinación con Orientación/Psicología y seguimiento quincenal con la familia.';
    }
  } else if (priority === 'Media') {
    if (lowAttendance || highAbsences) {
      recommendedAction =
        'Contactar familia para regularizar asistencia y asignar actividades lúdicas breves de consolidación.';
    } else {
      recommendedAction =
        'Refuerzo focalizado en rincones de aprendizaje y envío de guía práctica de actividades al hogar.';
    }
  }

  const evalPercentage =
    sectionWorkedIndicatorsCount > 0
      ? Math.min(100, Math.round((scoredCount / sectionWorkedIndicatorsCount) * 100))
      : 0;

  return {
    student,
    grade: student.grade,
    section: student.section,
    teacherName,
    scoredCount,
    expectedIndicators: sectionWorkedIndicatorsCount,
    evalPercentage,
    countL,
    countEP,
    countI,
    percentL,
    percentEP,
    percentI,
    attendancePercent: attStats.rate,
    unjustifiedAbsences: attStats.unjustified,
    hasObservations,
    priority,
    reasons,
    weakDomains,
    recommendedAction
  };
}

function buildSectionSnapshot(
  state: AppState,
  sectionStudents: Student[],
  grade: GradeLevel,
  period: EvaluationPeriod,
  teacherName: string
): {
  metrics: SectionPeriodMetrics;
  snapshot: PeriodSnapshot;
  interventions: StudentInterventionItem[];
} {
  const metrics = computeSectionPeriodMetrics(sectionStudents, state.evaluations, grade, period);

  let totalPresent = 0;
  let totalDays = 0;
  let attendanceRecordedCount = 0;

  const interventions = sectionStudents
    .map(st => {
      const item = classifyStudentIntervention(
        state,
        st,
        period,
        teacherName,
        metrics.workedIndicatorsCount,
        metrics.hasStartedSection
      );
      if (metrics.hasStartedSection) {
        const att = state.evaluations[st.id]?.[period]?.attendance;
        if (att && att.diasLaborados > 0) {
          totalPresent += att.presentes;
          totalDays += att.diasLaborados;
          attendanceRecordedCount++;
        }
      }
      return item;
    })
    .sort((a, b) => {
      const rank = { Alta: 0, Media: 1, Esperado: 2 };
      if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
      if (b.countI !== a.countI) return b.countI - a.countI;
      if (b.countEP !== a.countEP) return b.countEP - a.countEP;
      return a.student.fullName.localeCompare(b.student.fullName);
    });

  const highPriorityCount = interventions.filter(i => i.priority === 'Alta').length;
  const mediumPriorityCount = interventions.filter(i => i.priority === 'Media').length;
  const attendanceAvg = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : null;

  const snapshot: PeriodSnapshot = {
    period,
    label: PERIOD_LABELS[period].full,
    shortLabel: PERIOD_LABELS[period].short,
    hasData: metrics.filledScores > 0,
    progressPercent: metrics.progressPercent,
    evaluatedCount: metrics.evaluatedCount,
    studentsCount: metrics.studentsCount,
    workedIndicatorsCount: metrics.workedIndicatorsCount,
    totalCurriculumIndicators: metrics.totalCurriculumIndicators,
    countL: metrics.countL,
    countEP: metrics.countEP,
    countI: metrics.countI,
    totalScored: metrics.filledScores,
    percentL: metrics.percentL,
    percentEP: metrics.percentEP,
    percentI: metrics.percentI,
    attendanceAvg,
    attendanceRecordedCount,
    readyBulletinsCount: metrics.readyBulletinsCount,
    observationsCompleteCount: metrics.observationsCompleteCount,
    highPriorityCount,
    mediumPriorityCount
  };

  return { metrics, snapshot, interventions };
}

function computeDomainStatsForStudents(
  state: AppState,
  students: Student[],
  period: EvaluationPeriod
): Record<string, { total: number; L: number; EP: number; I: number; percentL: number | null }> {
  const acc: Record<string, { total: number; L: number; EP: number; I: number; percentL: number | null }> = {};
  DOMAINS.forEach(d => {
    acc[d.id] = { total: 0, L: 0, EP: 0, I: 0, percentL: null };
  });

  students.forEach(st => {
    const indicators = getIndicatorsByGrade(st.grade);
    const scores = state.evaluations[st.id]?.[period]?.scores || {};
    indicators.forEach(ind => {
      const v = scores[ind.id];
      if (!v) return;
      acc[ind.domainId].total++;
      if (v === 'L') acc[ind.domainId].L++;
      else if (v === 'EP') acc[ind.domainId].EP++;
      else if (v === 'I') acc[ind.domainId].I++;
    });
  });

  DOMAINS.forEach(d => {
    const entry = acc[d.id];
    entry.percentL = entry.total > 0 ? Math.round((entry.L / entry.total) * 100) : null;
  });

  return acc;
}

function buildDomainBreakdown(
  state: AppState,
  students: Student[],
  period: EvaluationPeriod
): DomainAnalyticsItem[] {
  const p1Stats = computeDomainStatsForStudents(state, students, 'P1');
  const p2Stats = computeDomainStatsForStudents(state, students, 'P2');
  const p3Stats = computeDomainStatsForStudents(state, students, 'P3');

  const currentStats = period === 'P1' ? p1Stats : period === 'P2' ? p2Stats : p3Stats;
  const prevPeriod = getPreviousPeriod(period);
  const prevStats = prevPeriod === 'P1' ? p1Stats : prevPeriod === 'P2' ? p2Stats : null;

  return DOMAINS.map(domain => {
    const cur = currentStats[domain.id];
    const percentL = cur.total > 0 ? Math.round((cur.L / cur.total) * 100) : 0;
    const percentEP = cur.total > 0 ? Math.round((cur.EP / cur.total) * 100) : 0;
    const percentI = cur.total > 0 ? Math.round((cur.I / cur.total) * 100) : 0;

    let status: DomainDiagnosisStatus = 'Sin datos';
    if (cur.total > 0) {
      if (percentL >= 75 && percentI <= 10) status = 'Consolidado';
      else if (percentI >= 20 || percentL < 55) status = 'Prioritario';
      else status = 'En desarrollo';
    }

    const prevL = prevStats?.[domain.id]?.percentL ?? null;
    const deltaFromPrevL = cur.total > 0 && prevL !== null ? percentL - prevL : null;

    return {
      domain,
      totalScored: cur.total,
      countL: cur.L,
      countEP: cur.EP,
      countI: cur.I,
      percentL,
      percentEP,
      percentI,
      p1PercentL: p1Stats[domain.id].percentL,
      p2PercentL: p2Stats[domain.id].percentL,
      p3PercentL: p3Stats[domain.id].percentL,
      deltaFromPrevL,
      status,
      reinforcementStrategy: DOMAIN_STRATEGIES[domain.id] || ''
    };
  });
}

function buildIndicatorAnalytics(
  state: AppState,
  students: Student[],
  grade: GradeLevel,
  period: EvaluationPeriod
): IndicatorAnalyticsItem[] {
  const indicators = getIndicatorsByGrade(grade);
  const domainMap = new Map(DOMAINS.map(d => [d.id, d.shortName]));

  return indicators
    .map(ind => {
      let L = 0;
      let EP = 0;
      let I = 0;
      let total = 0;

      students.forEach(st => {
        const val = state.evaluations[st.id]?.[period]?.scores?.[ind.id];
        if (!val) return;
        total++;
        if (val === 'L') L++;
        else if (val === 'EP') EP++;
        else if (val === 'I') I++;
      });

      const percentL = total > 0 ? Math.round((L / total) * 100) : 0;
      const percentEP = total > 0 ? Math.round((EP / total) * 100) : 0;
      const percentI = total > 0 ? Math.round((I / total) * 100) : 0;
      const opportunityPercent = total > 0 ? Math.round(((EP + I) / total) * 100) : 0;
      const difficultyScore = total > 0 ? Math.round(((I * 2 + EP) / total) * 100) : 0;

      return {
        id: ind.id,
        code: ind.code,
        domainId: ind.domainId,
        domainShortName: domainMap.get(ind.domainId) || ind.domainId,
        grade,
        text: ind.text,
        shortText: ind.shortText,
        evaluatedStudents: total,
        countL: L,
        countEP: EP,
        countI: I,
        percentL,
        percentEP,
        percentI,
        opportunityPercent,
        difficultyScore
      };
    })
    .filter(item => item.evaluatedStudents > 0);
}

function computeDelta(
  current: PeriodSnapshot,
  longitudinal: Record<EvaluationPeriod, PeriodSnapshot>,
  period: EvaluationPeriod
): PeriodDelta {
  const prevPeriod = getPreviousPeriod(period);
  if (!prevPeriod || !longitudinal[prevPeriod].hasData || !current.hasData) {
    return {
      previousPeriod: prevPeriod,
      deltaPercentL: null,
      deltaPercentEP: null,
      deltaPercentI: null,
      deltaProgress: null,
      deltaAttendance: null
    };
  }
  const prev = longitudinal[prevPeriod];
  return {
    previousPeriod: prevPeriod,
    deltaPercentL: current.percentL - prev.percentL,
    deltaPercentEP: current.percentEP - prev.percentEP,
    deltaPercentI: current.percentI - prev.percentI,
    deltaProgress: current.progressPercent - prev.progressPercent,
    deltaAttendance:
      current.attendanceAvg !== null && prev.attendanceAvg !== null
        ? current.attendanceAvg - prev.attendanceAvg
        : null
  };
}

export function buildSectionAnalyticalReport(
  state: AppState,
  grade: GradeLevel,
  section: string,
  period: EvaluationPeriod
): SectionAnalyticalReportData {
  const sectionStudents = state.students
    .filter(s => s.grade === grade && s.section === section)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const teacher = state.teachers.find(t => t.grade === grade && t.section === section);
  const teacherName = teacher?.name || 'Docente sin asignar';

  const p1Data = buildSectionSnapshot(state, sectionStudents, grade, 'P1', teacherName);
  const p2Data = buildSectionSnapshot(state, sectionStudents, grade, 'P2', teacherName);
  const p3Data = buildSectionSnapshot(state, sectionStudents, grade, 'P3', teacherName);

  const longitudinal: Record<EvaluationPeriod, PeriodSnapshot> = {
    P1: p1Data.snapshot,
    P2: p2Data.snapshot,
    P3: p3Data.snapshot
  };

  const activeData = period === 'P1' ? p1Data : period === 'P2' ? p2Data : p3Data;
  const delta = computeDelta(activeData.snapshot, longitudinal, period);

  const domainBreakdown = buildDomainBreakdown(state, sectionStudents, period);
  const indicatorAnalytics = buildIndicatorAnalytics(state, sectionStudents, grade, period);

  const criticalIndicators = [...indicatorAnalytics]
    .filter(i => i.countI > 0 || i.countEP > 0)
    .sort((a, b) => {
      if (b.difficultyScore !== a.difficultyScore) return b.difficultyScore - a.difficultyScore;
      return b.countI - a.countI;
    })
    .slice(0, 6);

  const strengthIndicators = [...indicatorAnalytics]
    .sort((a, b) => {
      if (b.percentL !== a.percentL) return b.percentL - a.percentL;
      return b.evaluatedStudents - a.evaluatedStudents;
    })
    .slice(0, 4);

  const priorityDomainsForAction = [...domainBreakdown]
    .filter(d => d.totalScored > 0)
    .sort((a, b) => {
      const aScore = a.percentI * 2 + a.percentEP;
      const bScore = b.percentI * 2 + b.percentEP;
      return bScore - aScore;
    })
    .slice(0, 3);

  const flaggedStudents = activeData.interventions.filter(i => i.priority !== 'Esperado');
  const highPriorityCount = activeData.snapshot.highPriorityCount;
  const mediumPriorityCount = activeData.snapshot.mediumPriorityCount;
  const expectedCount = activeData.interventions.length - flaggedStudents.length;

  const snap = activeData.snapshot;
  let executiveDiagnosis = '';
  if (!snap.hasData) {
    executiveDiagnosis = `La sección ${grade} "${section}" (${sectionStudents.length} estudiantes) aún no registra calificaciones en el período ${period}. Este informe deja documentada la matrícula base y la estructura de seguimiento para comparar los resultados una vez se complete el registro evaluativo.`;
  } else {
    const strongestDomain = [...domainBreakdown]
      .filter(d => d.totalScored > 0)
      .sort((a, b) => b.percentL - a.percentL)[0];
    const weakestDomain = priorityDomainsForAction[0];
    const trendPhrase =
      delta.previousPeriod && delta.deltaPercentL !== null
        ? ` Respecto a ${delta.previousPeriod}, el indicador Logrado (L) varió en ${delta.deltaPercentL >= 0 ? '+' : ''}${delta.deltaPercentL} pts.`
        : ' Este cierre establece la línea base oficial del aula para comparar la evolución en los próximos períodos.';

    executiveDiagnosis =
      `Durante ${PERIOD_LABELS[period].full}, ${grade} "${section}" alcanzó un avance de registro de ${snap.progressPercent}% (${snap.evaluatedCount}/${snap.studentsCount} estudiantes evaluados en ${snap.workedIndicatorsCount} de ${snap.totalCurriculumIndicators} indicadores trabajados). ` +
      `El balance cualitativo refleja ${snap.percentL}% Logrado (L), ${snap.percentEP}% En Proceso (EP) y ${snap.percentI}% Iniciado (I).` +
      (strongestDomain ? ` Mayor fortaleza en ${strongestDomain.domain.shortName} (${strongestDomain.percentL}% L)` : '') +
      (weakestDomain ? ` y principal foco de refuerzo en ${weakestDomain.domain.shortName} (${weakestDomain.percentI}% I · ${weakestDomain.percentEP}% EP).` : '.') +
      trendPhrase;
  }

  const actionCommitments: string[] = [];
  if (snap.progressPercent < 100) {
    actionCommitments.push(
      `Completar el registro evaluativo y las observaciones cualitativas de los ${snap.studentsCount - snap.readyBulletinsCount} estudiante(s) pendientes antes del cierre definitivo del corte.`
    );
  }
  if (priorityDomainsForAction.length > 0) {
    const topNames = priorityDomainsForAction.slice(0, 2).map(d => d.domain.shortName).join(' y ');
    actionCommitments.push(
      `Reorganizar los rincones de aprendizaje semanales priorizando los dominios ${topNames} mediante experiencias lúdicas manipulativas y modelado guiado.`
    );
  }
  if (highPriorityCount > 0 || mediumPriorityCount > 0) {
    actionCommitments.push(
      `Ejecutar seguimiento quincenal a los ${highPriorityCount + mediumPriorityCount} estudiante(s) en prioridad Alta/Media (${highPriorityCount} Alta, ${mediumPriorityCount} Media) y entregar orientaciones prácticas a sus familias.`
    );
  } else if (snap.hasData) {
    actionCommitments.push(
      'Mantener el acompañamiento preventivo y enriquecer las actividades de autonomía y expresión para consolidar los indicadores en proceso hacia el nivel Logrado.'
    );
  }
  if (snap.attendanceAvg !== null && snap.attendanceAvg < 90) {
    actionCommitments.push(
      `Articular con Coordinación y familias un plan de mejora de asistencia (promedio actual: ${snap.attendanceAvg}%, meta MINERD ≥ 90%).`
    );
  } else {
    actionCommitments.push(
      'Conservar los porcentajes de P1/P2/P3 registrados en este documento como referencia longitudinal para medir la progresión de logros en el siguiente período.'
    );
  }

  const baselineComparisonNotes =
    period === 'P1'
      ? 'Línea Base Oficial (P1): Los porcentajes de dominio (%L/%EP/%I), indicadores críticos y nómina de seguimiento de este período constituyen el punto de partida comparativo para P2 (Marzo) y P3 (Junio).'
      : longitudinal.P1.hasData
      ? `Comparación Longitudinal Activa: P1 (${longitudinal.P1.percentL}% L) → ${period} (${snap.percentL}% L). Variación acumulada desde la línea base P1: ${snap.hasData ? `${snap.percentL - longitudinal.P1.percentL >= 0 ? '+' : ''}${snap.percentL - longitudinal.P1.percentL} pts en Logrado` : 'pendiente de registro en este período'}.`
      : `Referencia Longitudinal (${period}): Una vez completado el corte anterior y el actual, la tabla comparativa calcula automáticamente las variaciones entre P1, P2 y P3.`;

  return {
    generatedAt: new Date().toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    period,
    periodLabel: PERIOD_LABELS[period].full,
    grade,
    section,
    teacherName,
    schoolInfo: state.schoolInfo,
    currentMetrics: activeData.metrics,
    currentSnapshot: activeData.snapshot,
    longitudinal,
    delta,
    domainBreakdown,
    criticalIndicators,
    strengthIndicators,
    priorityDomainsForAction,
    allStudentInterventions: activeData.interventions,
    flaggedStudents,
    highPriorityCount,
    mediumPriorityCount,
    expectedCount,
    executiveDiagnosis,
    actionCommitments,
    baselineComparisonNotes
  };
}

function buildSchoolSnapshot(
  state: AppState,
  period: EvaluationPeriod
): {
  snapshot: PeriodSnapshot;
  classroomRows: ClassroomComparisonRow[];
  allInterventions: StudentInterventionItem[];
} {
  const sections: string[] = ['A', 'B', 'C'];
  const classroomRows: ClassroomComparisonRow[] = [];
  const allInterventions: StudentInterventionItem[] = [];

  let totalExpectedScores = 0;
  let totalCappedFilled = 0;
  let totalFilled = 0;
  let totalCountL = 0;
  let totalCountEP = 0;
  let totalCountI = 0;
  let totalEvaluated = 0;
  let totalReadyBulletins = 0;
  let totalObsComplete = 0;
  let totalPresent = 0;
  let totalDays = 0;
  let attendanceRecordedCount = 0;
  let sumWorkedIndicators = 0;
  let sumTotalCurriculum = 0;

  STANDARD_GRADES.forEach(grade => {
    sections.forEach(sec => {
      const students = state.students
        .filter(s => s.grade === grade && s.section === sec)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      if (students.length === 0) return;

      const teacher = state.teachers.find(t => t.grade === grade && t.section === sec);
      const teacherName = teacher?.name || 'Docente sin asignar';

      const { metrics, snapshot, interventions } = buildSectionSnapshot(
        state,
        students,
        grade,
        period,
        teacherName
      );

      totalExpectedScores += metrics.totalExpectedScores;
      totalCappedFilled += metrics.cappedFilledScores;
      totalFilled += metrics.filledScores;
      totalCountL += metrics.countL;
      totalCountEP += metrics.countEP;
      totalCountI += metrics.countI;
      totalEvaluated += metrics.evaluatedCount;
      totalReadyBulletins += metrics.readyBulletinsCount;
      totalObsComplete += metrics.observationsCompleteCount;
      sumWorkedIndicators += metrics.workedIndicatorsCount;
      sumTotalCurriculum += metrics.totalCurriculumIndicators;

      if (metrics.hasStartedSection) {
        students.forEach(st => {
          const att = state.evaluations[st.id]?.[period]?.attendance;
          if (att && att.diasLaborados > 0) {
            totalPresent += att.presentes;
            totalDays += att.diasLaborados;
            attendanceRecordedCount++;
          }
        });
      }

      let status: SectionExecutionStatus = 'Sin iniciar';
      if (metrics.filledScores === 0) status = 'Sin iniciar';
      else if (metrics.progressPercent >= 95 && metrics.readyBulletinsCount === students.length) status = 'Completada';
      else if (metrics.progressPercent >= 75) status = 'Al día';
      else if (metrics.progressPercent >= 50) status = 'En seguimiento';
      else status = 'Rezagada';

      classroomRows.push({
        grade,
        section: sec,
        teacherName,
        studentsCount: students.length,
        workedIndicatorsCount: metrics.workedIndicatorsCount,
        totalCurriculumIndicators: metrics.totalCurriculumIndicators,
        progressPercent: metrics.progressPercent,
        evaluatedCount: metrics.evaluatedCount,
        readyBulletinsCount: metrics.readyBulletinsCount,
        observationsCompleteCount: metrics.observationsCompleteCount,
        percentL: metrics.percentL,
        percentEP: metrics.percentEP,
        percentI: metrics.percentI,
        attendanceAvg: snapshot.attendanceAvg,
        highPriorityCount: snapshot.highPriorityCount,
        mediumPriorityCount: snapshot.mediumPriorityCount,
        status
      });

      allInterventions.push(...interventions);
    });
  });

  const progressPercent =
    totalExpectedScores > 0 ? Math.min(100, Math.round((totalCappedFilled / totalExpectedScores) * 100)) : 0;
  const percentL = totalFilled > 0 ? Math.round((totalCountL / totalFilled) * 100) : 0;
  const percentEP = totalFilled > 0 ? Math.round((totalCountEP / totalFilled) * 100) : 0;
  const percentI = totalFilled > 0 ? Math.round((totalCountI / totalFilled) * 100) : 0;
  const attendanceAvg = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : null;

  const highPriorityCount = allInterventions.filter(i => i.priority === 'Alta').length;
  const mediumPriorityCount = allInterventions.filter(i => i.priority === 'Media').length;

  const snapshot: PeriodSnapshot = {
    period,
    label: PERIOD_LABELS[period].full,
    shortLabel: PERIOD_LABELS[period].short,
    hasData: totalFilled > 0,
    progressPercent,
    evaluatedCount: totalEvaluated,
    studentsCount: state.students.length,
    workedIndicatorsCount: classroomRows.length > 0 ? Math.round(sumWorkedIndicators / classroomRows.length) : 0,
    totalCurriculumIndicators: classroomRows.length > 0 ? Math.round(sumTotalCurriculum / classroomRows.length) : 0,
    countL: totalCountL,
    countEP: totalCountEP,
    countI: totalCountI,
    totalScored: totalFilled,
    percentL,
    percentEP,
    percentI,
    attendanceAvg,
    attendanceRecordedCount,
    readyBulletinsCount: totalReadyBulletins,
    observationsCompleteCount: totalObsComplete,
    highPriorityCount,
    mediumPriorityCount
  };

  allInterventions.sort((a, b) => {
    const rank = { Alta: 0, Media: 1, Esperado: 2 };
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
    if (b.countI !== a.countI) return b.countI - a.countI;
    if (b.countEP !== a.countEP) return b.countEP - a.countEP;
    return a.student.fullName.localeCompare(b.student.fullName);
  });

  return { snapshot, classroomRows, allInterventions };
}

export function buildGeneralLevelAnalyticalReport(
  state: AppState,
  period: EvaluationPeriod
): GeneralLevelAnalyticalReportData {
  const p1Data = buildSchoolSnapshot(state, 'P1');
  const p2Data = buildSchoolSnapshot(state, 'P2');
  const p3Data = buildSchoolSnapshot(state, 'P3');

  const longitudinal: Record<EvaluationPeriod, PeriodSnapshot> = {
    P1: p1Data.snapshot,
    P2: p2Data.snapshot,
    P3: p3Data.snapshot
  };

  const activeData = period === 'P1' ? p1Data : period === 'P2' ? p2Data : p3Data;
  const delta = computeDelta(activeData.snapshot, longitudinal, period);

  // Grade-level comparative summaries
  const gradeSummaries: GradeSummaryRow[] = STANDARD_GRADES.map(grade => {
    const rows = activeData.classroomRows.filter(r => r.grade === grade);
    const p1Rows = p1Data.classroomRows.filter(r => r.grade === grade);
    const p2Rows = p2Data.classroomRows.filter(r => r.grade === grade);
    const p3Rows = p3Data.classroomRows.filter(r => r.grade === grade);

    const students = state.students.filter(s => s.grade === grade);
    const indicators = getIndicatorsByGrade(grade);

    const computeGradePeriodPercentL = (p: EvaluationPeriod): number | null => {
      let l = 0;
      let tot = 0;
      students.forEach(st => {
        const scores = state.evaluations[st.id]?.[p]?.scores || {};
        indicators.forEach(ind => {
          const v = scores[ind.id];
          if (v) {
            tot++;
            if (v === 'L') l++;
          }
        });
      });
      return tot > 0 ? Math.round((l / tot) * 100) : null;
    };

    let l = 0;
    let ep = 0;
    let i = 0;
    let tot = 0;
    let totalPresent = 0;
    let totalDays = 0;
    let totalExpected = 0;
    let totalCapped = 0;

    rows.forEach(r => {
      const secStudents = state.students.filter(s => s.grade === grade && s.section === r.section);
      const metrics = computeSectionPeriodMetrics(secStudents, state.evaluations, grade, period);
      totalExpected += metrics.totalExpectedScores;
      totalCapped += metrics.cappedFilledScores;
      l += metrics.countL;
      ep += metrics.countEP;
      i += metrics.countI;
      tot += metrics.filledScores;

      if (metrics.hasStartedSection) {
        secStudents.forEach(st => {
          const att = state.evaluations[st.id]?.[period]?.attendance;
          if (att && att.diasLaborados > 0) {
            totalPresent += att.presentes;
            totalDays += att.diasLaborados;
          }
        });
      }
    });

    void p1Rows;
    void p2Rows;
    void p3Rows;

    return {
      grade,
      sectionsCount: rows.length,
      studentsCount: students.length,
      progressPercent: totalExpected > 0 ? Math.min(100, Math.round((totalCapped / totalExpected) * 100)) : 0,
      percentL: tot > 0 ? Math.round((l / tot) * 100) : 0,
      percentEP: tot > 0 ? Math.round((ep / tot) * 100) : 0,
      percentI: tot > 0 ? Math.round((i / tot) * 100) : 0,
      p1PercentL: computeGradePeriodPercentL('P1'),
      p2PercentL: computeGradePeriodPercentL('P2'),
      p3PercentL: computeGradePeriodPercentL('P3'),
      attendanceAvg: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : null,
      readyBulletinsCount: rows.reduce((sum, r) => sum + r.readyBulletinsCount, 0),
      highPriorityCount: rows.reduce((sum, r) => sum + r.highPriorityCount, 0),
      mediumPriorityCount: rows.reduce((sum, r) => sum + r.mediumPriorityCount, 0)
    };
  });

  const domainBreakdown = buildDomainBreakdown(state, state.students, period);

  const criticalIndicatorsByGrade = {
    Prekínder: [] as IndicatorAnalyticsItem[],
    Kínder: [] as IndicatorAnalyticsItem[],
    Preprimario: [] as IndicatorAnalyticsItem[],
    'Párvulo I': [] as IndicatorAnalyticsItem[],
    'Párvulo II': [] as IndicatorAnalyticsItem[],
    'Párvulo III': [] as IndicatorAnalyticsItem[]
  } as Record<GradeLevel, IndicatorAnalyticsItem[]>;

  STANDARD_GRADES.forEach(grade => {
    const gradeStudents = state.students.filter(s => s.grade === grade);
    criticalIndicatorsByGrade[grade] = buildIndicatorAnalytics(state, gradeStudents, grade, period)
      .filter(i => i.countI > 0 || i.countEP > 0)
      .sort((a, b) => {
        if (b.difficultyScore !== a.difficultyScore) return b.difficultyScore - a.difficultyScore;
        return b.countI - a.countI;
      })
      .slice(0, 3);
  });

  const flaggedStudents = activeData.allInterventions.filter(i => i.priority !== 'Esperado');
  const highPriorityCount = activeData.snapshot.highPriorityCount;
  const mediumPriorityCount = activeData.snapshot.mediumPriorityCount;
  const laggingSections = activeData.classroomRows.filter(
    r => r.progressPercent < 50 || r.status === 'Sin iniciar'
  );

  const snap = activeData.snapshot;
  const priorityDomains = [...domainBreakdown]
    .filter(d => d.totalScored > 0)
    .sort((a, b) => b.percentI * 2 + b.percentEP - (a.percentI * 2 + a.percentEP));

  let executiveDiagnosis = '';
  if (!snap.hasData) {
    executiveDiagnosis = `El Nivel Inicial (${state.students.length} infantes distribuidos en ${activeData.classroomRows.length} secciones) aún no presenta calificaciones registradas para ${period}. Este documento consolida la estructura general para control de apertura y seguimiento coordinado.`;
  } else {
    const weakestDomain = priorityDomains[0];
    const completedSections = activeData.classroomRows.filter(r => r.progressPercent >= 75).length;
    executiveDiagnosis =
      `Al cierre del ${PERIOD_LABELS[period].full}, el Nivel Inicial registra una cobertura global de ${snap.progressPercent}% (${completedSections} de ${activeData.classroomRows.length} secciones al día o completadas; ${snap.readyBulletinsCount}/${snap.studentsCount} boletines listos). ` +
      `Sobre los indicadores evaluados, el desempeño general se sitúa en ${snap.percentL}% Logrado (L), ${snap.percentEP}% En Proceso (EP) y ${snap.percentI}% Iniciado (I). ` +
      (weakestDomain
        ? `A nivel curricular, el dominio con mayor demanda de reforzamiento es ${weakestDomain.domain.name} (${weakestDomain.percentI}% I · ${weakestDomain.percentEP}% EP). `
        : '') +
      `Se identifican ${highPriorityCount} estudiante(s) en prioridad Alta y ${mediumPriorityCount} en prioridad Media que ameritan seguimiento focalizado.`;
  }

  const institutionalDecisions: string[] = [];
  if (laggingSections.length > 0) {
    const names = laggingSections.map(s => `${s.grade} "${s.section}" (${s.progressPercent}%)`).join(', ');
    institutionalDecisions.push(
      `Acompañamiento técnico prioritario a las secciones con registro pendiente o rezago (${names}) para completar su evaluación y observaciones cualitativas.`
    );
  }
  if (priorityDomains.length > 0) {
    const weakest = priorityDomains.slice(0, 2).map(d => `${d.domain.shortName} (${d.percentL}% L)`).join(' y ');
    institutionalDecisions.push(
      `Planificar taller de microenseñanza y diseño de secuencias lúdicas de Nivel Inicial enfocadas en ${weakest} para el próximo período.`
    );
  }
  if (highPriorityCount > 0) {
    institutionalDecisions.push(
      `Activar mesa de articulación con Orientación Escolar y familias para los ${highPriorityCount} caso(s) de prioridad Alta con planes de apoyo individualizado.`
    );
  } else {
    institutionalDecisions.push(
      'Consolidar círculos de aprendizaje preventivo y fortalecimiento familiar en todos los grados para elevar los indicadores En Proceso (EP) hacia Logrado (L).'
    );
  }
  institutionalDecisions.push(
    'Establecer los indicadores globales y por dominio de este corte como línea base institucional oficial para evaluar la mejora longitudinal en el siguiente período.'
  );

  const baselineComparisonNotes =
    period === 'P1'
      ? 'Línea Base Institucional P1: Los resultados globales, por grado, sección y dominio quedan fijados como referencia oficial para medir el progreso del Nivel Inicial en P2 (Marzo) y P3 (Junio).'
      : longitudinal.P1.hasData
      ? `Evolución desde Línea Base P1: Logrado global pasó de ${longitudinal.P1.percentL}% (P1) a ${snap.hasData ? `${snap.percentL}% (${period})` : 'pendiente de cierre'}.`
      : `Línea Base Longitudinal (${period}): Las columnas P1, P2 y P3 muestran automáticamente el histórico comparativo por dominio, grado y centro.`;

  return {
    generatedAt: new Date().toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    period,
    periodLabel: PERIOD_LABELS[period].full,
    schoolInfo: state.schoolInfo,
    totalStudents: state.students.length,
    totalSections: activeData.classroomRows.length,
    currentSnapshot: activeData.snapshot,
    longitudinal,
    delta,
    gradeSummaries,
    classroomRows: activeData.classroomRows,
    domainBreakdown,
    criticalIndicatorsByGrade,
    flaggedStudents,
    highPriorityCount,
    mediumPriorityCount,
    laggingSections,
    executiveDiagnosis,
    institutionalDecisions,
    baselineComparisonNotes
  };
}
