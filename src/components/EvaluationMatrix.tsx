import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  ScoreValue, 
  Student, 
  EvaluationPeriod,
  CustomPhrase,
  AppUser
} from '../types';
import { DOMAINS, getIndicatorsByGrade } from '../data/minerdCurriculum';
import { PHRASE_BANK, SuggestedPhrase } from '../data/phraseBank';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Copy, 
  Search, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  ListChecks, 
  FileText, 
  RotateCcw, 
  Save, 
  Edit2, 
  PlusCircle, 
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  getAdaptedPhrasesForStudent,
  generateSuggestedObservationDraft,
  EvaluatedPhraseMatch
} from '../utils/pedagogicalPhraseMatcher';

interface EvaluationMatrixProps {
  state: AppState;
  currentUser?: AppUser;
  onUpdateScore: (
    studentId: string, 
    indicatorId: string, 
    value: ScoreValue, 
    period?: EvaluationPeriod
  ) => void;
  onBulkUpdateStudent: (
    studentId: string, 
    value: ScoreValue, 
    period?: EvaluationPeriod
  ) => void;
  onBulkUpdateIndicator: (
    indicatorId: string, 
    value: ScoreValue, 
    period?: EvaluationPeriod
  ) => void;
  onCopyFromPreviousPeriod: (fromPeriod: 'P1' | 'P2') => void;
  onUpdateObservations: (
    studentId: string, 
    strengths: string, 
    recommendations: string, 
    period?: EvaluationPeriod
  ) => void;
  onUpdateAttendance: (
    studentId: string, 
    attendance: {
      diasLaborados: number;
      presentes: number;
      ausenciasJustificadas: number;
      ausenciasInjustificadas: number;
    }, 
    period?: EvaluationPeriod
  ) => void;
  onNavigateToBulletin: (studentId: string) => void;
  onAddCustomPhrase?: (phrase: CustomPhrase) => void;
  onOpenMoveStudent?: (studentId: string) => void;
}

