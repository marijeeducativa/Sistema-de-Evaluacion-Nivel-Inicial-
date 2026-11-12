import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  GradeLevel, 
  EvaluationPeriod, 
  Teacher 
} from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  QrCode, 
  Share2, 
  ExternalLink,
  MessageCircle,
  X
} from 'lucide-react';

interface SectionPortalLandingProps {
  state: AppState;
  onEnterSection: (grade: GradeLevel, section: string) => void;
  onPrintSectionBulletins: (grade: GradeLevel, section: string) => void;
  onExportSectionExcel: (grade: GradeLevel, section: string) => void;
  onOpenObservations: (grade: GradeLevel, section: string) => void;
}

export const SectionPortalLanding: React.FC<SectionPortalLandingProps> = ({
  state,
  onEnterSection,
  onPrintSectionBulletins,
  onExportSectionExcel,
  onOpenObservations
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherForShare, setSelectedTeacherForShare] = useState<Teacher | null>(null);

  const currentPeriod = state.currentPeriod;

  // Compute sections data based on state
  const sectionsData = useMemo(() => {
    // Collect all grade/section combinations
    const result: any[] = [];
    
    // Maintain standard order: Prekínder A, B -> Kínder A, B, C -> Preprimario A, B, C
    const gradeOrder: GradeLevel[] = ['Prekínder', 'Kínder', 'Preprimario'];
    const sectionOrder = ['A', 'B', 'C'];

    gradeOrder.forEach(grade => {
      const indicators = getIndicatorsByGrade(grade);
      const totalIndicators = indicators.length;

      sectionOrder.forEach(sec => {
        const students = state.students.filter(s => s.grade === grade && s.section === sec);
        if (students.length === 0) return;

        const teacher = state.teachers.find(t => t.grade === grade && t.section === sec);

        // Count evaluations
        let fullyEvaluatedStudents = 0;
        let totalExpectedEvals = students.length * totalIndicators;
        let filledEvals = 0;

        students.forEach(st => {
          const evalRec = state.evaluations[st.id]?.[currentPeriod];
          if (!evalRec) return;
          const scores = evalRec.scores || {};

          let studentFilled = 0;
          indicators.forEach(ind => {
            if (scores[ind.id]) {
              filledEvals++;
              studentFilled++;
            }
          });

          // Check if student has all indicators evaluated
          if (studentFilled === totalIndicators && evalRec.observations.strengths.trim() && evalRec.observations.recommendations.trim()) {
            fullyEvaluatedStudents++;
          }
        });

        const progressPercent = totalExpectedEvals > 0 
          ? Math.round((filledEvals / totalExpectedEvals) * 100) 
          : 0;

        const pendingStudents = students.length - fullyEvaluatedStudents;

        result.push({
          grade,
          section: sec,
          teacher,
          teacherName: teacher?.name || 'Docente Titular Asignada',
          studentsCount: students.length,
          evaluatedCount: fullyEvaluatedStudents,
          pendingStudents,
          progressPercent,
          totalIndicators,
          isComplete: pendingStudents === 0 && students.length > 0
        });
      });
    });

    return result;
  }, [state.students, state.evaluations, state.teachers, currentPeriod]);

  // Filter sections by search query (teacher name, grade, section)
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sectionsData;
    const q = searchQuery.toLowerCase();
    return sectionsData.filter(s => 
      s.teacherName.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      `sección ${s.section}`.toLowerCase().includes(q) ||
      s.section.toLowerCase() === q
    );
  }, [sectionsData, searchQuery]);

  // WhatsApp share link generator
  const getWhatsAppLink = (teacher: Teacher) => {
    const text = `¡Hola ${teacher.name}! Puedes acceder directamente a registrar las evaluaciones de tu sección ${teacher.grade} Sección ${teacher.section} (Período ${currentPeriod}) en el sistema MINERD de Evaluación Inicial.`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header of Section Portal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Selecciona tu Aula para Entrar a Evaluar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Al hacer clic en tu sección, entrarás directamente a tu listado sin ver ni modificar el trabajo de otras docentes.
          </p>
        </div>

        {/* Search input matching image.png */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por maestra o grado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid of Classroom Cards matching image.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((item) => {
          const isComplete = item.isComplete;
          return (
            <div 
              key={`${item.grade}-${item.section}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Badge Pills */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {item.grade}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    Sección "{item.section}"
                  </span>
                </div>

                {/* Teacher Name */}
                <div className="mt-3">
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {item.teacherName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Docente Titular Asignada
                  </p>
                </div>

                {/* Progress bar section */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Progreso de la Sección</span>
                    <span className="font-black text-slate-900 text-sm tabular-nums">
                      {item.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isComplete 
                          ? 'bg-emerald-500' 
                          : item.progressPercent > 0 
                          ? 'bg-blue-600' 
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{item.evaluatedCount} de {item.studentsCount} completados</span>
                    <span className="font-medium text-slate-700">{item.studentsCount} estudiantes</span>
                  </div>
                </div>

                {/* Status Box */}
                <div className="mt-3.5">
                  {isComplete ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Sección 100% al día! Sin pendientes.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Faltan <strong>{item.pendingStudents} estudiantes</strong> por completar indicadores.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Main Blue Button */}
                <button
                  onClick={() => onEnterSection(item.grade, item.section)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Entrar a Evaluar Mi Sección</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onPrintSectionBulletins(item.grade, item.section)}
                    title="Imprimir o descargar boletines en PDF del curso completo"
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">PDF Boletines</span>
                  </button>

                  <button
                    onClick={() => onExportSectionExcel(item.grade, item.section)}
                    title="Descargar sábana de notas en Excel"
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Sábana Excel</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredSections.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          No se encontraron aulas con el término "{searchQuery}".
        </div>
      )}

      {/* WhatsApp / Access Share Modal */}
      {selectedTeacherForShare && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Enviar Acceso a Docente</span>
              </h3>
              <button 
                onClick={() => setSelectedTeacherForShare(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Comparte el enlace directo con <strong>{selectedTeacherForShare.name}</strong> para que evalúe a los niños de <strong>{selectedTeacherForShare.grade} Sección {selectedTeacherForShare.section}</strong>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono break-all text-slate-700">
              {window.location.origin}?grado={encodeURIComponent(selectedTeacherForShare.grade)}&sec={selectedTeacherForShare.section}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTeacherForShare(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cerrar
              </button>
              <a
                href={getWhatsAppLink(selectedTeacherForShare)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
