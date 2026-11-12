import React, { useState, useMemo, useRef } from 'react';
import { 
  AppState, 
  Student, 
  GradeLevel, 
  ScoreValue,
  AppUser
} from '../types';
import { 
  getIndicatorsByGrade, 
  DOMAINS 
} from '../data/minerdCurriculum';
import { getStudentFamilyName } from '../utils/familyName';
import { 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  User, 
  FileText, 
  School, 
  Check,
  Download,
  Loader2,
  FileDown
} from 'lucide-react';
import { downloadSingleReportCardPDF, downloadBatchReportCardsPDF } from '../services/pdfExport';

interface ReportCardViewProps {
  state: AppState;
  currentUser?: AppUser;
  initialStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  state,
  currentUser,
  initialStudentId,
  onSelectStudent
}) => {
  const selectedGrade = (currentUser?.role === 'docente' && currentUser.grade) ? currentUser.grade : state.selectedGrade;
  const selectedSection = (currentUser?.role === 'docente' && currentUser.section) ? currentUser.section : state.selectedSection;

  const sectionStudents = useMemo(() => {
    return state.students
      .filter(s => s.grade === selectedGrade && s.section === selectedSection)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, selectedGrade, selectedSection]);

  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudentId || (sectionStudents[0]?.id || '')
  );

  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');

  // Refs for PDF capture
  const singleCardRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressMessage, setPdfProgressMessage] = useState('');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; studentName: string } | null>(null);

  const currentStudent = useMemo(() => {
    return sectionStudents.find(s => s.id === activeStudentId) || sectionStudents[0] || null;
  }, [sectionStudents, activeStudentId]);

  // Handler for direct single student PDF download
  const handleDownloadSinglePdf = async () => {
    if (!currentStudent) return;
    try {
      setIsGeneratingPdf(true);
      setBatchProgress(null);
      setPdfProgressMessage('Preparando boletín oficial...');

      // Find the card container
      const container = singleCardRef.current || document.querySelector('.report-card-print-container');
      if (!container) throw new Error('No se encontró el contenedor del boletín.');

      await downloadSingleReportCardPDF(
        currentStudent,
        selectedGrade,
        selectedSection,
        container as HTMLElement,
        (msg) => setPdfProgressMessage(msg)
      );
    } catch (err: any) {
      console.error('Error generating single PDF:', err);
      alert('Hubo un error al generar el PDF del boletín: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressMessage('');
    }
  };

  // Handler for direct batch (classroom) PDF download
  const handleDownloadBatchPdf = async () => {
    if (sectionStudents.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      setPdfProgressMessage('Iniciando paquete de boletines del aula...');

      // If currently in single view, temporarily switch to batch view so all cards render
      if (printMode !== 'batch') {
        setPrintMode('batch');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const container = viewportRef.current || document.querySelector('.report-card-viewport');
      if (!container) throw new Error('Contenedor de boletines no encontrado');

      await downloadBatchReportCardsPDF(
        sectionStudents,
        selectedGrade,
        selectedSection,
        container as HTMLElement,
        (progress) => {
          setBatchProgress(progress);
          setPdfProgressMessage(`Generando alumno ${progress.current} de ${progress.total}: ${progress.studentName}`);
        }
      );
    } catch (err: any) {
      console.error('Error generating batch PDF:', err);
      alert('Hubo un error al generar el paquete de boletines en PDF: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressMessage('');
      setBatchProgress(null);
    }
  };

  const indicators = useMemo(() => {
    return getIndicatorsByGrade(selectedGrade);
  }, [selectedGrade]);

  const teacher = useMemo(() => {
    return state.teachers.find(t => t.grade === selectedGrade && t.section === selectedSection);
  }, [state.teachers, selectedGrade, selectedSection]);

  // Split indicators for interior and contraportada based on grade structure
  // For Preprimario and Kínder: Dominio Comunicativo goes to Contraportada (Hoja 1 Izq)
  const { interiorLeftIndicators, interiorRightIndicators, contraportadaIndicators } = useMemo(() => {
    if (selectedGrade === 'Preprimario' || selectedGrade === 'Kínder') {
      const socio = indicators.filter(i => i.domainId === 'socioemocional');
      const art = indicators.filter(i => i.domainId === 'artistico');
      const pm = indicators.filter(i => i.domainId === 'psicomotor');
      const dm = indicators.filter(i => i.domainId === 'descubrimiento');
      const cog = indicators.filter(i => i.domainId === 'cognitivo');
      const com = indicators.filter(i => i.domainId === 'comunicativo');

      return {
        interiorLeftIndicators: [...socio, ...art, ...pm],
        interiorRightIndicators: [...dm, ...cog],
        contraportadaIndicators: com
      };
    } else {
      // Prekínder
      const socio = indicators.filter(i => i.domainId === 'socioemocional');
      const art = indicators.filter(i => i.domainId === 'artistico');
      const pm = indicators.filter(i => i.domainId === 'psicomotor');
      const dm = indicators.filter(i => i.domainId === 'descubrimiento');
      const cog = indicators.filter(i => i.domainId === 'cognitivo');
      const com = indicators.filter(i => i.domainId === 'comunicativo');

      return {
        interiorLeftIndicators: [...socio, ...art, ...pm],
        interiorRightIndicators: [...dm, ...cog, ...com],
        contraportadaIndicators: []
      };
    }
  }, [indicators, selectedGrade]);

  const getNextGradeTitle = (grade: GradeLevel) => {
    if (grade === 'Prekínder') return 'KÍNDER';
    if (grade === 'Kínder') return 'PRE-PRIMARIO';
    if (grade === 'Preprimario') return 'PRIMERO (1ro) DE PRIMARIA';
    return 'NIVEL SIGUIENTE';
  };

  const getAgeDescriptor = (grade: GradeLevel) => {
    if (grade === 'Prekínder') return 'Niños y niñas de 3 años';
    if (grade === 'Kínder') return 'Niños y niñas de 4 años';
    if (grade === 'Preprimario') return 'Niños y niñas de 5 años';
    return 'Educación Inicial';
  };

  // Helper to render checkmark in L / EP / I columns for P1, P2, P3
  const renderCheckCell = (val: ScoreValue | undefined, target: 'L' | 'EP' | 'I') => {
    if (val === target) {
      return <span className="font-black text-slate-900 text-[10px] leading-none">✓</span>;
    }
    return null;
  };

  // Render a Single Report Card (Hoja 1 + Hoja 2)
  const renderReportCard = (student: Student) => {
    const evalRecord = state.evaluations[student.id];
    const p1Eval = evalRecord?.P1;
    const p2Eval = evalRecord?.P2;
    const p3Eval = evalRecord?.P3;

    // Theme color per grade
    const gradeTheme = selectedGrade === 'Preprimario'
      ? { domainBg: 'bg-blue-100', domainText: 'text-blue-900', noteBg: 'bg-blue-50', noteBorder: 'border-blue-200' }
      : selectedGrade === 'Kínder'
      ? { domainBg: 'bg-emerald-100', domainText: 'text-emerald-900', noteBg: 'bg-emerald-50', noteBorder: 'border-emerald-200' }
      : { domainBg: 'bg-sky-100', domainText: 'text-sky-900', noteBg: 'bg-amber-50', noteBorder: 'border-amber-200' };

    const gradeCssClass = selectedGrade === 'Prekínder'
      ? 'grade-prekinder'
      : selectedGrade === 'Kínder'
      ? 'grade-kinder'
      : 'grade-preprimario';

    return (
      <div 
        key={student.id} 
        ref={printMode === 'single' ? singleCardRef : undefined}
        className="report-card-print-container space-y-6 print:space-y-0"
      >
        
        {/* ============================================================== */}
        {/* HOJA 1: EXTERIOR (Contraportada Izquierda | Portada Derecha)   */}
        {/* ============================================================== */}
        <div className={`sheet ${gradeCssClass} mx-auto bg-white shadow-xl print:shadow-none print:m-0`}>
          
          {/* PANEL IZQUIERDO: CONTRAPORTADA */}
          <div className="panel panel-contraportada border-r border-slate-300 pr-5 flex flex-col justify-between">
            
            {/* CONTINUACIÓN DE INDICADORES (Si aplica a Kínder / Preprimario) */}
            {contraportadaIndicators.length > 0 && (
              <div className="mb-2">
                <div className="bg-slate-100 border border-black border-b-0 text-center font-bold text-[9px] py-0.5 uppercase tracking-wide">
                  Continuación de Indicadores
                </div>
                <table className="eval-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '45%' }}>INDICADORES DE LOGRO</th>
                      <th colSpan={3}>1ro (Ago-Dic)</th>
                      <th colSpan={3}>2do (Ene-Mar)</th>
                      <th colSpan={3}>3ro (Abr-Jun)</th>
                    </tr>
                    <tr>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={10} className={`domain-header ${gradeTheme.domainBg} ${gradeTheme.domainText}`}>
                        DOMINIO COMUNICATIVO
                      </td>
                    </tr>
                    {contraportadaIndicators.map(ind => (
                      <tr key={ind.id}>
                        <td className="col-indicator">{ind.shortText}</td>
                        {/* P1 */}
                        <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'L')}</td>
                        <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'EP')}</td>
                        <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'I')}</td>
                        {/* P2 */}
                        <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'L')}</td>
                        <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'EP')}</td>
                        <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'I')}</td>
                        {/* P3 */}
                        <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'L')}</td>
                        <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'EP')}</td>
                        <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'I')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* OBSERVACIONES Y COMENTARIOS */}
            <div className="flex-grow flex flex-col justify-between">
              <h3 className="text-xs font-bold text-center uppercase border-b-2 border-black pb-0.5 tracking-wider">
                Observaciones y Comentarios
              </h3>

              <div className="contraportada-observations flex flex-col gap-2 flex-grow my-1">
                {/* P1 Box */}
                <div className="obs-box flex-grow">
                  <div className="obs-box-title font-bold bg-slate-100 px-1.5 py-0.5 border-b border-slate-300">
                    1er Período (Agosto - Diciembre)
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 flex-grow">
                    <div className="border-r border-slate-200 pr-1 flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Cualidades a destacar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p1Eval?.observations.strengths || ''}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Aspectos a estimular / Hogar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p1Eval?.observations.recommendations || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* P2 Box */}
                <div className="obs-box flex-grow">
                  <div className="obs-box-title font-bold bg-slate-100 px-1.5 py-0.5 border-b border-slate-300">
                    2do Período (Enero - Marzo)
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 flex-grow">
                    <div className="border-r border-slate-200 pr-1 flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Cualidades a destacar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p2Eval?.observations.strengths || ''}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Aspectos a estimular / Hogar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p2Eval?.observations.recommendations || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* P3 Box */}
                <div className="obs-box flex-grow">
                  <div className="obs-box-title font-bold bg-slate-100 px-1.5 py-0.5 border-b border-slate-300">
                    3er Período (Abril - Junio)
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 flex-grow">
                    <div className="border-r border-slate-200 pr-1 flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Cualidades a destacar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p3Eval?.observations.strengths || ''}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <span className="obs-label uppercase font-bold text-slate-600 mb-0.5">Aspectos a estimular / Hogar:</span>
                      <p className="obs-text text-slate-800 leading-tight italic">
                        {p3Eval?.observations.recommendations || ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance and Note */}
              <div className="contraportada-attendance border border-black p-1 text-[8.5px] flex items-center justify-between mb-1">
                <span><strong>Asistencia Acumulada:</strong> Laborados: {((p1Eval?.attendance.diasLaborados || 0) + (p2Eval?.attendance.diasLaborados || 0) + (p3Eval?.attendance.diasLaborados || 0))}</span>
                <span>Presentes: {((p1Eval?.attendance.presentes || 0) + (p2Eval?.attendance.presentes || 0) + (p3Eval?.attendance.presentes || 0))}</span>
                <span>Ausencias: {((p1Eval?.attendance.ausenciasJustificadas || 0) + (p1Eval?.attendance.ausenciasInjustificadas || 0) + (p2Eval?.attendance.ausenciasJustificadas || 0) + (p2Eval?.attendance.ausenciasInjustificadas || 0) + (p3Eval?.attendance.ausenciasJustificadas || 0) + (p3Eval?.attendance.ausenciasInjustificadas || 0))}</span>
              </div>

              <div className="contraportada-note text-[8.5px] text-center text-slate-500 italic">
                {selectedGrade === 'Preprimario'
                  ? 'Nota: Preprimario es la antesala formal al Primer Grado de Educación Primaria.'
                  : 'Nota: Valoramos y respetamos el ritmo individual de maduración y aprendizaje de cada niño/a.'}
              </div>
            </div>

          </div>

          {/* PANEL DERECHO: PORTADA */}
          <div className="panel panel-portada pl-5 flex flex-col justify-between">
            
            {/* Encabezado Oficial MINERD */}
            <div className="text-center">
              {/* Escudo / Logo Dominicano */}
              <div className="mx-auto mb-1.5 w-14 h-14 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center text-[8px] shadow-2xs overflow-hidden">
                {state.schoolInfo.logoBase64 ? (
                  <img src={state.schoolInfo.logoBase64} alt="Escudo Centro" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="font-black text-blue-900 text-[10px]">MINERD</span>
                    <span className="text-[7px] text-red-600 font-bold">REP. DOM.</span>
                  </div>
                )}
              </div>

              <h2 className="text-[11px] font-bold uppercase text-slate-800 tracking-wide">
                Gobierno de la República Dominicana
              </h2>
              <h3 className="text-[10px] uppercase text-red-600 font-black tracking-widest mt-0.5">
                Educación
              </h3>
              <h4 className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                Viceministerio de Servicios Técnicos y Pedagógicos<br />
                Dirección General de Educación Inicial
              </h4>

              <h1 className="text-xl font-black uppercase mt-2 mb-0.5 text-teal-800 tracking-tight border-b-2 border-teal-200 inline-block pb-0.5">
                Informe de Evaluación
              </h1>

              <div className="mt-1">
                <h2 className="text-xs font-semibold text-slate-600">{getAgeDescriptor(selectedGrade)}</h2>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  GRADO: {selectedGrade.toUpperCase()}
                </h2>
              </div>
            </div>

            {/* Foto y Datos del Estudiante */}
            <div className="flex gap-4 items-start px-2 mt-2">
              <div className="shrink-0">
                <div className="photo-placeholder">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <User className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                      <span>FOTO<br />3x4 cm</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grow pt-0.5 space-y-1">
                <div className="compact-row">
                  <span className="compact-label">Nombre:</span>
                  <span className="compact-value font-bold text-slate-900">{student.fullName}</span>
                </div>
                <div className="flex gap-3">
                  <div className="compact-row grow">
                    <span className="compact-label" style={{ minWidth: '35px' }}>Edad:</span>
                    <span className="compact-value">{student.age} Años</span>
                  </div>
                  <div className="compact-row grow">
                    <span className="compact-label" style={{ minWidth: '35px' }}>Sexo:</span>
                    <span className="compact-value">{student.gender || 'N/D'}</span>
                  </div>
                </div>
                <div className="compact-row">
                  <span className="compact-label">Grado / Sec:</span>
                  <span className="compact-value">{student.grade} - Sección {student.section}</span>
                </div>
                <div className="compact-row">
                  <span className="compact-label">Año Escolar:</span>
                  <span className="compact-value">{state.schoolInfo.academicYear}</span>
                </div>
                <div className="compact-row">
                  <span className="compact-label">Tanda:</span>
                  <span className="compact-value">{state.schoolInfo.tanda}</span>
                </div>
              </div>
            </div>

            {/* Datos Institucionales */}
            <div className="px-2 space-y-1 mt-1 text-xs">
              <div className="compact-row">
                <span className="compact-label">Familia:</span>
                <span className="compact-value truncate">{getStudentFamilyName(student)}</span>
              </div>
              <div className="compact-row">
                <span className="compact-label">Centro Educativo:</span>
                <span className="compact-value uppercase font-semibold">{state.schoolInfo.name}</span>
              </div>
              <div className="compact-row">
                <span className="compact-label">Educador/a:</span>
                <span className="compact-value uppercase font-semibold">{teacher?.name || 'Docente Titular'}</span>
              </div>
              <div className="flex gap-4">
                <div className="compact-row grow">
                  <span className="compact-label" style={{ minWidth: '35px' }}>Regional:</span>
                  <span className="compact-value">{state.schoolInfo.regional}</span>
                </div>
                <div className="compact-row grow">
                  <span className="compact-label" style={{ minWidth: '35px' }}>Distrito:</span>
                  <span className="compact-value">{state.schoolInfo.district}</span>
                </div>
              </div>
              <div className="compact-row border-b-0 pt-0.5">
                <span className="compact-label font-bold text-teal-900">Grado Siguiente:</span>
                <span className="compact-value font-black text-slate-900 border-b border-black grow">
                  {getNextGradeTitle(selectedGrade)}
                </span>
              </div>
            </div>

            {/* Firmas Oficiales */}
            <div className="signatures mt-6 grid grid-cols-2 gap-6 text-center px-4">
              <div>
                <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
                <p className="text-[9.5px] font-bold uppercase text-slate-800">Firma Educador/a Titular</p>
              </div>
              <div>
                <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
                <p className="text-[9.5px] font-bold uppercase text-slate-800">Firma Dirección / Coordinación</p>
              </div>
            </div>

            {/* Nota Familia */}
            <div className="mt-auto mb-0.5">
              <div className={`family-note ${gradeTheme.noteBg} ${gradeTheme.noteBorder}`}>
                <b>A las Familias:</b> En el Nivel Inicial, valoramos el proceso continuo e integral del desarrollo infantil. Acompañar con amor, diálogo constante y juego lúdico en casa es la mayor garantía de éxito escolar.
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================== */}
        {/* HOJA 2: INTERIOR (Tabla de Alta Densidad con Dominios)          */}
        {/* ============================================================== */}
        <div className={`sheet ${gradeCssClass} mx-auto bg-white shadow-xl print:shadow-none print:m-0`}>
          
          {/* PANEL IZQUIERDO: SOCIOEMOCIONAL, ARTÍSTICO, PSICOMOTOR */}
          <div className="panel panel-interior-left pr-2">
            <div className="ambito-container">
              <div className="ambito-sidebar">
                <div className="ambito-text">Socioemocional • Artístico • Psicomotor</div>
              </div>
              <div className="table-wrapper overflow-hidden">
                <table className="eval-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '42%' }}>INDICADORES DE LOGRO</th>
                      <th colSpan={3}>1ro (Ago-Dic)</th>
                      <th colSpan={3}>2do (Ene-Mar)</th>
                      <th colSpan={3}>3ro (Abr-Jun)</th>
                    </tr>
                    <tr>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Groups by Domain */}
                    {['socioemocional', 'artistico', 'psicomotor'].map(domainId => {
                      const domain = DOMAINS.find(d => d.id === domainId);
                      const domainInds = interiorLeftIndicators.filter(i => i.domainId === domainId);
                      if (domainInds.length === 0) return null;

                      return (
                        <React.Fragment key={domainId}>
                          <tr>
                            <td colSpan={10} className={`domain-header ${gradeTheme.domainBg} ${gradeTheme.domainText}`}>
                              {domain?.name.toUpperCase()}
                            </td>
                          </tr>
                          {domainInds.map(ind => (
                            <tr key={ind.id}>
                              <td className="col-indicator">{ind.shortText}</td>
                              {/* P1 */}
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'I')}</td>
                              {/* P2 */}
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'I')}</td>
                              {/* P3 */}
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'I')}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: DESCUBRIMIENTO, COGNITIVO (+ COMUNICATIVO en Prekínder) */}
          <div className="panel panel-interior-right pl-2">
            <div className="ambito-container">
              <div className="ambito-sidebar">
                <div className="ambito-text">
                  {selectedGrade === 'Prekínder' 
                    ? 'Descubrimiento • Cognitivo • Comunicativo' 
                    : 'Descubrimiento • Cognitivo'}
                </div>
              </div>
              <div className="table-wrapper overflow-hidden">
                <table className="eval-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '42%' }}>INDICADORES DE LOGRO</th>
                      <th colSpan={3}>1ro (Ago-Dic)</th>
                      <th colSpan={3}>2do (Ene-Mar)</th>
                      <th colSpan={3}>3ro (Abr-Jun)</th>
                    </tr>
                    <tr>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                      <th className="rotated-header"><span>Logrado</span></th>
                      <th className="rotated-header"><span>Proceso</span></th>
                      <th className="rotated-header"><span>Inicia</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Groups by Domain */}
                    {(selectedGrade === 'Prekínder' 
                      ? ['descubrimiento', 'cognitivo', 'comunicativo'] 
                      : ['descubrimiento', 'cognitivo']
                    ).map(domainId => {
                      const domain = DOMAINS.find(d => d.id === domainId);
                      const domainInds = interiorRightIndicators.filter(i => i.domainId === domainId);
                      if (domainInds.length === 0) return null;

                      return (
                        <React.Fragment key={domainId}>
                          <tr>
                            <td colSpan={10} className={`domain-header ${gradeTheme.domainBg} ${gradeTheme.domainText}`}>
                              {domain?.name.toUpperCase()}
                            </td>
                          </tr>
                          {domainInds.map(ind => (
                            <tr key={ind.id}>
                              <td className="col-indicator">{ind.shortText}</td>
                              {/* P1 */}
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p1Eval?.scores[ind.id], 'I')}</td>
                              {/* P2 */}
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p2Eval?.scores[ind.id], 'I')}</td>
                              {/* P3 */}
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'L')}</td>
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'EP')}</td>
                              <td className="col-check">{renderCheckCell(p3Eval?.scores[ind.id], 'I')}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="py-6">
      
      {/* On-Screen Action Bar (Hidden when printing) */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          
          {/* Mode Switcher: Individual vs Batch Aula */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  printMode === 'single' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Boletín Individual
              </button>
              <button
                onClick={() => setPrintMode('batch')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  printMode === 'batch' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Paquete Completo del Aula ({sectionStudents.length})</span>
              </button>
            </div>
          </div>

          {/* Student Selector (in Single Mode) */}
          {printMode === 'single' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Estudiante:</span>
              <select
                value={activeStudentId}
                onChange={(e) => {
                  setActiveStudentId(e.target.value);
                  onSelectStudent?.(e.target.value);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-md py-1.5 px-3 font-semibold text-slate-800 focus:outline-hidden max-w-xs cursor-pointer"
              >
                {sectionStudents.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.fullName}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  disabled={sectionStudents.findIndex(s => s.id === activeStudentId) <= 0}
                  onClick={() => {
                    const idx = sectionStudents.findIndex(s => s.id === activeStudentId);
                    if (idx > 0) setActiveStudentId(sectionStudents[idx - 1].id);
                  }}
                  className="p-1.5 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 cursor-pointer"
                  title="Estudiante anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={sectionStudents.findIndex(s => s.id === activeStudentId) >= sectionStudents.length - 1}
                  onClick={() => {
                    const idx = sectionStudents.findIndex(s => s.id === activeStudentId);
                    if (idx < sectionStudents.length - 1) setActiveStudentId(sectionStudents[idx + 1].id);
                  }}
                  className="p-1.5 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 cursor-pointer"
                  title="Siguiente estudiante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Direct PDF Download & Print */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Single mode direct PDF download button */}
            {printMode === 'single' && (
              <>
                <button
                  onClick={handleDownloadSinglePdf}
                  disabled={isGeneratingPdf || !currentStudent}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Descarga directa del boletín oficial de este alumno en formato PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  onClick={handleDownloadBatchPdf}
                  disabled={isGeneratingPdf || sectionStudents.length === 0}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Descargar todos los boletines de esta sección en un único archivo PDF consolidado"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Curso Completo ({sectionStudents.length} en PDF)</span>
                </button>
              </>
            )}

            {/* Batch mode direct PDF download button */}
            {printMode === 'batch' && (
              <button
                onClick={handleDownloadBatchPdf}
                disabled={isGeneratingPdf || sectionStudents.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Descargar todos los boletines de este curso en un único documento PDF oficial"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Paquete PDF ({sectionStudents.length} Boletines)</span>
              </button>
            )}

            {/* Physical Print Button (Now strictly 2 pages per student, 0 blank pages) */}
            <button
              onClick={() => window.print()}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Abrir cuadro de impresión (ajustado exactamente a 2 páginas por boletín)"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printMode === 'batch' 
                  ? `Imprimir (${sectionStudents.length})` 
                  : 'Imprimir'}
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* Render Document(s) */}
      <div ref={viewportRef} className="report-card-viewport">
        {printMode === 'single' ? (
          currentStudent ? (
            renderReportCard(currentStudent)
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white max-w-xl mx-auto rounded-xl border border-slate-200">
              No hay estudiantes seleccionados en esta sección.
            </div>
          )
        ) : (
          sectionStudents.map(student => renderReportCard(student))
        )}
      </div>

      {/* PDF Generation Progress Modal */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Generando Documento PDF Oficial
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {pdfProgressMessage || 'Compilando carátula y matriz curricular...'}
              </p>
            </div>

            {batchProgress && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                  <span>Alumno {batchProgress.current} de {batchProgress.total}</span>
                  <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic">
              El archivo PDF se descargará automáticamente en su carpeta de descargas al finalizar.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
