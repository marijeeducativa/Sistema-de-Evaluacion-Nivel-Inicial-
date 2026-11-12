import React, { useMemo } from 'react';
import { 
  AppState, 
  GradeLevel, 
  EvaluationPeriod 
} from '../types';
import { getIndicatorsByGrade, DOMAINS } from '../data/minerdCurriculum';
import { 
  Printer, 
  Building, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Compass, 
  Puzzle, 
  BookMarked,
  Microscope,
  Palette
} from 'lucide-react';

interface PedagogicalReportProps {
  state: AppState;
}

export const PedagogicalReport: React.FC<PedagogicalReportProps> = ({ state }) => {
  const { selectedGrade, selectedSection, currentPeriod } = state;

  const sectionStudents = useMemo(() => {
    return state.students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [state.students, selectedGrade, selectedSection]);

  const indicators = useMemo(() => {
    return getIndicatorsByGrade(selectedGrade);
  }, [selectedGrade]);

  const teacher = useMemo(() => {
    return state.teachers.find(t => t.grade === selectedGrade && t.section === selectedSection);
  }, [state.teachers, selectedGrade, selectedSection]);

  // Aggregate stats for this section
  const stats = useMemo(() => {
    let totalL = 0;
    let totalEP = 0;
    let totalI = 0;
    let totalScored = 0;

    // Per indicator stats to identify lowest scoring indicators
    const indicatorCounts: Record<string, { L: number; EP: number; I: number; total: number }> = {};
    indicators.forEach(ind => {
      indicatorCounts[ind.id] = { L: 0, EP: 0, I: 0, total: 0 };
    });

    sectionStudents.forEach(st => {
      const scores = state.evaluations[st.id]?.[currentPeriod]?.scores || {};
      indicators.forEach(ind => {
        const val = scores[ind.id];
        if (val) {
          totalScored++;
          indicatorCounts[ind.id].total++;
          if (val === 'L') {
            totalL++;
            indicatorCounts[ind.id].L++;
          } else if (val === 'EP') {
            totalEP++;
            indicatorCounts[ind.id].EP++;
          } else if (val === 'I') {
            totalI++;
            indicatorCounts[ind.id].I++;
          }
        }
      });
    });

    const percentL = totalScored > 0 ? Math.round((totalL / totalScored) * 100) : 0;
    const percentEP = totalScored > 0 ? Math.round((totalEP / totalScored) * 100) : 0;
    const percentI = totalScored > 0 ? Math.round((totalI / totalScored) * 100) : 0;

    // Lowest indicators (highest proportion of 'I' + 'EP')
    const sortedIndicators = indicators.map(ind => {
      const counts = indicatorCounts[ind.id];
      const difficulty = counts.total > 0 ? Math.round(((counts.I * 1.5 + counts.EP) / counts.total) * 100) : 0;
      return {
        ...ind,
        counts,
        difficulty
      };
    }).sort((a, b) => b.difficulty - a.difficulty);

    return {
      totalStudents: sectionStudents.length,
      totalScored,
      percentL,
      percentEP,
      percentI,
      topNeedsIndicators: sortedIndicators.slice(0, 5)
    };
  }, [sectionStudents, indicators, state.evaluations, currentPeriod]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* On-screen Print Trigger */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Informe Técnico de Abordaje Pedagógico
          </h2>
          <p className="text-xs text-slate-500">
            Documento técnico oficial para coordinaciones pedagógicas y supervisión distrital del Nivel Inicial.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Informe Técnico</span>
        </button>
      </div>

      {/* Physical Report Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-lg text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Gobierno de la República Dominicana · Ministerio de Educación (MINERD)
          </p>
          <p className="text-[10px] font-semibold text-slate-600 uppercase">
            Viceministerio de Servicios Técnicos y Pedagógicos · Dirección General de Educación Inicial
          </p>
          <h1 className="text-xl font-black uppercase text-teal-900 tracking-tight pt-1">
            Informe Técnico de Abordaje Pedagógico y Balance Periódico
          </h1>
          <p className="text-xs font-semibold text-slate-800">
            Corte Evaluativo: Período {currentPeriod} · Año Escolar {state.schoolInfo.academicYear}
          </p>
        </div>

        {/* School & Section Context Data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="block text-slate-500 font-medium">Centro Educativo:</span>
            <span className="font-bold text-slate-900">{state.schoolInfo.name}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-medium">Código / Distrito:</span>
            <span className="font-bold text-slate-900">{state.schoolInfo.code} · {state.schoolInfo.district}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-medium">Grado y Sección:</span>
            <span className="font-bold text-slate-900">{selectedGrade} · Sección {selectedSection}</span>
          </div>
          <div>
            <span className="block text-slate-500 font-medium">Docente Titular:</span>
            <span className="font-bold text-slate-900">{teacher?.name || 'No Asignado'}</span>
          </div>
        </div>

        {/* Section 1: Quantitative Balance */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-300 pb-1">
            1. Balance Cuantitativo del Rendimiento Grupal
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="block text-slate-500 text-[11px]">Matrícula Activa</span>
              <span className="text-xl font-black text-slate-900">{stats.totalStudents}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <span className="block text-emerald-800 text-[11px] font-semibold">Logrado (L)</span>
              <span className="text-xl font-black text-emerald-700">{stats.percentL}%</span>
            </div>
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <span className="block text-amber-800 text-[11px] font-semibold">En Proceso (EP)</span>
              <span className="text-xl font-black text-amber-700">{stats.percentEP}%</span>
            </div>
            <div className="p-3 bg-rose-50 rounded border border-rose-200">
              <span className="block text-rose-800 text-[11px] font-semibold">Iniciado (I)</span>
              <span className="text-xl font-black text-rose-700">{stats.percentI}%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Priority Indicators Requiring Strengthening */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-300 pb-1">
            2. Indicadores Curriculares con Mayor Oportunidad de Mejora
          </h3>
          <div className="space-y-2 text-xs">
            {stats.topNeedsIndicators.map((ind, idx) => (
              <div key={ind.id} className="p-2.5 rounded border border-slate-200 bg-white flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] border border-teal-200">
                      {ind.code}
                    </span>
                    <span className="font-semibold text-slate-800">{ind.shortText}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {ind.text}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {ind.counts.I} en 'I' · {ind.counts.EP} en 'EP'
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Learning Corners Plan (Rincones de Aprendizaje) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-300 pb-1">
            3. Estrategias Didácticas y Rincones de Aprendizaje Sugeridos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Puzzle className="w-4 h-4 text-teal-700" />
                <span>Rincón de Construcción y Pensamiento Lógico</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Utilizar bloques de madera, cajas encajables y conteo de piezas para reforzar secuencias numéricas, conceptos de tamaño/distancia y resolución colaborativa de problemas espaciales.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <BookMarked className="w-4 h-4 text-teal-700" />
                <span>Rincón de Dramatización y Biblioteca de Aula</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Lectura compartida diaria con libros ilustrados grandes, títeres de mano y narración de historias para estimular la expresión oral fluida, el respeto a turnos de palabra y el reconocimiento del nombre.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Palette className="w-4 h-4 text-teal-700" />
                <span>Rincón de Expresión Plástica y Arte</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Modelado diario con plastilina, rasgado, pintura con los dedos y combinación de colores primarios para consolidar la prensión visomotora y la autonomía emocional.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Microscope className="w-4 h-4 text-teal-700" />
                <span>Rincón de Ciencias y Descubrimiento</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Exploración con lupas seguras, clasificación de hojas secas, mezclas con agua y germinación de semillas para fomentar la curiosidad científica y el cuidado del medio ambiente escolar.
              </p>
            </div>

          </div>
        </div>

        {/* Section 4: Pedagogical Adjustments & Family Partnership */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-300 pb-1">
            4. Articulación Escuela - Familia y Ajustes Curriculares
          </h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
            <li>Socializar con las familias los resultados de {currentPeriod} entregando las sugerencias concretas de acompañamiento en el hogar.</li>
            <li>Implementar reuniones quincenales de seguimiento para los infantes que se encuentran en el estatus "Iniciado (I)".</li>
            <li>Monitorear la asistencia escolar regular para prevenir ausencias reiteradas que afecten la consolidación de rutinas.</li>
          </ul>
        </div>

        {/* Section 5: Official Signatures */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
            <p className="font-bold text-slate-900">{teacher?.name || 'Docente Titular'}</p>
            <p className="text-[10px] text-slate-500">Docente del Aula</p>
          </div>
          <div>
            <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
            <p className="font-bold text-slate-900">{state.schoolInfo.coordinador}</p>
            <p className="text-[10px] text-slate-500">Coordinación Pedagógica</p>
          </div>
          <div>
            <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
            <p className="font-bold text-slate-900">{state.schoolInfo.director}</p>
            <p className="text-[10px] text-slate-500">Dirección del Centro</p>
          </div>
        </div>

      </div>

    </div>
  );
};