export const EvaluationMatrix: React.FC<EvaluationMatrixProps> = ({
  state,
  currentUser,
  onUpdateScore,
  onBulkUpdateStudent,
  onCopyFromPreviousPeriod,
  onUpdateObservations,
  onUpdateAttendance,
  onNavigateToBulletin,
  onOpenMoveStudent
}) => {
  const selectedGrade = (currentUser?.role === 'docente' && currentUser.grade) ? currentUser.grade : state.selectedGrade;
  const selectedSection = (currentUser?.role === 'docente' && currentUser.section) ? currentUser.section : state.selectedSection;

  // Students in active classroom
  const sectionStudents = useMemo(() => {
    return state.students
      .filter(s => s.grade === selectedGrade && s.section === selectedSection)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, selectedGrade, selectedSection]);

  // Current student being evaluated
  const [currentStudentIndex, setCurrentStudentIndex] = useState<number>(0);
  
  // Safe active student
  const currentStudent = sectionStudents[currentStudentIndex] || sectionStudents[0] || null;

  // Sub-tab for this student: 'matrix' (indicators) vs 'observations' (qualitative comments)
  const [studentTab, setStudentTab] = useState<'matrix' | 'observations'>('matrix');

  // Observations active period
  const [obsPeriod, setObsPeriod] = useState<EvaluationPeriod>(state.currentPeriod);

  // Filters for indicators
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [indicatorSearch, setIndicatorSearch] = useState<string>('');

  // Phrase bank filters in Observations tab
  const [phraseDomainFilter, setPhraseDomainFilter] = useState<string>('all');
  const [phraseTypeFilter, setPhraseTypeFilter] = useState<'all' | 'strength' | 'recommendation'>('all');
  const [phraseSearchQuery, setPhraseSearchQuery] = useState<string>('');

  // Adaptation modal state
  const [adaptingPhrase, setAdaptingPhrase] = useState<{
    original: SuggestedPhrase | CustomPhrase;
    adaptedText: string;
    targetField: 'strength' | 'recommendation';
  } | null>(null);

  const [lastSavedMessage, setLastSavedMessage] = useState<string>('Autoguardado activo');

  // Indicators for this grade level
  const indicators = useMemo(() => {
    return getIndicatorsByGrade(selectedGrade);
  }, [selectedGrade]);

  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      if (domainFilter !== 'all' && ind.domainId !== domainFilter) return false;
      if (indicatorSearch.trim()) {
        const q = indicatorSearch.toLowerCase();
        return ind.text.toLowerCase().includes(q) || ind.shortText.toLowerCase().includes(q) || ind.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [indicators, domainFilter, indicatorSearch]);

  // Student first name for personalized templates
  const studentFirstName = useMemo(() => {
    if (!currentStudent) return 'El/la estudiante';
    const parts = currentStudent.fullName.trim().split(/\s+/);
    if (parts.length >= 2 && currentStudent.fullName.includes(',')) {
      const namePart = currentStudent.fullName.split(',')[1]?.trim();
      return namePart?.split(/\s+/)[0] || parts[0];
    }
    const raw = parts[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }, [currentStudent]);

  // Current student evaluation records
  const currentStudentEvals = useMemo(() => {
    if (!currentStudent) return null;
    return state.evaluations[currentStudent.id] || null;
  }, [state.evaluations, currentStudent]);

  // Progress metrics for this student across P1, P2, P3
  const studentProgress = useMemo(() => {
    if (!currentStudentEvals) return { P1: 0, P2: 0, P3: 0, totalIndicators: indicators.length };

    const calcProgress = (period: EvaluationPeriod) => {
      const scores = currentStudentEvals[period]?.scores || {};
      let filled = 0;
      indicators.forEach(ind => {
        if (scores[ind.id]) filled++;
      });
      return indicators.length > 0 ? Math.round((filled / indicators.length) * 100) : 0;
    };

    return {
      P1: calcProgress('P1'),
      P2: calcProgress('P2'),
      P3: calcProgress('P3'),
      totalIndicators: indicators.length
    };
  }, [currentStudentEvals, indicators]);

  // Navigation handlers
  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < sectionStudents.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    }
  };

  // Score toggle on indicator for specific period
  const handleScoreSelect = (indicatorId: string, targetVal: ScoreValue, period: EvaluationPeriod) => {
    if (!currentStudent) return;
    const currentVal = currentStudentEvals?.[period]?.scores[indicatorId] || '';
    const nextVal = currentVal === targetVal ? '' : targetVal;
    onUpdateScore(currentStudent.id, indicatorId, nextVal, period);
    setLastSavedMessage(`Autoguardado ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
  };

  // Observations for active obsPeriod
  const activeObsData = currentStudentEvals?.[obsPeriod]?.observations || { strengths: '', recommendations: '' };
  const activeAttendance = currentStudentEvals?.[obsPeriod]?.attendance || {
    diasLaborados: 76,
    presentes: 74,
    ausenciasJustificadas: 2,
    ausenciasInjustificadas: 0
  };

  // Filtered phrases for observations
  const [onlySuggestedMatrix, setOnlySuggestedMatrix] = useState<boolean>(false);
  const [adaptPeriodContextMatrix, setAdaptPeriodContextMatrix] = useState<boolean>(true);

  const allPhrases = useMemo(() => {
    const list: (SuggestedPhrase | CustomPhrase)[] = [...PHRASE_BANK];
    if (state.customPhrases) list.push(...state.customPhrases);
    return list;
  }, [state.customPhrases]);

  // Real-time pedagogical matches for current student in obsPeriod
  const matchedPhrases = useMemo(() => {
    if (!currentStudent) return [];
    const scores = currentStudentEvals?.[obsPeriod]?.scores;
    return getAdaptedPhrasesForStudent(
      currentStudent,
      obsPeriod,
      scores,
      indicators,
      allPhrases,
      adaptPeriodContextMatrix
    );
  }, [currentStudent, obsPeriod, currentStudentEvals, indicators, allPhrases, adaptPeriodContextMatrix]);

  const suggestedCount = useMemo(() => {
    return matchedPhrases.filter(m => m.isSuggested).length;
  }, [matchedPhrases]);

  const filteredMatches = useMemo(() => {
    return matchedPhrases.filter(match => {
      const ph = match.phrase;
      if (onlySuggestedMatrix && !match.isSuggested) return false;
      if (ph.grade !== selectedGrade && ph.grade !== 'Preprimario') return false;
      if (phraseDomainFilter !== 'all' && ph.domainId !== phraseDomainFilter) return false;
      if (phraseTypeFilter !== 'all' && ph.type !== phraseTypeFilter) return false;
      if (phraseSearchQuery.trim()) {
        const q = phraseSearchQuery.toLowerCase();
        const textMatch = ph.text.toLowerCase().includes(q) || match.adaptedText.toLowerCase().includes(q);
        const tagMatch = ph.tags?.some(t => t.toLowerCase().includes(q));
        if (!textMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [matchedPhrases, onlySuggestedMatrix, selectedGrade, phraseDomainFilter, phraseTypeFilter, phraseSearchQuery]);

  const personalizePhrase = (raw: string) => {
    return raw.replace(/\{nombre\}/g, studentFirstName);
  };

  const handleDirectInsertPhrase = (phraseOrMatch: SuggestedPhrase | CustomPhrase | EvaluatedPhraseMatch) => {
    if (!currentStudent) return;
    const isMatch = 'adaptedText' in phraseOrMatch;
    const textToInsert = isMatch 
      ? (phraseOrMatch as EvaluatedPhraseMatch).adaptedText 
      : personalizePhrase((phraseOrMatch as SuggestedPhrase | CustomPhrase).text);
    const phraseType = isMatch 
      ? (phraseOrMatch as EvaluatedPhraseMatch).phrase.type 
      : (phraseOrMatch as SuggestedPhrase | CustomPhrase).type;

    if (phraseType === 'strength') {
      const updated = activeObsData.strengths
        ? `${activeObsData.strengths.trim()} ${textToInsert}`
        : textToInsert;
      onUpdateObservations(currentStudent.id, updated, activeObsData.recommendations, obsPeriod);
    } else {
      const updated = activeObsData.recommendations
        ? `${activeObsData.recommendations.trim()} ${textToInsert}`
        : textToInsert;
      onUpdateObservations(currentStudent.id, activeObsData.strengths, updated, obsPeriod);
    }
  };

  const handleApplySuggestedDraftMatrix = () => {
    if (!currentStudent) return;
    const scores = currentStudentEvals?.[obsPeriod]?.scores;
    const draft = generateSuggestedObservationDraft(
      currentStudent,
      obsPeriod,
      scores,
      indicators,
      allPhrases,
      adaptPeriodContextMatrix
    );
    if (!draft.strengths && !draft.recommendations) {
      alert(`Aún no hay suficientes indicadores evaluados en ${obsPeriod} para generar un borrador automático. Califica algunos indicadores en la tabla primero.`);
      return;
    }
    const newStrengths = draft.strengths || activeObsData.strengths || '';
    const newRecommendations = draft.recommendations || activeObsData.recommendations || '';
    onUpdateObservations(currentStudent.id, newStrengths, newRecommendations, obsPeriod);
  };

  const handleConfirmAdaptedPhrase = () => {
    if (!currentStudent || !adaptingPhrase) return;
    const textToInsert = adaptingPhrase.adaptedText.trim();
    if (!textToInsert) return;

    if (adaptingPhrase.targetField === 'strength') {
      const updated = activeObsData.strengths
        ? `${activeObsData.strengths.trim()} ${textToInsert}`
        : textToInsert;
      onUpdateObservations(currentStudent.id, updated, activeObsData.recommendations, obsPeriod);
    } else {
      const updated = activeObsData.recommendations
        ? `${activeObsData.recommendations.trim()} ${textToInsert}`
        : textToInsert;
      onUpdateObservations(currentStudent.id, activeObsData.strengths, updated, obsPeriod);
    }
    setAdaptingPhrase(null);
  };

  if (!currentStudent) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
        <p className="text-slate-600 font-semibold text-sm">
          No hay estudiantes registrados en {selectedGrade} Sección "{selectedSection}".
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. STUDENT CAROUSEL & NAVIGATION HEADER (One student at a time) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Student Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
              {studentFirstName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {currentStudent.fullName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {currentStudent.grade} · Sección "{currentStudent.section}"
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentStudent.age} Años ({currentStudent.gender === 'F' ? 'Niña' : 'Niño'})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Familia: {currentStudent.parentName || 'Familia'} · Estudiante <strong>{currentStudentIndex + 1} de {sectionStudents.length}</strong>
              </p>
            </div>
          </div>

          {/* Student Navigation Controls (Anterior / Siguiente) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Quick dropdown selector */}
            <select
              value={currentStudentIndex}
              onChange={(e) => setCurrentStudentIndex(parseInt(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 font-semibold text-slate-900 focus:outline-hidden max-w-xs cursor-pointer shadow-2xs"
            >
              {sectionStudents.map((st, idx) => (
                <option key={st.id} value={idx}>
                  {idx + 1}. {st.fullName}
                </option>
              ))}
            </select>

            {/* Anterior Button */}
            <button
              onClick={handlePrevStudent}
              disabled={currentStudentIndex === 0}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Siguiente Button */}
            <button
              onClick={handleNextStudent}
              disabled={currentStudentIndex === sectionStudents.length - 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* View Bulletin Button */}
            <button
              onClick={() => onNavigateToBulletin(currentStudent.id)}
              className="p-2 text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
              title="Previsualizar Boletín Oficial de este estudiante"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Boletín</span>
            </button>

            {/* Mover Estudiante Button */}
            {onOpenMoveStudent && (
              <button
                onClick={() => onOpenMoveStudent(currentStudent.id)}
                className="px-2.5 py-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Mover de sección o curso conservando todas sus evaluaciones"
              >
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Mover Estudiante</span>
              </button>
            )}

          </div>

        </div>

        {/* Period Progress Bars for this Student */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">1er. Período (P1 - Nov)</span>
              <span className="font-black text-slate-900 tabular-nums">{studentProgress.P1}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${studentProgress.P1 === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                style={{ width: `${studentProgress.P1}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">2do. Período (P2 - Mar)</span>
              <span className="font-black text-slate-900 tabular-nums">{studentProgress.P2}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${studentProgress.P2 === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                style={{ width: `${studentProgress.P2}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">3er. Período (P3 - Jun)</span>
              <span className="font-black text-slate-900 tabular-nums">{studentProgress.P3}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${studentProgress.P3 === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                style={{ width: `${studentProgress.P3}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 2. TAB CONTROLS: INDICADORES VS OBSERVACIONES */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 rounded-t-2xl shadow-2xs">
        
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setStudentTab('matrix')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              studentTab === 'matrix' 
                ? 'border-blue-600 text-blue-700 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Matriz de Indicadores (P1, P2, P3)</span>
          </button>

          <button
            onClick={() => setStudentTab('observations')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              studentTab === 'observations' 
                ? 'border-blue-600 text-blue-700 font-black' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Observaciones Cualitativas del Niño</span>
            {currentStudentEvals?.[obsPeriod]?.observations.strengths && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Auto-save notification */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Save className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lastSavedMessage}</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* TAB 1: MATRIZ DE INDICADORES (INDICADORES UNO DEBAJO DE OTRO)  */}
      {/* ============================================================== */}
      {studentTab === 'matrix' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm p-5 space-y-4">
          
          {/* Domain and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Domain Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setDomainFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  domainFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({indicators.length})
              </button>
              {DOMAINS.map(d => {
                const count = indicators.filter(i => i.domainId === d.id).length;
                const isSelected = domainFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDomainFilter(d.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.shortName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Indicator Search */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar indicador..."
                value={indicatorSearch}
                onChange={(e) => setIndicatorSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-800"
              />
            </div>

          </div>

          {/* Quick Bulk Action Tools for this Student */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex-wrap gap-2">
            <span className="font-semibold text-slate-700">Llenado rápido para {studentFirstName}:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onBulkUpdateStudent(currentStudent.id, 'L', 'P1')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-colors"
              >
                P1 todo en L
              </button>
              <button
                onClick={() => onBulkUpdateStudent(currentStudent.id, 'EP', 'P1')}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-2xs transition-colors"
              >
                P1 todo en EP
              </button>
              <button
                onClick={() => onCopyFromPreviousPeriod('P1')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs transition-colors"
              >
                Copiar P1 hacia P2
              </button>
              <button
                onClick={() => onBulkUpdateStudent(currentStudent.id, '', 'P1')}
                className="px-2.5 py-1 text-slate-500 hover:text-rose-700 text-xs font-semibold"
              >
                Limpiar notas
              </button>
            </div>
          </div>

          {/* Vertical Indicators Table (Indicators in rows, P1, P2, P3 in columns) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-20">
                <tr>
                  <th className="py-3 px-4 w-1/2">
                    INDICADORES DE LOGRO (OFICIALES MINERD)
                  </th>
                  <th className="py-3 px-3 text-center min-w-[130px] border-l border-slate-200 bg-blue-50/50">
                    <div className="font-bold text-blue-900">1er Período (P1)</div>
                    <span className="text-[10px] text-slate-500 font-normal">Agosto - Diciembre</span>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[130px] border-l border-slate-200">
                    <div className="font-bold text-slate-800">2do Período (P2)</div>
                    <span className="text-[10px] text-slate-500 font-normal">Enero - Marzo</span>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[130px] border-l border-slate-200">
                    <div className="font-bold text-slate-800">3er Período (P3)</div>
                    <span className="text-[10px] text-slate-500 font-normal">Abril - Junio</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Group by Domain */}
                {DOMAINS.map(domain => {
                  const domainInds = filteredIndicators.filter(i => i.domainId === domain.id);
                  if (domainInds.length === 0) return null;

                  return (
                    <React.Fragment key={domain.id}>
                      {/* Domain Header Row */}
                      <tr className="bg-slate-100/70 border-t border-b border-slate-200">
                        <td 
                          colSpan={4} 
                          className="py-2.5 px-4 font-bold text-xs uppercase tracking-wider"
                          style={{ color: domain.color }}
                        >
                          <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: domain.color }} />
                          {domain.name} ({domainInds.length} indicadores)
                        </td>
                      </tr>

                      {/* Indicator Rows */}
                      {domainInds.map((ind) => {
                        const p1Score = currentStudentEvals?.P1.scores[ind.id] || '';
                        const p2Score = currentStudentEvals?.P2.scores[ind.id] || '';
                        const p3Score = currentStudentEvals?.P3.scores[ind.id] || '';

                        return (
                          <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Column 1: Indicator Text & Code */}
                            <td className="py-3 px-4 align-middle">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-200 shrink-0">
                                    {ind.code}
                                  </span>
                                  <span className="font-bold text-slate-900 text-xs">
                                    {ind.shortText}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed pl-1">
                                  {ind.text}
                                </p>
                              </div>
                            </td>

                            {/* Column 2: P1 Interactive Score Buttons */}
                            <td className="py-2 px-3 text-center border-l border-slate-200 bg-blue-50/20 align-middle">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'L', 'P1')}
                                  title="Logrado (L)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p1Score === 'L'
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                >
                                  L
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'EP', 'P1')}
                                  title="En Proceso (EP)"
                                  className={`w-8 h-8 rounded-lg font-black text-[11px] transition-all shadow-2xs ${
                                    p1Score === 'EP'
                                      ? 'bg-amber-500 text-white ring-2 ring-amber-500 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                                  }`}
                                >
                                  EP
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'I', 'P1')}
                                  title="Iniciado (I)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p1Score === 'I'
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                                  }`}
                                >
                                  I
                                </button>
                              </div>
                            </td>

                            {/* Column 3: P2 Interactive Score Buttons */}
                            <td className="py-2 px-3 text-center border-l border-slate-200 align-middle">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'L', 'P2')}
                                  title="Logrado (L)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p2Score === 'L'
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                >
                                  L
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'EP', 'P2')}
                                  title="En Proceso (EP)"
                                  className={`w-8 h-8 rounded-lg font-black text-[11px] transition-all shadow-2xs ${
                                    p2Score === 'EP'
                                      ? 'bg-amber-500 text-white ring-2 ring-amber-500 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                                  }`}
                                >
                                  EP
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'I', 'P2')}
                                  title="Iniciado (I)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p2Score === 'I'
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                                  }`}
                                >
                                  I
                                </button>
                              </div>
                            </td>

                            {/* Column 4: P3 Interactive Score Buttons */}
                            <td className="py-2 px-3 text-center border-l border-slate-200 align-middle">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'L', 'P3')}
                                  title="Logrado (L)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p3Score === 'L'
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                >
                                  L
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'EP', 'P3')}
                                  title="En Proceso (EP)"
                                  className={`w-8 h-8 rounded-lg font-black text-[11px] transition-all shadow-2xs ${
                                    p3Score === 'EP'
                                      ? 'bg-amber-500 text-white ring-2 ring-amber-500 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                                  }`}
                                >
                                  EP
                                </button>
                                <button
                                  onClick={() => handleScoreSelect(ind.id, 'I', 'P3')}
                                  title="Iniciado (I)"
                                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all shadow-2xs ${
                                    p3Score === 'I'
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-600 scale-105'
                                      : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                                  }`}
                                >
                                  I
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Floating Navigation for Easy Next */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Evaluando a <strong>{currentStudent.fullName}</strong>. Haz clic en <strong>Siguiente</strong> para continuar con el próximo estudiante.
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStudent}
                disabled={currentStudentIndex === 0}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                ◀ Anterior
              </button>
              <button
                onClick={handleNextStudent}
                disabled={currentStudentIndex === sectionStudents.length - 1}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-40"
              >
                Siguiente Estudiante ▶
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: OBSERVACIONES CUALITATIVAS DEL NIÑO (P1, P2, P3)        */}
      {/* ============================================================== */}
      {studentTab === 'observations' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm p-6 space-y-6">
          
          {/* Period selector for observations */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Período de Observación:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['P1', 'P2', 'P3'] as EvaluationPeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setObsPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      obsPeriod === p ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p === 'P1' ? '1er. Período (P1 - Nov)' : p === 'P2' ? '2do. Período (P2)' : '3er. Período (P3)'}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500">
              Estas observaciones se plasmarán en el boletín del estudiante para el período <strong>{obsPeriod}</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Box 1: Strengths */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Cualidades o Aspectos a Destacar ({obsPeriod})
                  </label>
                  <span className="text-[10px] text-slate-400">Fortalezas, talentos y autonomía</span>
                </div>

                <textarea
                  rows={4}
                  value={activeObsData.strengths}
                  onChange={(e) => onUpdateObservations(currentStudent.id, e.target.value, activeObsData.recommendations, obsPeriod)}
                  placeholder={`Ejemplo: ${studentFirstName} muestra gran empatía con sus compañeros, participa activamente en dinámicas de juego y evidencia notable autonomía en sus rutinas...`}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900 leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Destino en boletín: <strong>Cualidades a destacar</strong></span>
                  <span>{activeObsData.strengths.length} caracteres</span>
                </div>
              </div>

              {/* Box 2: Recommendations for Home */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Aspectos a Estimular / Recomendaciones para la Familia ({obsPeriod})
                  </label>
                  <span className="text-[10px] text-slate-400">Acciones concretas para el hogar</span>
                </div>

                <textarea
                  rows={4}
                  value={activeObsData.recommendations}
                  onChange={(e) => onUpdateObservations(currentStudent.id, activeObsData.strengths, e.target.value, obsPeriod)}
                  placeholder={`Ejemplo: Recomendamos reforzar en casa la lectura diaria de cuentos de 15 minutos dialogando sobre los personajes, y practicar la paciencia en la espera de turnos...`}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white text-slate-900 leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Destino en boletín: <strong>Aspectos a estimular</strong></span>
                  <span>{activeObsData.recommendations.length} caracteres</span>
                </div>
              </div>

              {/* Attendance Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Asistencia Oficial en {obsPeriod}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Días Laborados</label>
                    <input
                      type="number"
                      value={activeAttendance.diasLaborados}
                      onChange={(e) => onUpdateAttendance(currentStudent.id, { ...activeAttendance, diasLaborados: parseInt(e.target.value) || 0 }, obsPeriod)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Presentes</label>
                    <input
                      type="number"
                      value={activeAttendance.presentes}
                      onChange={(e) => onUpdateAttendance(currentStudent.id, { ...activeAttendance, presentes: parseInt(e.target.value) || 0 }, obsPeriod)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-bold tabular-nums text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Ausencias Justif.</label>
                    <input
                      type="number"
                      value={activeAttendance.ausenciasJustificadas}
                      onChange={(e) => onUpdateAttendance(currentStudent.id, { ...activeAttendance, ausenciasJustificadas: parseInt(e.target.value) || 0 }, obsPeriod)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-bold tabular-nums text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Ausencias Injust.</label>
                    <input
                      type="number"
                      value={activeAttendance.ausenciasInjustificadas}
                      onChange={(e) => onUpdateAttendance(currentStudent.id, { ...activeAttendance, ausenciasInjustificadas: parseInt(e.target.value) || 0 }, obsPeriod)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white font-bold tabular-nums text-rose-700"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Phrase Bank Column */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-900 text-xs">
                    Banco de Frases MINERD ({selectedGrade})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {filteredMatches.length} disponibles
                </span>
              </div>

              {/* Inline Phrase Adaptation Dialog */}
              {adaptingPhrase && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span>Adaptar frase antes de insertar:</span>
                    <button onClick={() => setAdaptingPhrase(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={adaptingPhrase.adaptedText}
                    onChange={(e) => setAdaptingPhrase({ ...adaptingPhrase, adaptedText: e.target.value })}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleConfirmAdaptedPhrase}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      Confirmar e Insertar
                    </button>
                  </div>
                </div>
              )}

              {/* Filter controls */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar frase por palabra clave..."
                    value={phraseSearchQuery}
                    onChange={(e) => setPhraseSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPhraseTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        phraseTypeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setPhraseTypeFilter('strength')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        phraseTypeFilter === 'strength' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      A Destacar
                    </button>
                    <button
                      onClick={() => setPhraseTypeFilter('recommendation')}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        phraseTypeFilter === 'recommendation' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      A Estimular
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setOnlySuggestedMatrix(!onlySuggestedMatrix)}
                      className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 text-[11px] cursor-pointer transition-all ${
                        onlySuggestedMatrix
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Mostrar solo frases pedagógicas sugeridas según los indicadores de este estudiante"
                    >
                      <Star className={`w-3 h-3 ${onlySuggestedMatrix ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
                      <span>Sugeridas ({suggestedCount})</span>
                    </button>

                    <button
                      onClick={handleApplySuggestedDraftMatrix}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Autocompletar ambas observaciones basadas en la evaluación"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Autocompletar</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={adaptPeriodContextMatrix}
                      onChange={(e) => setAdaptPeriodContextMatrix(e.target.checked)}
                      className="rounded text-blue-600 w-3.5 h-3.5"
                    />
                    <span>Adaptar redacción al período ({obsPeriod})</span>
                  </label>
                  <span className="text-slate-400">{filteredMatches.length} frases</span>
                </div>

                <select
                  value={phraseDomainFilter}
                  onChange={(e) => setPhraseDomainFilter(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  <option value="all">Todas las Competencias / Dominios</option>
                  {DOMAINS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Phrase Cards List with Highlighted Pedagogical Matches */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredMatches.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    {onlySuggestedMatrix 
                      ? 'No hay frases sugeridas con los filtros actuales. Califica más indicadores para ver sugerencias.'
                      : 'No se encontraron frases con los filtros aplicados.'}
                  </div>
                ) : (
                  filteredMatches.map((match) => {
                    const { phrase, isSuggested, matchReason, adaptedText } = match;
                    const domain = DOMAINS.find(d => d.id === phrase.domainId);
                    const isStrength = phrase.type === 'strength';

                    return (
                      <div 
                        key={phrase.id}
                        className={`p-3 rounded-xl border transition-all space-y-1.5 shadow-2xs ${
                          isSuggested
                            ? 'border-amber-300 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 ring-1 ring-amber-300/60 shadow-xs'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${domain?.color}15`, color: domain?.color }}
                            >
                              {domain?.shortName}
                            </span>
                            <span className={`font-bold ${isStrength ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {isStrength ? 'Cualidad a destacar' : 'Recomendación hogar'}
                            </span>
                          </div>

                          {isSuggested && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[9px]">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                              <span>Sugerida ({obsPeriod})</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed font-normal">
                          "{adaptedText}"
                        </p>

                        {matchReason && (
                          <div className="text-[10px] text-amber-900 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-200/80 flex items-center gap-1 font-medium">
                            <Target className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="leading-tight">{matchReason}</span>
                          </div>
                        )}

                        <div className="pt-1 flex justify-end gap-1.5">
                          <button
                            onClick={() => setAdaptingPhrase({
                              original: phrase,
                              adaptedText: adaptedText,
                              targetField: phrase.type
                            })}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded border border-slate-200 bg-white"
                          >
                            Adaptar
                          </button>
                          <button
                            onClick={() => handleDirectInsertPhrase(match)}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded text-white flex items-center gap-1 ${
                              isStrength ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Insertar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* Bottom Floating Navigation for Easy Next */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Observaciones de <strong>{currentStudent.fullName}</strong> ({obsPeriod}).
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStudent}
                disabled={currentStudentIndex === 0}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                ◀ Anterior
              </button>
              <button
                onClick={handleNextStudent}
                disabled={currentStudentIndex === sectionStudents.length - 1}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-40"
              >
                Siguiente Estudiante ▶
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
