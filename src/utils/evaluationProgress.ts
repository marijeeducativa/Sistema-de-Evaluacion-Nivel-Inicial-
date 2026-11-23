import { EvaluationPeriod, GradeLevel, Student, StudentEvaluationRecord } from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';

export interface StudentPeriodMetric {
  student: Student;
  scoredCount: number;
  expectedIndicators: number;
  totalCurriculumIndicators: number;
  evalPercentage: number;
  isEvaluationComplete: boolean;
  hasStrengths: boolean;
  hasRecommendations: boolean;
  hasObservations: boolean;
  isFullyReady: boolean;
  strengths: string;
  recommendations: string;
  countL: number;
  countEP: number;
  countI: number;
}

export interface SectionPeriodMetrics {
  grade: GradeLevel;
  section: string;
  studentsCount: number;
  totalCurriculumIndicators: number;
  workedIndicatorsCount: number;
  hasStartedSection: boolean;
  totalExpectedScores: number;
  filledScores: number;
  cappedFilledScores: number;
  progressPercent: number;
  countL: number;
  countEP: number;
  countI: number;
  percentL: number;
  percentEP: number;
  percentI: number;
  evaluatedCount: number;
  pendingEvaluationCount: number;
  observationsCompleteCount: number;
  observationsPendingCount: number;
  readyBulletinsCount: number;
  pendingBulletinsCount: number;
  studentMetrics: StudentPeriodMetric[];
}

/**
 * Calcula el progreso real de evaluación de una sección en un período (P1, P2 o P3),
 * adaptándose automáticamente a los indicadores realmente trabajados por la docente
 * durante ese período (en Nivel Inicial MINERD no todos los indicadores anuales
 * se evalúan en un solo período).
 */
export function computeSectionPeriodMetrics(
  sectionStudents: Student[],
  evaluations: Record<string, StudentEvaluationRecord>,
  grade: GradeLevel,
  period: EvaluationPeriod
): SectionPeriodMetrics {
  const indicators = getIndicatorsByGrade(grade);
  const totalCurriculumIndicators = indicators.length;

  // Mínimo razonable para evitar que 1 o 2 clics accidentales marquen 100%
  const minPeriodFloor = Math.min(15, Math.ceil(totalCurriculumIndicators * 0.25));

  const indicatorFrequency: Record<string, number> = {};
  let totalCountL = 0;
  let totalCountEP = 0;
  let totalCountI = 0;
  let totalFilledScores = 0;

  const rawPerStudent = sectionStudents.map(student => {
    const evalRec = evaluations[student.id]?.[period];
    const scores = evalRec?.scores || {};

    let scoredCount = 0;
    let countL = 0;
    let countEP = 0;
    let countI = 0;

    indicators.forEach(ind => {
      const val = scores[ind.id];
      if (val) {
        scoredCount++;
        totalFilledScores++;
        indicatorFrequency[ind.id] = (indicatorFrequency[ind.id] || 0) + 1;
        if (val === 'L') {
          countL++;
          totalCountL++;
        } else if (val === 'EP') {
          countEP++;
          totalCountEP++;
        } else if (val === 'I') {
          countI++;
          totalCountI++;
        }
      }
    });

    const strengths = evalRec?.observations?.strengths?.trim() || '';
    const recommendations = evalRec?.observations?.recommendations?.trim() || '';
    const hasStrengths = strengths.length > 0;
    const hasRecommendations = recommendations.length > 0;
    const hasObservations = hasStrengths && hasRecommendations;

    return {
      student,
      scoredCount,
      countL,
      countEP,
      countI,
      strengths,
      recommendations,
      hasStrengths,
      hasRecommendations,
      hasObservations
    };
  });

  const startedStudents = rawPerStudent.filter(r => r.scoredCount > 0);
  const hasStartedSection = startedStudents.length > 0;

  // Determinar cuántos indicadores trabajó el aula en este período
  let workedIndicatorsCount = totalCurriculumIndicators;
  if (startedStudents.length === 1) {
    workedIndicatorsCount = Math.min(
      totalCurriculumIndicators,
      Math.max(startedStudents[0].scoredCount, minPeriodFloor)
    );
  } else if (startedStudents.length >= 2) {
    const majorityThreshold = Math.ceil(startedStudents.length * 0.5);
    const coreWorkedCount = indicators.filter(
      ind => (indicatorFrequency[ind.id] || 0) >= majorityThreshold
    ).length;
    workedIndicatorsCount = Math.min(
      totalCurriculumIndicators,
      Math.max(coreWorkedCount, minPeriodFloor)
    );
  }

  // Tolerancia moderada (85% de los indicadores trabajados en el aula y >= piso mínimo)
  // para cubrir ausencias puntuales o indicadores no observados aún en un niño
  const completionThreshold = Math.max(
    minPeriodFloor,
    Math.floor(workedIndicatorsCount * 0.85)
  );

  let cappedFilledScores = 0;
  let evaluatedCount = 0;
  let observationsCompleteCount = 0;
  let readyBulletinsCount = 0;

  const studentMetrics: StudentPeriodMetric[] = rawPerStudent.map(r => {
    cappedFilledScores += Math.min(r.scoredCount, workedIndicatorsCount);

    const isEvaluationComplete = r.scoredCount >= completionThreshold && workedIndicatorsCount > 0;
    const isFullyReady = isEvaluationComplete && r.hasObservations;

    if (isEvaluationComplete) evaluatedCount++;
    if (r.hasObservations) observationsCompleteCount++;
    if (isFullyReady) readyBulletinsCount++;

    const evalPercentage = workedIndicatorsCount > 0
      ? Math.min(100, Math.round((r.scoredCount / workedIndicatorsCount) * 100))
      : 0;

    return {
      student: r.student,
      scoredCount: r.scoredCount,
      expectedIndicators: workedIndicatorsCount,
      totalCurriculumIndicators,
      evalPercentage,
      isEvaluationComplete,
      hasStrengths: r.hasStrengths,
      hasRecommendations: r.hasRecommendations,
      hasObservations: r.hasObservations,
      isFullyReady,
      strengths: r.strengths,
      recommendations: r.recommendations,
      countL: r.countL,
      countEP: r.countEP,
      countI: r.countI
    };
  });

  const studentsCount = sectionStudents.length;
  const totalExpectedScores = studentsCount * workedIndicatorsCount;
  const progressPercent = totalExpectedScores > 0
    ? Math.min(100, Math.round((cappedFilledScores / totalExpectedScores) * 100))
    : 0;

  return {
    grade,
    section: sectionStudents[0]?.section || '',
    studentsCount,
    totalCurriculumIndicators,
    workedIndicatorsCount,
    hasStartedSection,
    totalExpectedScores,
    filledScores: totalFilledScores,
    cappedFilledScores,
    progressPercent,
    countL: totalCountL,
    countEP: totalCountEP,
    countI: totalCountI,
    percentL: totalFilledScores > 0 ? Math.round((totalCountL / totalFilledScores) * 100) : 0,
    percentEP: totalFilledScores > 0 ? Math.round((totalCountEP / totalFilledScores) * 100) : 0,
    percentI: totalFilledScores > 0 ? Math.round((totalCountI / totalFilledScores) * 100) : 0,
    evaluatedCount,
    pendingEvaluationCount: studentsCount - evaluatedCount,
    observationsCompleteCount,
    observationsPendingCount: studentsCount - observationsCompleteCount,
    readyBulletinsCount,
    pendingBulletinsCount: studentsCount - readyBulletinsCount,
    studentMetrics
  };
}
