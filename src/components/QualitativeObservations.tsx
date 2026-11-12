import React, { useState, useMemo, useCallback } from 'react';
import { 
  AppState, 
  GradeLevel, 
  EvaluationPeriod,
  Student,
  CustomPhrase,
  AppUser
} from '../types';
import { PHRASE_BANK, SuggestedPhrase } from '../data/phraseBank';
import { DOMAINS, getIndicatorsByGrade } from '../data/minerdCurriculum';
import { getStudentFamilyName } from '../utils/familyName';
import {
  getAdaptedPhrasesForStudent,
  generateSuggestedObservationDraft,
  buildStudentPeriodSummary,
  EvaluatedPhraseMatch
} from '../utils/pedagogicalPhraseMatcher';
import { 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Calendar, 
  FileText, 
  Edit2, 
  Check, 
  X, 
  BookmarkPlus, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Printer,
  UserCheck,
  MessageSquare,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  MessageCircle,
  HelpCircle,
  Upload,
  Star,
  Target,
  Lightbulb,
  Info,
  TrendingUp
} from 'lucide-react';

interface QualitativeObservationsProps {
  state: AppState;
  currentUser?: AppUser;
  initialStudentId?: string;
  onUpdateObservations: (
    studentId: string, 
    strengths: string, 
    recommendations: string
  ) => void;
  onUpdateAttendance: (
    studentId: string,
    attendance: {
      diasLaborados: number;
      presentes: number;
      ausenciasJustificadas: number;
      ausenciasInjustificadas: number;
    }
  ) => void;
  onNavigateToBulletin: (studentId: string) => void;
  onAddCustomPhrase?: (phrase: CustomPhrase) => void;
  onGradeChange?: (grade: GradeLevel) => void;
  onSectionChange?: (section: string) => void;
  onPeriodChange?: (period: EvaluationPeriod) => void;
  onOpenBulkObservations?: () => void;
}

// All ordered sections in the school for quick previous/next classroom navigation
const ALL_SECTIONS: { grade: GradeLevel; section: string }[] = [
  { grade: 'Prekínder', section: 'A' },
  { grade: 'Prekínder', section: 'B' },
  { grade: 'Kínder', section: 'A' },
  { grade: 'Kínder', section: 'B' },
  { grade: 'Kínder', section: 'C' },
  { grade: 'Preprimario', section: 'A' },
  { grade: 'Preprimario', section: 'B' },
  { grade: 'Preprimario', section: 'C' },
];

