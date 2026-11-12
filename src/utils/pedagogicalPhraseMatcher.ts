import { Student, EvaluationPeriod, ScoreValue, Indicator, GradeLevel } from '../types';
import { SuggestedPhrase } from '../data/phraseBank';
import { CustomPhrase } from '../types';

export interface EvaluatedPhraseMatch {
  phrase: SuggestedPhrase | CustomPhrase;
  score: number;
  isSuggested: boolean;
  matchLevel: 'high' | 'medium' | 'none';
  matchReason?: string;
  matchedIndicatorText?: string;
  adaptedText: string;
}

export interface StudentDomainProfile {
  domainId: string;
  achievedCount: number; // L
  inProcessCount: number; // EP
  initiatedCount: number; // I
  totalEvaluated: number;
  achievedIndicators: Indicator[];
  supportIndicators: Indicator[];
}

export interface StudentPeriodEvaluationSummary {
  hasEvaluations: boolean;
  totalEvaluated: number;
  totalAchieved: number;
  totalInProcess: number;
  totalInitiated: number;
  domainProfiles: Record<string, StudentDomainProfile>;
}

/**
 * Extracts key pedagogical keywords from indicator texts to match against phrase tags/text
 */
function extractKeywords(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const words = normalized.split(/[^a-z0-9]+/);
  // Filter out short and common Spanish stop words
  const stopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
    'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o',
    'este', 'si', 'porque', 'esta', 'son', 'entre', 'esta', 'cuando', 'muy', 'sin', 'sobre',
    'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante',
    'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e',
    'esto', 'antes', 'algunos', 'que', 'unos', 'yo', 'otro', 'otras', 'otra', 'tanto', 'esa',
    'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas',
    'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tus', 'forma', 'manera', 'situaciones'
  ]);

  return words.filter(w => w.length > 3 && !stopWords.has(w));
}

/**
 * Builds a structured evaluation summary for a student in a specific period
 */
export function buildStudentPeriodSummary(
  student: Student,
  period: EvaluationPeriod,
  scores: Record<string, ScoreValue> | undefined,
  indicators: Indicator[]
): StudentPeriodEvaluationSummary {
  const domainProfiles: Record<string, StudentDomainProfile> = {};

  // Initialize all domains
  indicators.forEach(ind => {
    if (!domainProfiles[ind.domainId]) {
      domainProfiles[ind.domainId] = {
        domainId: ind.domainId,
        achievedCount: 0,
        inProcessCount: 0,
        initiatedCount: 0,
        totalEvaluated: 0,
        achievedIndicators: [],
        supportIndicators: []
      };
    }
  });

  if (!scores || Object.keys(scores).length === 0) {
    return {
      hasEvaluations: false,
      totalEvaluated: 0,
      totalAchieved: 0,
      totalInProcess: 0,
      totalInitiated: 0,
      domainProfiles
    };
  }

  let totalEvaluated = 0;
  let totalAchieved = 0;
  let totalInProcess = 0;
  let totalInitiated = 0;

  indicators.forEach(ind => {
    const score = scores[ind.id];
    if (score === 'L' || score === 'EP' || score === 'I') {
      totalEvaluated++;
      const prof = domainProfiles[ind.domainId];
      if (prof) {
        prof.totalEvaluated++;
        if (score === 'L') {
          prof.achievedCount++;
          prof.achievedIndicators.push(ind);
          totalAchieved++;
        } else if (score === 'EP') {
          prof.inProcessCount++;
          prof.supportIndicators.push(ind);
          totalInProcess++;
        } else if (score === 'I') {
          prof.initiatedCount++;
          prof.supportIndicators.push(ind);
          totalInitiated++;
        }
      }
    }
  });

  return {
    hasEvaluations: totalEvaluated > 0,
    totalEvaluated,
    totalAchieved,
    totalInProcess,
    totalInitiated,
    domainProfiles
  };
}

/**
 * Personalizes phrase text with student name and optional period temporal connectors
 */
