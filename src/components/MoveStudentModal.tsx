import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  Student, 
  GradeLevel, 
  EvaluationPeriod,
  ScoreValue 
} from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';
import { 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Check, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  School
} from 'lucide-react';

interface MoveStudentModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  initialStudentId?: string;
  onMoveStudent: (
    studentId: string,
    targetGrade: GradeLevel,
    targetSection: string,
    newAge?: number,
    options?: { navigateToDestination?: boolean }
  ) => void;
  onBatchMoveStudents?: (
    studentIds: string[],
    targetGrade: GradeLevel,
    targetSection: string,
    options?: { navigateToDestination?: boolean }
  ) => void;
}

export const MoveStudentModal: React.FC<MoveStudentModalProps> = ({
  state,
  isOpen,
  onClose,
  initialStudentId,
  onMoveStudent,
  onBatchMoveStudents
}) => {
  if (!isOpen) return null;

  // Active mode: 'single' (one student) or 'batch' (multiple students from section)
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single student mode state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (state.students.length > 0 ? state.students[0].id : '')
  );
  const [studentSearch, setStudentSearch] = useState('');

  // Selected student object
  const currentStudent = useMemo(() => {
    return state.students.find(s => s.id === selectedStudentId) || null;
  }, [state.students, selectedStudentId]);

  // Target Destination
  const [targetGrade, setTargetGrade] = useState<GradeLevel>(
    currentStudent ? currentStudent.grade : state.selectedGrade
  );
  const [targetSection, setTargetSection] = useState<string>(
    currentStudent ? currentStudent.section : state.selectedSection
  );
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [customSectionInput, setCustomSectionInput] = useState('');

  // Age adjustment when grade changes
  const [adjustAge, setAdjustAge] = useState(true);
  const [navigateToDestination, setNavigateToDestination] = useState(true);

  // Batch mode state
  const [batchSourceGrade, setBatchSourceGrade] = useState<GradeLevel>(state.selectedGrade);
  const [batchSourceSection, setBatchSourceSection] = useState<string>(state.selectedSection);
  const [batchTargetGrade, setBatchTargetGrade] = useState<GradeLevel>(state.selectedGrade);
  const [batchTargetSection, setBatchTargetSection] = useState<string>('B');
  const [selectedBatchStudentIds, setSelectedBatchStudentIds] = useState<string[]>([]);

  // Update target destination defaults when student changes
  React.useEffect(() => {
    if (currentStudent) {
      setTargetGrade(currentStudent.grade);
      setTargetSection(currentStudent.section);
    }
  }, [selectedStudentId]);

  // Available sections for the target grade
  const availableTargetSections = useMemo(() => {
    const sections = Array.from(
      new Set(state.students.filter(s => s.grade === targetGrade).map(s => s.section))
    ).sort();
    if (!sections.includes('A')) sections.push('A');
    if (!sections.includes('B')) sections.push('B');
    if (!sections.includes('C')) sections.push('C');
    return sections.sort();
  }, [state.students, targetGrade]);

  // Filtered student list for single mode search
  const filteredStudentsList = useMemo(() => {
    return state.students.filter(s => {
      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
      );
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, studentSearch]);

  // Students in batch source section
  const batchSourceStudents = useMemo(() => {
    return state.students
      .filter(s => s.grade === batchSourceGrade && s.section === batchSourceSection)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, batchSourceGrade, batchSourceSection]);

  // Recommended standard age for target grade
  const standardAgeForTargetGrade = useMemo(() => {
    switch (targetGrade) {
      case 'Prekínder': return 3;
      case 'Kínder': return 4;
      case 'Preprimario': return 5;
      case 'Párvulo I': return 1;
      case 'Párvulo II': return 2;
      case 'Párvulo III': return 3;
      default: return 5;
    }
  }, [targetGrade]);

  // Summary of existing evaluations for the selected student
  const studentEvalSummary = useMemo(() => {
    if (!currentStudent) return null;
    const rec = state.evaluations[currentStudent.id];
    if (!rec) return null;

    const periods: EvaluationPeriod[] = ['P1', 'P2', 'P3'];
    const summary = periods.map(p => {
      const periodData = rec[p];
      const scoresCount = periodData ? Object.values(periodData.scores || {}).filter(v => v !== '').length : 0;
      const hasStrengths = !!periodData?.observations?.strengths?.trim();
      const hasRecommendations = !!periodData?.observations?.recommendations?.trim();
      const attendanceRecorded = periodData?.attendance?.diasLaborados > 0;
      return {
        period: p,
        scoresCount,
        hasObservations: hasStrengths || hasRecommendations,
        attendanceRecorded,
        diasLaborados: periodData?.attendance?.diasLaborados || 0
      };
    });

    const totalScores = summary.reduce((acc, curr) => acc + curr.scoresCount, 0);
    const hasAnyObservations = summary.some(s => s.hasObservations);

    return {
      periods: summary,
      totalScores,
      hasAnyObservations
    };
  }, [currentStudent, state.evaluations]);

  // Final target section value
  const finalSection = isCustomSection ? customSectionInput.trim().toUpperCase() : targetSection;

  // Single Move Submit
  const handleSingleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (!finalSection) {
      alert('Por favor especifique la sección de destino.');
      return;
    }

    if (currentStudent.grade === targetGrade && currentStudent.section === finalSection) {
      alert('El estudiante ya se encuentra en este grado y sección. Seleccione un grado o sección diferente.');
      return;
    }

    const isGradeChange = currentStudent.grade !== targetGrade;
    const newAge = (isGradeChange && adjustAge) ? standardAgeForTargetGrade : currentStudent.age;

    const confirmMessage = isGradeChange
      ? `¿Confirmar traslado de ${currentStudent.fullName}?\n\n• Origen: ${currentStudent.grade} "${currentStudent.section}"\n• Destino: ${targetGrade} "${finalSection}"\n• Edad: ${newAge} Años\n\nSe conservarán 100% sus observaciones cualitativas, asistencia y se adaptarán sus calificaciones a los indicadores de ${targetGrade}.`
      : `¿Confirmar traslado de ${currentStudent.fullName}?\n\n• Origen: Sección "${currentStudent.section}"\n• Destino: Sección "${finalSection}" (${targetGrade})\n\nTodas sus calificaciones, observaciones y asistencias permanecerán intactas.`;

    if (!confirm(confirmMessage)) return;

    onMoveStudent(
      currentStudent.id,
      targetGrade,
      finalSection,
      newAge,
      { navigateToDestination }
    );

    alert(`¡Estudiante ${currentStudent.fullName} trasladado exitosamente a ${targetGrade} "${finalSection}"!`);
    onClose();
  };

  // Batch Move Submit
  const handleBatchMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatchStudentIds.length === 0) {
      alert('Por favor seleccione al menos un estudiante para trasladar.');
      return;
    }

    const finalBatchSection = batchTargetSection.trim().toUpperCase();
    if (!finalBatchSection) {
      alert('Por favor especifique la sección destino.');
      return;
    }

    if (batchSourceGrade === batchTargetGrade && batchSourceSection === finalBatchSection) {
      alert('El grado y sección destino deben ser diferentes al aula de origen.');
      return;
    }

    if (!confirm(`¿Confirmar traslado masivo de ${selectedBatchStudentIds.length} estudiantes desde ${batchSourceGrade} "${batchSourceSection}" hacia ${batchTargetGrade} "${finalBatchSection}"? Sus evaluaciones y observaciones serán trasladadas y conservadas sin pérdidas.`)) {
      return;
    }

    if (onBatchMoveStudents) {
      onBatchMoveStudents(
        selectedBatchStudentIds,
        batchTargetGrade,
        finalBatchSection,
        { navigateToDestination }
      );
    } else {
      // Fallback sequential
      selectedBatchStudentIds.forEach(id => {
        onMoveStudent(id, batchTargetGrade, finalBatchSection, undefined, { navigateToDestination: false });
      });
    }

    alert(`¡${selectedBatchStudentIds.length} estudiantes trasladados exitosamente a ${batchTargetGrade} "${finalBatchSection}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Mover Estudiantes · Cambio de Sección o Curso
              </h2>
              <p className="text-xs text-slate-500">
                Traslado oficial seguro con conservación íntegra de evaluaciones, observaciones y asistencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Individual vs Masivo */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              mode === 'single'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Traslado Individual (1 Estudiante)</span>
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              mode === 'batch'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Traslado Masivo por Aula</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 flex-1">
          
          {/* Integrity Guarantee Banner */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-950 block">
                Garantía de Integridad Pedagógica MINERD:
              </span>
              <p className="text-emerald-900 text-[11px] leading-relaxed">
                Al mover un estudiante, <strong>no se pierde ninguna información</strong>: sus observaciones cualitativas (fortalezas y sugerencias familiares de P1, P2 y P3) y su registro de asistencia se transfieren exactamente como fueron redactados. Si se traslada a otro curso, sus calificaciones se adaptan a los indicadores oficiales del grado destino por equivalencia curricular.
              </p>
            </div>
          </div>

          {/* MODE 1: SINGLE STUDENT MOVE */}
          {mode === 'single' && (
            <form onSubmit={handleSingleMoveSubmit} className="space-y-5">
              
              {/* 1. Student Selector */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  1. Seleccione el Estudiante a Trasladar:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrar por nombre del estudiante..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="p-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-600 flex-1"
                  >
                    {filteredStudentsList.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.grade} - Sec. {st.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Current Student Details Card */}
              {currentStudent && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {currentStudent.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {currentStudent.gender === 'F' ? 'Niña' : 'Niño'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Aula actual: <strong>{currentStudent.grade}</strong> (Sección {currentStudent.section}) · Edad: {currentStudent.age} Años
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">ID: {currentStudent.id}</span>
                      <span className="text-[11px] text-slate-600 font-medium">Familia: {currentStudent.parentName || 'Familia'}</span>
                    </div>
                  </div>

                  {/* Summary of evaluations to be moved */}
                  {studentEvalSummary && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Contenido y evaluaciones que se trasladarán:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {studentEvalSummary.periods.map(p => (
                          <div key={p.period} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px] text-slate-800">
                              <span>Período {p.period}</span>
                              <span className="text-indigo-600">{p.scoresCount} notas</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className={`w-3 h-3 ${p.hasObservations ? 'text-emerald-500' : 'text-slate-300'}`} />
                                {p.hasObservations ? 'Observaciones redactadas' : 'Sin observaciones'}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className={`w-3 h-3 ${p.attendanceRecorded ? 'text-emerald-500' : 'text-slate-300'}`} />
                                {p.attendanceRecorded ? `Asistencia registrada (${p.diasLaborados}d)` : 'Asistencia estándar'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Destination Classroom Selector */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-200/80 rounded-xl space-y-4">
                <h3 className="font-bold text-indigo-950 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span>2. Definir Aula de Destino:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Grade */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Curso / Grado Destino:
                    </label>
                    <select
                      value={targetGrade}
                      onChange={(e) => {
                        const newG = e.target.value as GradeLevel;
                        setTargetGrade(newG);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="Prekínder">Prekínder (3 Años)</option>
                      <option value="Kínder">Kínder (4 Años)</option>
                      <option value="Preprimario">Preprimario (5 Años)</option>
                      <option value="Párvulo I">Párvulo I (1 Año)</option>
                      <option value="Párvulo II">Párvulo II (2 Años)</option>
                      <option value="Párvulo III">Párvulo III (3 Años)</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Currículo oficial con {getIndicatorsByGrade(targetGrade).length} indicadores
                    </span>
                  </div>

                  {/* Target Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Sección Destino:</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomSection(!isCustomSection)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {isCustomSection ? 'Elegir existente' : '+ Otra sección'}
                      </button>
                    </div>

                    {isCustomSection ? (
                      <input
                        type="text"
                        placeholder="Ej. C, D, Tarde..."
                        value={customSectionInput}
                        onChange={(e) => setCustomSectionInput(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold uppercase focus:outline-hidden focus:border-indigo-600"
                      />
                    ) : (
                      <select
                        value={targetSection}
                        onChange={(e) => setTargetSection(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      >
                        {availableTargetSections.map(sec => (
                          <option key={sec} value={sec}>
                            Sección {sec}
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Docente asignada: {state.teachers.find(t => t.grade === targetGrade && t.section === finalSection)?.name || 'Sin docente asignada aún'}
                    </span>
                  </div>
                </div>

                {/* Optional Grade Adjustment Options */}
                {currentStudent && currentStudent.grade !== targetGrade && (
                  <div className="pt-2 border-t border-indigo-200/60 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={adjustAge}
                        onChange={(e) => setAdjustAge(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span>
                        Ajustar edad al estándar de {targetGrade} ({standardAgeForTargetGrade} Años)
                      </span>
                    </label>
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ⚠️ <strong>Cambio de Curso detectado:</strong> El estudiante pasará de {currentStudent.grade} a {targetGrade}. Se conservarán todas sus observaciones cualitativas, su récord de asistencia, y sus calificaciones se mapearán a los indicadores oficiales de {targetGrade}.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-indigo-200/60">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={navigateToDestination}
                      onChange={(e) => setNavigateToDestination(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span>
                      Cambiar la vista activa de la aplicación al aula destino ({targetGrade} "{finalSection}") tras el traslado
                    </span>
                  </label>
                </div>

              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!currentStudent}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Confirmar Traslado de Estudiante</span>
                </button>
              </div>

            </form>
          )}

          {/* MODE 2: BATCH MOVE */}
          {mode === 'batch' && (
            <form onSubmit={handleBatchMoveSubmit} className="space-y-5">
              
              {/* Batch Classroom Origen & Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Origen */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-slate-600" />
                    <span>Aula de Origen</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Curso:</label>
                      <select
                        value={batchSourceGrade}
                        onChange={(e) => {
                          setBatchSourceGrade(e.target.value as GradeLevel);
                          setSelectedBatchStudentIds([]);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                      >
                        <option value="Prekínder">Prekínder</option>
                        <option value="Kínder">Kínder</option>
                        <option value="Preprimario">Preprimario</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sección:</label>
                      <select
                        value={batchSourceSection}
                        onChange={(e) => {
                          setBatchSourceSection(e.target.value);
                          setSelectedBatchStudentIds([]);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                      >
                        {Array.from(new Set(state.students.filter(s => s.grade === batchSourceGrade).map(s => s.section))).sort().map(sec => (
                          <option key={sec} value={sec}>Sección {sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {batchSourceStudents.length} estudiantes inscritos en esta aula.
                  </p>
                </div>

                {/* Destino */}
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span>Aula de Destino</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-900 mb-1">Curso Destino:</label>
                      <select
                        value={batchTargetGrade}
                        onChange={(e) => setBatchTargetGrade(e.target.value as GradeLevel)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                      >
                        <option value="Prekínder">Prekínder</option>
                        <option value="Kínder">Kínder</option>
                        <option value="Preprimario">Preprimario</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-900 mb-1">Sección Destino:</label>
                      <input
                        type="text"
                        value={batchTargetSection}
                        onChange={(e) => setBatchTargetSection(e.target.value.toUpperCase())}
                        placeholder="Ej. B"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold uppercase"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Docente: {state.teachers.find(t => t.grade === batchTargetGrade && t.section === batchTargetSection)?.name || 'Sin asignar'}
                  </p>
                </div>

              </div>

              {/* Student Multi-Selection Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden space-y-0">
                <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      Seleccionar estudiantes a mover ({selectedBatchStudentIds.length} seleccionados):
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBatchStudentIds(batchSourceStudents.map(s => s.id))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-white border border-slate-300 rounded-lg hover:bg-indigo-50"
                    >
                      Seleccionar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBatchStudentIds([])}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Deseleccionar
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {batchSourceStudents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No hay estudiantes matriculados en {batchSourceGrade} "{batchSourceSection}".
                    </div>
                  ) : (
                    batchSourceStudents.map((st, idx) => {
                      const isChecked = selectedBatchStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer ${
                            isChecked ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBatchStudentIds(prev => [...prev, st.id]);
                                } else {
                                  setSelectedBatchStudentIds(prev => prev.filter(id => id !== st.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                            />
                            <span className="font-semibold text-slate-900">
                              {idx + 1}. {st.fullName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {st.age} Años · Familia: {st.parentName || '-'}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selectedBatchStudentIds.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Trasladar {selectedBatchStudentIds.length} Estudiantes</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