export const QualitativeObservations: React.FC<QualitativeObservationsProps> = ({
  state,
  currentUser,
  initialStudentId,
  onUpdateObservations,
  onUpdateAttendance,
  onNavigateToBulletin,
  onAddCustomPhrase,
  onGradeChange,
  onSectionChange,
  onPeriodChange,
  onOpenBulkObservations
}) => {
  const selectedGrade = (currentUser?.role === 'docente' && currentUser.grade) ? currentUser.grade : state.selectedGrade;
  const selectedSection = (currentUser?.role === 'docente' && currentUser.section) ? currentUser.section : state.selectedSection;
  const currentPeriod = state.currentPeriod;

  // View Mode: 'review' (Revisión Continua de Aula - Coordinación) or 'single' (Ficha Individual Asistida)
  const [viewMode, setViewMode] = useState<'review' | 'single'>('review');

  // Filter in Review Mode: 'all' | 'completed' | 'pending'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Active quick phrase picker modal target
  const [phrasePickerTarget, setPhrasePickerTarget] = useState<{
    studentId: string;
    studentName: string;
    targetField: 'strength' | 'recommendation';
  } | null>(null);

  // Auto-save notification feedback
  const [lastSavedStudentId, setLastSavedStudentId] = useState<string | null>(null);

  // Students in active section
  const sectionStudents = useMemo(() => {
    return state.students
      .filter(s => s.grade === selectedGrade && s.section === selectedSection)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, selectedGrade, selectedSection]);

  // Active student for single view mode
  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudentId || (sectionStudents[0]?.id || '')
  );

  // Current classroom teacher
  const currentTeacher = useMemo(() => {
    return state.teachers.find(
      t => t.grade === selectedGrade && t.section === selectedSection
    );
  }, [state.teachers, selectedGrade, selectedSection]);

  // Section observations statistics
  const sectionStats = useMemo(() => {
    const total = sectionStudents.length;
    let completed = 0;
    sectionStudents.forEach(st => {
      const obs = state.evaluations[st.id]?.[currentPeriod]?.observations;
      if (obs && obs.strengths.trim() && obs.recommendations.trim()) {
        completed++;
      }
    });
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [sectionStudents, state.evaluations, currentPeriod]);

  // Navigation index for all classrooms
  const currentSectionIndex = ALL_SECTIONS.findIndex(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const prev = ALL_SECTIONS[currentSectionIndex - 1];
      onGradeChange?.(prev.grade);
      onSectionChange?.(prev.section);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < ALL_SECTIONS.length - 1) {
      const next = ALL_SECTIONS[currentSectionIndex + 1];
      onGradeChange?.(next.grade);
      onSectionChange?.(next.section);
    }
  };

  // Helper for style correction: fixes capitalization, ensures proper punctuation and accents
  const formatTextProperly = (text: string): string => {
    if (!text.trim()) return '';
    let cleaned = text.trim();
    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    // Capitalize after periods
    cleaned = cleaned.replace(/\.\s+([a-záéíóúñ])/g, (_, letter) => `. ${letter.toUpperCase()}`);
    // Ensure terminating period
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }
    return cleaned;
  };

  // Apply style correction to a student
  const handleFormatStudentObservations = (studentId: string) => {
    const currentEval = state.evaluations[studentId]?.[currentPeriod];
    const strengths = currentEval?.observations.strengths || '';
    const recommendations = currentEval?.observations.recommendations || '';

    const newStrengths = formatTextProperly(strengths);
    const newRecommendations = formatTextProperly(recommendations);

    onUpdateObservations(studentId, newStrengths, newRecommendations);
    setLastSavedStudentId(studentId);
    setTimeout(() => setLastSavedStudentId(null), 3000);
  };

  // Batch style correction across the whole classroom
  const handleBatchFormatClassroom = () => {
    let count = 0;
    sectionStudents.forEach(st => {
      const currentEval = state.evaluations[st.id]?.[currentPeriod];
      const strengths = currentEval?.observations.strengths || '';
      const recommendations = currentEval?.observations.recommendations || '';

      if (strengths.trim() || recommendations.trim()) {
        const newStrengths = formatTextProperly(strengths);
        const newRecommendations = formatTextProperly(recommendations);
        if (newStrengths !== strengths || newRecommendations !== recommendations) {
          onUpdateObservations(st.id, newStrengths, newRecommendations);
          count++;
        }
      }
    });

    alert(`Se corrigió la puntuación y mayúsculas de ${count} estudiantes en ${selectedGrade} Sección "${selectedSection}".`);
  };

  // Direct text change handler with instant auto-save
  const handleTextChange = (
    studentId: string, 
    field: 'strengths' | 'recommendations', 
    value: string
  ) => {
    const currentEval = state.evaluations[studentId]?.[currentPeriod];
    const strengths = field === 'strengths' ? value : (currentEval?.observations.strengths || '');
    const recommendations = field === 'recommendations' ? value : (currentEval?.observations.recommendations || '');

    onUpdateObservations(studentId, strengths, recommendations);
    setLastSavedStudentId(studentId);
  };

  // Single View: Extract first name
  const currentStudent = useMemo(() => {
    return sectionStudents.find(s => s.id === activeStudentId) || sectionStudents[0] || null;
  }, [sectionStudents, activeStudentId]);

  const studentFirstName = useMemo(() => {
    if (!currentStudent) return 'El/la estudiante';
    const parts = currentStudent.fullName.trim().split(/\s+/);
    if (parts.length >= 2 && currentStudent.fullName.includes(',')) {
      const namePart = currentStudent.fullName.split(',')[1]?.trim();
      return namePart?.split(/\s+/)[0] || parts[0];
    }
    const rawName = parts[0];
    return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  }, [currentStudent]);

  // Phrase Bank filters for single mode
  const [phraseGradeFilter, setPhraseGradeFilter] = useState<string>(selectedGrade);
  const [phraseDomainFilter, setPhraseDomainFilter] = useState<string>('all');
  const [phraseTypeFilter, setPhraseTypeFilter] = useState<'all' | 'strength' | 'recommendation'>('all');
  const [phraseSearchQuery, setPhraseSearchQuery] = useState<string>('');
  const [onlySuggestedFilter, setOnlySuggestedFilter] = useState<boolean>(false);
  const [adaptPeriodContext, setAdaptPeriodContext] = useState<boolean>(true);

  // Adaptation dialog state
  const [adaptingPhrase, setAdaptingPhrase] = useState<{
    original: SuggestedPhrase | CustomPhrase;
    adaptedText: string;
    targetField: 'strength' | 'recommendation';
  } | null>(null);

  // New custom phrase form state
  const [isCreatingPhrase, setIsCreatingPhrase] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseDomain, setNewPhraseDomain] = useState('socioemocional');
  const [newPhraseType, setNewPhraseType] = useState<'strength' | 'recommendation'>('strength');

  const allPhrases = useMemo(() => {
    const list: (SuggestedPhrase | CustomPhrase)[] = [...PHRASE_BANK];
    if (state.customPhrases && state.customPhrases.length > 0) {
      list.push(...state.customPhrases);
    }
    return list;
  }, [state.customPhrases]);

  // Curriculum indicators for current grade
  const gradeIndicators = useMemo(() => {
    return getIndicatorsByGrade(selectedGrade);
  }, [selectedGrade]);

  // Real-time evaluation summary for current student in currentPeriod
  const studentEvalSummary = useMemo(() => {
    if (!currentStudent) return null;
    const scores = state.evaluations[currentStudent.id]?.[currentPeriod]?.scores;
    return buildStudentPeriodSummary(currentStudent, currentPeriod, scores, gradeIndicators);
  }, [currentStudent, currentPeriod, state.evaluations, gradeIndicators]);

  // Real-time pedagogical matches for current student in currentPeriod
  const studentPeriodMatches = useMemo(() => {
    if (!currentStudent) return [];
    const scores = state.evaluations[currentStudent.id]?.[currentPeriod]?.scores;
    return getAdaptedPhrasesForStudent(
      currentStudent,
      currentPeriod,
      scores,
      gradeIndicators,
      allPhrases,
      adaptPeriodContext
    );
  }, [currentStudent, currentPeriod, state.evaluations, gradeIndicators, allPhrases, adaptPeriodContext]);

  // Count of suggested phrases for this student
  const suggestedCount = useMemo(() => {
    return studentPeriodMatches.filter(m => m.isSuggested).length;
  }, [studentPeriodMatches]);

  const filteredMatches = useMemo(() => {
    return studentPeriodMatches.filter(match => {
      const phrase = match.phrase;
      if (onlySuggestedFilter && !match.isSuggested) {
        return false;
      }
      if (phraseGradeFilter !== 'all' && phrase.grade !== phraseGradeFilter && phrase.grade !== 'Preprimario') {
        return false;
      }
      if (phraseDomainFilter !== 'all' && phrase.domainId !== phraseDomainFilter) {
        return false;
      }
      if (phraseTypeFilter !== 'all' && phrase.type !== phraseTypeFilter) {
        return false;
      }
      if (phraseSearchQuery.trim()) {
        const query = phraseSearchQuery.toLowerCase();
        const textMatch = phrase.text.toLowerCase().includes(query) || match.adaptedText.toLowerCase().includes(query);
        const tagsMatch = phrase.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!textMatch && !tagsMatch) return false;
      }
      return true;
    });
  }, [studentPeriodMatches, onlySuggestedFilter, phraseGradeFilter, phraseDomainFilter, phraseTypeFilter, phraseSearchQuery]);

  const personalizeText = (rawText: string, firstName?: string) => {
    return rawText.replace(/\{nombre\}/g, firstName || studentFirstName);
  };

  const handleDirectInsertSingle = (phraseOrMatch: SuggestedPhrase | CustomPhrase | EvaluatedPhraseMatch) => {
    if (!currentStudent) return;
    const isMatch = 'adaptedText' in phraseOrMatch;
    const textToInsert = isMatch ? (phraseOrMatch as EvaluatedPhraseMatch).adaptedText : personalizeText((phraseOrMatch as SuggestedPhrase | CustomPhrase).text);
    const phraseType = isMatch ? (phraseOrMatch as EvaluatedPhraseMatch).phrase.type : (phraseOrMatch as SuggestedPhrase | CustomPhrase).type;

    const evalRec = state.evaluations[currentStudent.id]?.[currentPeriod];
    const sText = evalRec?.observations.strengths || '';
    const rText = evalRec?.observations.recommendations || '';

    if (phraseType === 'strength') {
      const updated = sText ? `${sText.trim()} ${textToInsert}` : textToInsert;
      onUpdateObservations(currentStudent.id, updated, rText);
    } else {
      const updated = rText ? `${rText.trim()} ${textToInsert}` : textToInsert;
      onUpdateObservations(currentStudent.id, sText, updated);
    }
    setLastSavedStudentId(currentStudent.id);
    setTimeout(() => setLastSavedStudentId(null), 3000);
  };

  // Generate and apply pedagogical observation draft in 1-click based on evaluated indicators
  const handleApplySuggestedDraft = (targetStudentId?: string) => {
    const student = targetStudentId 
      ? sectionStudents.find(s => s.id === targetStudentId) 
      : currentStudent;
    if (!student) return;

    const scores = state.evaluations[student.id]?.[currentPeriod]?.scores;
    const draft = generateSuggestedObservationDraft(
      student,
      currentPeriod,
      scores,
      gradeIndicators,
      allPhrases,
      adaptPeriodContext
    );

    if (!draft.strengths && !draft.recommendations) {
      alert(`Aún no hay suficientes indicadores evaluados para ${student.fullName} en ${currentPeriod}. Evalúa algunos indicadores en la Matriz primero para poder adaptar las observaciones automáticamente.`);
      return;
    }

    const currentObs = state.evaluations[student.id]?.[currentPeriod]?.observations;
    const newStrengths = draft.strengths || currentObs?.strengths || '';
    const newRecommendations = draft.recommendations || currentObs?.recommendations || '';

    onUpdateObservations(student.id, newStrengths, newRecommendations);
    setLastSavedStudentId(student.id);
    setTimeout(() => setLastSavedStudentId(null), 3000);
  };

  const handleInsertFromPicker = (phraseOrMatch: SuggestedPhrase | CustomPhrase | EvaluatedPhraseMatch) => {
    if (!phrasePickerTarget) return;
    const { studentId, studentName, targetField } = phrasePickerTarget;
    const studentParts = studentName.trim().split(/\s+/);
    const firstName = studentParts[0].charAt(0).toUpperCase() + studentParts[0].slice(1).toLowerCase();
    
    const isMatch = 'adaptedText' in phraseOrMatch;
    const textToInsert = isMatch 
      ? (phraseOrMatch as EvaluatedPhraseMatch).adaptedText 
      : personalizeText((phraseOrMatch as SuggestedPhrase | CustomPhrase).text, firstName);

    const evalRec = state.evaluations[studentId]?.[currentPeriod];
    const currentStrengths = evalRec?.observations.strengths || '';
    const currentRecommendations = evalRec?.observations.recommendations || '';

    if (targetField === 'strength') {
      const updated = currentStrengths ? `${currentStrengths.trim()} ${textToInsert}` : textToInsert;
      onUpdateObservations(studentId, updated, currentRecommendations);
    } else {
      const updated = currentRecommendations ? `${currentRecommendations.trim()} ${textToInsert}` : textToInsert;
      onUpdateObservations(studentId, currentStrengths, updated);
    }

    setPhrasePickerTarget(null);
  };

  // Filter students for Review Mode
  const filteredReviewStudents = useMemo(() => {
    return sectionStudents.filter(st => {
      const obs = state.evaluations[st.id]?.[currentPeriod]?.observations;
      const isComplete = !!(obs?.strengths.trim() && obs?.recommendations.trim());

      if (reviewFilter === 'completed' && !isComplete) return false;
      if (reviewFilter === 'pending' && isComplete) return false;

      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase();
        const family = getStudentFamilyName(st).toLowerCase();
        return st.fullName.toLowerCase().includes(q) || family.includes(q);
      }
      return true;
    });
  }, [sectionStudents, state.evaluations, currentPeriod, reviewFilter, reviewSearch]);

  const handleSaveCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const phrase: CustomPhrase = {
      id: `custom-ph-${Date.now()}`,
      domainId: newPhraseDomain,
      grade: selectedGrade,
      type: newPhraseType,
      text: newPhraseText.trim(),
      tags: ['docente', 'coordinadora', 'personalizada']
    };

    onAddCustomPhrase?.(phrase);
    setNewPhraseText('');
    setIsCreatingPhrase(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. COORDINATION CLASSROOM NAVIGATOR & TEACHER INFO BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        
        {/* Top line: Title & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-800" />
                <span>Observaciones Cualitativas y Revisión Pedagógica</span>
              </h1>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                {currentPeriod}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supervisión de estilo, redacción pedagógica y observaciones cualitativas para el boletín oficial MINERD.
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto border border-slate-200">
            <button
              onClick={() => setViewMode('review')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'review'
                  ? 'bg-white text-teal-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>Revisión de Aula (Coordinación)</span>
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-teal-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Ficha Individual Asistida</span>
            </button>
          </div>
        </div>

        {/* Classroom Quick Selector Bar (Curso, Sección, Período, Navegación Rápida) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Navegar Aulas:</span>
            
            {/* Grade Pills */}
            {(['Prekínder', 'Kínder', 'Preprimario'] as GradeLevel[]).map(g => (
              <button
                key={g}
                onClick={() => onGradeChange?.(g)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}

            <span className="text-slate-300">|</span>

            {/* Section Pills */}
            {(['A', 'B', 'C'] as const).map(sec => {
              // Check if this section exists for selectedGrade
              const exists = state.students.some(s => s.grade === selectedGrade && s.section === sec);
              if (!exists) return null;

              return (
                <button
                  key={sec}
                  onClick={() => onSectionChange?.(sec)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Sección {sec}
                </button>
              );
            })}

            <span className="text-slate-300">|</span>

            {/* Period Selector */}
            <select
              value={currentPeriod}
              onChange={(e) => onPeriodChange?.(e.target.value as EvaluationPeriod)}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 py-1.5 px-2 rounded-lg cursor-pointer"
            >
              <option value="P1">Período 1 (P1)</option>
              <option value="P2">Período 2 (P2)</option>
              <option value="P3">Período 3 (P3)</option>
            </select>
          </div>

          {/* Quick Classroom Prev / Next Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevSection}
              disabled={currentSectionIndex <= 0}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Ir al aula anterior"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Aula Anterior</span>
            </button>
            <button
              onClick={handleNextSection}
              disabled={currentSectionIndex >= ALL_SECTIONS.length - 1}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Ir a la siguiente aula"
            >
              <span className="hidden sm:inline">Siguiente Aula</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

        </div>

        {/* Teacher & Progress Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Docente Titular: {currentTeacher?.name || 'No asignada'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{selectedGrade} · Sección "{selectedSection}"</span>
                {currentTeacher?.phone && (
                  <>
                    <span>·</span>
                    <a 
                      href={`https://wa.me/1${currentTeacher.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Estimada ${currentTeacher.name}, estamos revisando las observaciones de ${selectedGrade} Sección ${selectedSection}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>{currentTeacher.phone} (WhatsApp)</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress metric */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-slate-900">
                {sectionStats.completed} de {sectionStats.total} redactadas ({sectionStats.percent}%)
              </div>
              <div className="text-[11px] text-slate-500">
                {sectionStats.pending === 0 ? '✓ Aula completa' : `${sectionStats.pending} estudiantes pendientes`}
              </div>
            </div>
            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
              <div 
                className={`h-2 rounded-full transition-all ${
                  sectionStats.percent === 100 ? 'bg-emerald-600' : 'bg-teal-700'
                }`}
                style={{ width: `${sectionStats.percent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 2. MODE: REVISIÓN CONTINUA DE AULA (COORDINACIÓN) */}
      {viewMode === 'review' && (
        <div className="space-y-4">
          
          {/* Action & Filter Toolbar for Coordinator */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({sectionStats.total})
              </button>
              <button
                onClick={() => setReviewFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reviewFilter === 'completed'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Con Observaciones ({sectionStats.completed})</span>
              </button>
              <button
                onClick={() => setReviewFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reviewFilter === 'pending'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pendientes ({sectionStats.pending})</span>
              </button>
            </div>

            {/* Right Tools: Search & Batch Normalization */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar estudiante o familia..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-700 focus:bg-white"
                />
              </div>

              {/* Botón Mágico: Normalizar Puntuación de la Sección */}
              <button
                onClick={handleBatchFormatClassroom}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Pone mayúscula a las oraciones y asegura punto final reglamentario en toda el aula"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Normalizar Puntuación Aula</span>
              </button>

              {/* Botón Administrador: Carga Masiva CSV */}
              {currentUser?.role === 'administrador' && onOpenBulkObservations && (
                <button
                  onClick={onOpenBulkObservations}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Cargar observaciones en lote desde un archivo CSV o Excel"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carga Masiva (CSV)</span>
                </button>
              )}
            </div>

          </div>

          {/* Editorial Feed of Students */}
          <div className="space-y-4">
            {filteredReviewStudents.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No se encontraron estudiantes con los filtros aplicados en esta aula.
              </div>
            ) : (
              filteredReviewStudents.map((student, idx) => {
                const evalRec = state.evaluations[student.id]?.[currentPeriod];
                const strengths = evalRec?.observations.strengths || '';
                const recommendations = evalRec?.observations.recommendations || '';
                const isComplete = !!(strengths.trim() && recommendations.trim());
                const isSaved = lastSavedStudentId === student.id;

                return (
                  <div 
                    key={student.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
                  >
                    {/* Student Card Top Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{student.fullName}</span>
                            <span className="text-xs font-semibold text-slate-500">
                              ({getStudentFamilyName(student)})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {student.grade} "{student.section}" · {student.age} Años · Sexo: {student.gender || '-'}
                          </div>
                        </div>
                      </div>

                      {/* Right Badges & Actions */}
                      <div className="flex items-center gap-2">
                        {isSaved && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Guardado
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isComplete 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isComplete ? '✓ Completa' : '⚠️ Pendiente'}
                        </span>

                        {/* Direct Printable Bulletin Button */}
                        <button
                          onClick={() => onNavigateToBulletin(student.id)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                          title="Ver en formato oficial de Boletín"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Ver Boletín</span>
                        </button>
                      </div>
                    </div>

                    {/* Dual Observation Editor (Side by Side on desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Box 1: Fortalezas / Cualidades a Destacar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span>Cualidades a Destacar (Fortalezas)</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const scores = state.evaluations[student.id]?.[currentPeriod]?.scores;
                                const matches = getAdaptedPhrasesForStudent(student, currentPeriod, scores, gradeIndicators, allPhrases.filter(p => p.type === 'strength'), adaptPeriodContext);
                                const top = matches.find(m => m.isSuggested) || matches[0];
                                if (top) {
                                  const updated = strengths ? `${strengths.trim()} ${top.adaptedText}` : top.adaptedText;
                                  handleTextChange(student.id, 'strengths', updated);
                                }
                              }}
                              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center gap-0.5 cursor-pointer"
                              title="Sugerir cualidad a destacar basada en indicadores logrados (L)"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Sugerir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = formatTextProperly(strengths);
                                handleTextChange(student.id, 'strengths', formatted);
                              }}
                              className="text-[10px] font-semibold text-teal-800 hover:text-teal-950 px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-0.5 cursor-pointer"
                              title="Pone mayúsculas a las oraciones y punto final"
                            >
                              <Wand2 className="w-2.5 h-2.5" />
                              <span>Estilo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhrasePickerTarget({
                                studentId: student.id,
                                studentName: student.fullName,
                                targetField: 'strength'
                              })}
                              className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-0.5 cursor-pointer"
                              title="Insertar frase desde el Banco MINERD"
                            >
                              <PlusCircle className="w-2.5 h-2.5" />
                              <span>Frase</span>
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          value={strengths}
                          onChange={(e) => handleTextChange(student.id, 'strengths', e.target.value)}
                          placeholder={`Ejemplo: Demuestra gran interés por los cuentos, participa con entusiasmo en juegos grupales y comparte materiales con amabilidad...`}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 leading-relaxed text-slate-800 bg-white placeholder:text-slate-400 resize-y"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Destino: Boletín · Página 4</span>
                          <span>{strengths.length} caracteres</span>
                        </div>
                      </div>

                      {/* Box 2: Recomendaciones / Aspectos a Mejorar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                            <span>Aspectos a Estimular (Recomendaciones Familia)</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const scores = state.evaluations[student.id]?.[currentPeriod]?.scores;
                                const matches = getAdaptedPhrasesForStudent(student, currentPeriod, scores, gradeIndicators, allPhrases.filter(p => p.type === 'recommendation'), adaptPeriodContext);
                                const top = matches.find(m => m.isSuggested) || matches[0];
                                if (top) {
                                  const updated = recommendations ? `${recommendations.trim()} ${top.adaptedText}` : top.adaptedText;
                                  handleTextChange(student.id, 'recommendations', updated);
                                }
                              }}
                              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center gap-0.5 cursor-pointer"
                              title="Sugerir recomendación basada en indicadores en proceso (EP) o iniciados (I)"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Sugerir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = formatTextProperly(recommendations);
                                handleTextChange(student.id, 'recommendations', formatted);
                              }}
                              className="text-[10px] font-semibold text-teal-800 hover:text-teal-950 px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-0.5 cursor-pointer"
                              title="Pone mayúsculas a las oraciones y punto final"
                            >
                              <Wand2 className="w-2.5 h-2.5" />
                              <span>Estilo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhrasePickerTarget({
                                studentId: student.id,
                                studentName: student.fullName,
                                targetField: 'recommendation'
                              })}
                              className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-0.5 cursor-pointer"
                              title="Insertar frase desde el Banco MINERD"
                            >
                              <PlusCircle className="w-2.5 h-2.5" />
                              <span>Frase</span>
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          value={recommendations}
                          onChange={(e) => handleTextChange(student.id, 'recommendations', e.target.value)}
                          placeholder={`Ejemplo: Continuar reforzando en el hogar el seguimiento de instrucciones sencillas y estimular la autonomía al abotonar su ropa...`}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 leading-relaxed text-slate-800 bg-white placeholder:text-slate-400 resize-y"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Destino: Boletín · Página 4</span>
                          <span>{recommendations.length} caracteres</span>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* 3. MODE: FICHA INDIVIDUAL ASISTIDA (1 A 1 CON BANCO DE FRASES) */}
      {viewMode === 'single' && (
        <div className="space-y-6">
          
          {/* Student Selector Row */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Seleccionar Estudiante:</span>
              <select
                value={currentStudent?.id || ''}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 font-semibold text-slate-900 focus:outline-hidden max-w-xs"
              >
                {sectionStudents.map((s, idx) => {
                  const obs = state.evaluations[s.id]?.[currentPeriod]?.observations;
                  const isFilled = !!(obs?.strengths.trim() && obs?.recommendations.trim());
                  return (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.fullName} {isFilled ? '✓' : '(Pendiente)'}
                    </option>
                  );
                })}
              </select>

              <div className="flex items-center gap-1">
                <button
                  disabled={sectionStudents.findIndex(s => s.id === currentStudent?.id) <= 0}
                  onClick={() => {
                    const idx = sectionStudents.findIndex(s => s.id === currentStudent?.id);
                    if (idx > 0) setActiveStudentId(sectionStudents[idx - 1].id);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={sectionStudents.findIndex(s => s.id === currentStudent?.id) >= sectionStudents.length - 1}
                  onClick={() => {
                    const idx = sectionStudents.findIndex(s => s.id === currentStudent?.id);
                    if (idx < sectionStudents.length - 1) setActiveStudentId(sectionStudents[idx + 1].id);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentStudent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplySuggestedDraft()}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title={`Sugerir redacción personalizada para ${studentFirstName} basada en sus indicadores de ${currentPeriod}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Sugerir Observación ({currentPeriod})</span>
                </button>
                <button
                  onClick={() => onNavigateToBulletin(currentStudent.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-800 hover:text-white text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Boletín Oficial</span>
                </button>
              </div>
            )}
          </div>

          {/* Real-time Period Evaluation Banner & Alignment */}
          {currentStudent && studentEvalSummary && (
            <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-amber-50 p-4 rounded-xl border border-teal-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-teal-800 text-white rounded-xl shadow-xs shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Situación Evaluada en {currentPeriod}:
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {studentEvalSummary.totalAchieved} Logrados (L)
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-600" />
                      {studentEvalSummary.totalInProcess} En Proceso (EP)
                    </span>
                    {studentEvalSummary.totalInitiated > 0 && (
                      <span className="text-[11px] font-bold text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-orange-600" />
                        {studentEvalSummary.totalInitiated} Iniciados (I)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {studentEvalSummary.hasEvaluations 
                      ? `Las frases del banco resaltadas con estrella (⭐) se adaptan automáticamente a los logros y aspectos por estimular de ${studentFirstName} en este período.`
                      : `Este estudiante no tiene indicadores calificados en ${currentPeriod}. Califica indicadores en la Matriz para activar sugerencias adaptadas a su situación real.`}
                  </p>
                </div>
              </div>

              {studentEvalSummary.hasEvaluations && (
                <button
                  onClick={() => handleApplySuggestedDraft()}
                  className="shrink-0 px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Autocompletar fortalezas y recomendaciones con las frases más ajustadas a sus indicadores"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Autocompletar Ambos Campos</span>
                </button>
              )}
            </div>
          )}

          {currentStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Text Areas & Attendance */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* Strengths */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Cualidades a Destacar (Fortalezas)
                    </label>
                    <button
                      onClick={() => handleFormatStudentObservations(currentStudent.id)}
                      className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-amber-500" />
                      <span>Corregir Estilo</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={state.evaluations[currentStudent.id]?.[currentPeriod]?.observations.strengths || ''}
                    onChange={(e) => handleTextChange(currentStudent.id, 'strengths', e.target.value)}
                    placeholder={`Ejemplo: ${studentFirstName} demuestra gran entusiasmo en las actividades plásticas...`}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 leading-relaxed text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Destino en boletín: <strong>Cualidades a destacar</strong></span>
                    <span>{(state.evaluations[currentStudent.id]?.[currentPeriod]?.observations.strengths || '').length} caracteres</span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Aspectos a Mejorar / Recomendaciones Familia
                    </label>
                    <button
                      onClick={() => handleFormatStudentObservations(currentStudent.id)}
                      className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-amber-500" />
                      <span>Corregir Estilo</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={state.evaluations[currentStudent.id]?.[currentPeriod]?.observations.recommendations || ''}
                    onChange={(e) => handleTextChange(currentStudent.id, 'recommendations', e.target.value)}
                    placeholder="Ejemplo: Continuar reforzando en casa la paciencia en la espera de turnos..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 leading-relaxed text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Destino en boletín: <strong>Aspectos a estimular</strong></span>
                    <span>{(state.evaluations[currentStudent.id]?.[currentPeriod]?.observations.recommendations || '').length} caracteres</span>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-800" />
                      Asistencia Oficial ({currentPeriod})
                    </h3>
                  </div>

                  {(() => {
                    const att = state.evaluations[currentStudent.id]?.[currentPeriod]?.attendance || {
                      diasLaborados: 76,
                      presentes: 74,
                      ausenciasJustificadas: 2,
                      ausenciasInjustificadas: 0
                    };
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Días Laborados</label>
                          <input
                            type="number"
                            value={att.diasLaborados}
                            onChange={(e) => onUpdateAttendance(currentStudent.id, { ...att, diasLaborados: parseInt(e.target.value) || 0 })}
                            className="w-full text-xs p-2 rounded border border-slate-300 font-semibold tabular-nums text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Presentes</label>
                          <input
                            type="number"
                            value={att.presentes}
                            onChange={(e) => onUpdateAttendance(currentStudent.id, { ...att, presentes: parseInt(e.target.value) || 0 })}
                            className="w-full text-xs p-2 rounded border border-slate-300 font-semibold tabular-nums text-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Ausencias Justif.</label>
                          <input
                            type="number"
                            value={att.ausenciasJustificadas}
                            onChange={(e) => onUpdateAttendance(currentStudent.id, { ...att, ausenciasJustificadas: parseInt(e.target.value) || 0 })}
                            className="w-full text-xs p-2 rounded border border-slate-300 font-semibold tabular-nums text-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Ausencias Injustif.</label>
                          <input
                            type="number"
                            value={att.ausenciasInjustificadas}
                            onChange={(e) => onUpdateAttendance(currentStudent.id, { ...att, ausenciasInjustificadas: parseInt(e.target.value) || 0 })}
                            className="w-full text-xs p-2 rounded border border-slate-300 font-semibold tabular-nums text-rose-700"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Right Column: Suggested Phrase Bank */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Banco de Frases Prediseñadas MINERD
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Organizadas por nivel, competencia y tipo de observación.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreatingPhrase(!isCreatingPhrase)}
                    className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded border border-teal-200 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isCreatingPhrase ? 'Ver Frases' : 'Añadir Frase'}</span>
                  </button>
                </div>

                {/* Phrase Search & Filter */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por palabra clave (ej. lectura, respeto, tijeras)..."
                      value={phraseSearchQuery}
                      onChange={(e) => setPhraseSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-700 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      <span className="text-slate-400 font-semibold pr-1">Tipo:</span>
                      <button
                        onClick={() => setPhraseTypeFilter('all')}
                        className={`px-2.5 py-1 rounded font-medium ${
                          phraseTypeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setPhraseTypeFilter('strength')}
                        className={`px-2.5 py-1 rounded font-medium ${
                          phraseTypeFilter === 'strength' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Fortalezas
                      </button>
                      <button
                        onClick={() => setPhraseTypeFilter('recommendation')}
                        className={`px-2.5 py-1 rounded font-medium ${
                          phraseTypeFilter === 'recommendation' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Recomendaciones
                      </button>
                    </div>

                    <button
                      onClick={() => setOnlySuggestedFilter(!onlySuggestedFilter)}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-xs cursor-pointer ${
                        onlySuggestedFilter
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Muestra solo frases pedagógicas ajustadas a los indicadores evaluados de este estudiante"
                    >
                      <Star className={`w-3.5 h-3.5 ${onlySuggestedFilter ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
                      <span>Sugeridas ({suggestedCount})</span>
                    </button>
                  </div>

                  {/* Context Adaptation Toggle */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-1 border-t border-slate-100">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={adaptPeriodContext}
                        onChange={(e) => setAdaptPeriodContext(e.target.checked)}
                        className="rounded text-teal-700 focus:ring-teal-600 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-700">
                        Adaptar conector temporal a <strong>{currentPeriod}</strong>
                      </span>
                    </label>
                    <span className="text-slate-400">
                      {filteredMatches.length} frases
                    </span>
                  </div>
                </div>

                {/* Phrases list with Highlighted Pedagogical Matches */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredMatches.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      {onlySuggestedFilter
                        ? `No hay frases sugeridas para ${studentFirstName} con los filtros actuales. Califica más indicadores en la Matriz para generar más sugerencias.`
                        : 'No se encontraron frases con los filtros seleccionados.'}
                    </div>
                  ) : (
                    filteredMatches.slice(0, 18).map((match) => {
                      const { phrase, isSuggested, matchReason, adaptedText } = match;
                      const isStrength = phrase.type === 'strength';

                      return (
                        <div
                          key={phrase.id}
                          className={`p-3.5 rounded-xl border transition-all space-y-2 group shadow-2xs ${
                            isSuggested
                              ? 'border-amber-300 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 ring-1 ring-amber-300/60 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] flex-wrap gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold px-2 py-0.5 rounded-md ${
                                isStrength ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {isStrength ? 'Fortaleza' : 'Recomendación'}
                              </span>

                              {isSuggested && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                  <span>Sugerida ({currentPeriod})</span>
                                </span>
                              )}
                            </div>

                            <span className="text-slate-400 text-[10px]">{phrase.domainName || phrase.domainId}</span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed font-normal">
                            "{adaptedText}"
                          </p>

                          {/* Pedagogical Justification Tag */}
                          {matchReason && (
                            <div className="text-[10px] text-amber-900 bg-amber-50/90 px-2.5 py-1 rounded-md border border-amber-200/80 flex items-center gap-1.5 font-medium">
                              <Target className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="leading-tight">{matchReason}</span>
                            </div>
                          )}

                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">
                              {phrase.tags?.slice(0, 2).map(t => `#${t}`).join(' ')}
                            </span>
                            <button
                              onClick={() => handleDirectInsertSingle(match)}
                              className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                                isStrength 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
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
          )}

        </div>
      )}

      {/* 4. QUICK PHRASE PICKER POPUP MODAL (FOR CONTINUOUS REVIEW MODE) */}
      {phrasePickerTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 text-white rounded-xl shadow-xs ${
                  phrasePickerTarget.targetField === 'strength' ? 'bg-emerald-600' : 'bg-amber-600'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Insertar Frase MINERD para {phrasePickerTarget.studentName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Destino: {phrasePickerTarget.targetField === 'strength' ? 'Cualidades a Destacar (Fortalezas)' : 'Aspectos a Estimular (Recomendaciones)'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPhrasePickerTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phrase List */}
            {(() => {
              const targetStudent = sectionStudents.find(s => s.id === phrasePickerTarget.studentId);
              const targetScores = targetStudent ? state.evaluations[targetStudent.id]?.[currentPeriod]?.scores : undefined;
              const targetMatches = targetStudent 
                ? getAdaptedPhrasesForStudent(
                    targetStudent,
                    currentPeriod,
                    targetScores,
                    gradeIndicators,
                    allPhrases.filter(p => p.type === phrasePickerTarget.targetField),
                    adaptPeriodContext
                  )
                : [];

              const suggestedTargetCount = targetMatches.filter(m => m.isSuggested).length;

              return (
                <div className="p-6 overflow-y-auto space-y-3 flex-grow text-xs">
                  {suggestedTargetCount > 0 && (
                    <div className="mb-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                      <span>
                        Se han resaltado <strong>{suggestedTargetCount} frases</strong> arriba porque coinciden con los indicadores evaluados de este estudiante en {currentPeriod}.
                      </span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {targetMatches.map((match) => {
                      const { phrase, isSuggested, matchReason, adaptedText } = match;
                      return (
                        <div 
                          key={phrase.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                            isSuggested 
                              ? 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-200 shadow-2xs' 
                              : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            {isSuggested ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                <span>Sugerida según evaluación ({currentPeriod})</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">{phrase.domainName || phrase.domainId}</span>
                            )}
                            <span className="text-slate-400 font-medium">{phrase.grade}</span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed font-normal">
                            "{adaptedText}"
                          </p>

                          {matchReason && (
                            <div className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200/60 flex items-center gap-1 font-medium w-fit">
                              <Target className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{matchReason}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-end pt-1">
                            <button
                              onClick={() => handleInsertFromPicker(match)}
                              className={`px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer ${
                                phrasePickerTarget.targetField === 'strength'
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-amber-600 hover:bg-amber-700'
                              }`}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Insertar Frase</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setPhrasePickerTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