export function adaptPhraseForStudent(
  rawText: string,
  studentName: string,
  period: EvaluationPeriod,
  includePeriodPrefix: boolean = false
): string {
  const parts = studentName.trim().split(/\s+/);
  let firstName = parts[0];
  if (studentName.includes(',')) {
    const afterComma = studentName.split(',')[1]?.trim();
    if (afterComma) firstName = afterComma.split(/\s+/)[0];
  }
  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  let text = rawText.replace(/\{nombre\}/g, firstName);

  if (includePeriodPrefix) {
    const periodPrefixes: Record<EvaluationPeriod, string[]> = {
      P1: [
        `Durante este 1er período, ${firstName}`,
        `En este primer período escolar, ${firstName}`,
        `A lo largo de este período inicial, ${firstName}`
      ],
      P2: [
        `A lo largo de este 2do período, ${firstName}`,
        `En esta etapa intermedia del año escolar, ${firstName}`,
        `Durante este segundo período, ${firstName}`
      ],
      P3: [
        `Al culminar este 3er período, ${firstName}`,
        `En este período de cierre de año escolar, ${firstName}`,
        `Durante esta etapa final, ${firstName}`
      ]
    };

    // If phrase starts with student name, replace it with the prefix smoothly
    const prefixes = periodPrefixes[period];
    const prefix = prefixes[0];

    if (text.startsWith(firstName)) {
      text = `${prefix}${text.slice(firstName.length)}`;
    } else {
      text = `${prefix} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }
  }

  return text;
}

/**
 * Analyzes and ranks phrases for a student in a specific period according to evaluated indicators.
 * 100% deterministic, pedagogical matching without AI or external dependencies.
 */
export function getAdaptedPhrasesForStudent(
  student: Student,
  period: EvaluationPeriod,
  scores: Record<string, ScoreValue> | undefined,
  indicators: Indicator[],
  allPhrases: (SuggestedPhrase | CustomPhrase)[],
  includePeriodPrefix: boolean = false
): EvaluatedPhraseMatch[] {
  const summary = buildStudentPeriodSummary(student, period, scores, indicators);

  return allPhrases.map((phrase): EvaluatedPhraseMatch => {
    const adaptedText = adaptPhraseForStudent(
      phrase.text,
      student.fullName,
      period,
      includePeriodPrefix
    );

    // If student has no evaluations recorded yet in this period, neutral baseline
    if (!summary.hasEvaluations) {
      return {
        phrase,
        score: 0,
        isSuggested: false,
        matchLevel: 'none',
        adaptedText
      };
    }

    const domainProfile = summary.domainProfiles[phrase.domainId];
    let score = 0;
    let matchReason = '';
    let matchedIndicatorText = '';

    const phraseNormalized = phrase.text.toLowerCase();
    const phraseTags = (phrase.tags || []).map(t => t.toLowerCase());

    if (phrase.type === 'strength') {
      // Strengths should align with competencies where student has achieved ('L')
      if (domainProfile && domainProfile.achievedCount > 0) {
        // Base domain match points
        score += 30 + domainProfile.achievedCount * 6;

        // Check keyword alignment with specific achieved indicators
        let bestKeywordOverlap = 0;
        let bestInd: Indicator | null = null;

        domainProfile.achievedIndicators.forEach(ind => {
          const indKeywords = extractKeywords(ind.text + ' ' + (ind.shortText || ''));
          let overlap = 0;
          indKeywords.forEach(kw => {
            if (phraseNormalized.includes(kw) || phraseTags.some(t => t.includes(kw))) {
              overlap++;
            }
          });
          if (overlap > bestKeywordOverlap) {
            bestKeywordOverlap = overlap;
            bestInd = ind;
          }
        });

        if (bestKeywordOverlap > 0 && bestInd) {
          score += bestKeywordOverlap * 12;
          matchedIndicatorText = (bestInd as Indicator).shortText || (bestInd as Indicator).text;
          matchReason = `Ajustada a indicador Logrado (L): "${(bestInd as Indicator).shortText || (bestInd as Indicator).code}"`;
        } else {
          matchReason = `Coincide con ${domainProfile.achievedCount} indicador(es) Logrado(s) (L) en este dominio`;
        }
      } else {
        // No 'L' in this domain for this period -> not recommended as a current strength
        score = 0;
      }
    } else {
      // Recommendations should target competencies where the student is in progress ('EP') or initiated ('I')
      if (domainProfile && (domainProfile.inProcessCount > 0 || domainProfile.initiatedCount > 0)) {
        // Base domain needs points (Initiated gets higher priority for stimulation)
        score += 35 + domainProfile.inProcessCount * 8 + domainProfile.initiatedCount * 14;

        // Check keyword alignment with indicators needing support
        let bestKeywordOverlap = 0;
        let bestInd: Indicator | null = null;

        domainProfile.supportIndicators.forEach(ind => {
          const indKeywords = extractKeywords(ind.text + ' ' + (ind.shortText || ''));
          let overlap = 0;
          indKeywords.forEach(kw => {
            if (phraseNormalized.includes(kw) || phraseTags.some(t => t.includes(kw))) {
              overlap++;
            }
          });
          if (overlap > bestKeywordOverlap) {
            bestKeywordOverlap = overlap;
            bestInd = ind;
          }
        });

        if (bestKeywordOverlap > 0 && bestInd) {
          score += bestKeywordOverlap * 14;
          matchedIndicatorText = (bestInd as Indicator).shortText || (bestInd as Indicator).text;
          matchReason = `Estimulación sugerida para: "${(bestInd as Indicator).shortText || (bestInd as Indicator).code}"`;
        } else {
          const needsCount = domainProfile.inProcessCount + domainProfile.initiatedCount;
          matchReason = `Apoyo específico: estudiante tiene ${needsCount} indicador(es) En Proceso/Iniciado en este dominio`;
        }
      } else if (domainProfile && domainProfile.achievedCount > 0 && domainProfile.inProcessCount === 0 && domainProfile.initiatedCount === 0) {
        // Student already mastered all evaluated indicators in this domain with 'L'!
        // Lower priority for basic remediation phrases
        score = 5;
      }
    }

    const isSuggested = score >= 35;
    const matchLevel: 'high' | 'medium' | 'none' =
      score >= 45 ? 'high' : score >= 35 ? 'medium' : 'none';

    return {
      phrase,
      score,
      isSuggested,
      matchLevel,
      matchReason: matchReason || undefined,
      matchedIndicatorText: matchedIndicatorText || undefined,
      adaptedText
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Generates an automated, pedagocial observation proposal combining top matched strength & recommendation
 */
export function generateSuggestedObservationDraft(
  student: Student,
  period: EvaluationPeriod,
  scores: Record<string, ScoreValue> | undefined,
  indicators: Indicator[],
  allPhrases: (SuggestedPhrase | CustomPhrase)[],
  includePeriodPrefix: boolean = false
): {
  strengths: string;
  recommendations: string;
  topStrengthReason?: string;
  topRecommendationReason?: string;
  matchedCount: number;
} {
  const ranked = getAdaptedPhrasesForStudent(
    student,
    period,
    scores,
    indicators,
    allPhrases,
    includePeriodPrefix
  );

  const topStrength = ranked.find(r => r.phrase.type === 'strength' && r.isSuggested);
  const topRecommendation = ranked.find(r => r.phrase.type === 'recommendation' && r.isSuggested);

  let strengthsText = topStrength ? topStrength.adaptedText : '';
  let recommendationsText = topRecommendation ? topRecommendation.adaptedText : '';

  // Ensure ending period
  if (strengthsText && !/[.!?]$/.test(strengthsText)) strengthsText += '.';
  if (recommendationsText && !/[.!?]$/.test(recommendationsText)) recommendationsText += '.';

  return {
    strengths: strengthsText,
    recommendations: recommendationsText,
    topStrengthReason: topStrength?.matchReason,
    topRecommendationReason: topRecommendation?.matchReason,
    matchedCount: (topStrength ? 1 : 0) + (topRecommendation ? 1 : 0)
  };
}
