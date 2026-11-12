import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  AppState, 
  EvaluationPeriod, 
  GradeLevel, 
  Student 
} from '../types';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  FileText, 
  ClipboardCheck, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';

interface BulkObservationsModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onBatchUpdateObservations: (
    updates: Array<{
      studentId: string;
      period: EvaluationPeriod;
      strengths: string;
      recommendations: string;
    }>
  ) => void;
}

interface ParsedObservationRow {
  rawId?: string;
  rawName: string;
  rawGrade?: string;
  rawSection?: string;
  rawPeriod?: string;
  strengths: string;
  recommendations: string;
  matchedStudent?: Student;
  targetPeriod: EvaluationPeriod;
  status: 'matched' | 'not_found' | 'skipped_empty' | 'existing_preserved';
  statusMessage: string;
}

export const BulkObservationsModal: React.FC<BulkObservationsModalProps> = ({
  state,
  isOpen,
  onClose,
  onBatchUpdateObservations
}) => {
  if (!isOpen) return null;

  // Configuration options
  const [targetPeriod, setTargetPeriod] = useState<EvaluationPeriod | 'AUTO'>('AUTO');
  const [selectedScope, setSelectedScope] = useState<'ALL' | string>('ALL'); // 'ALL' or `${grade}-${section}`
  const [overwriteMode, setOverwriteMode] = useState<'overwrite' | 'preserve'>('overwrite');
  
  // Input method: 'file' or 'paste'
  const [inputTab, setInputTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<Array<Record<string, string>>>([]);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'errors'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper normalize string for fuzzy matching names
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Grade/section options for filtering
  const sectionOptions = useMemo(() => {
    const list: { grade: GradeLevel; section: string; label: string }[] = [];
    ['Prekínder', 'Kínder', 'Preprimario'].forEach((g) => {
      ['A', 'B', 'C'].forEach((s) => {
        const count = state.students.filter(st => st.grade === g && st.section === s).length;
        if (count > 0) {
          list.push({
            grade: g as GradeLevel,
            section: s,
            label: `${g} "${s}" (${count} alumnos)`
          });
        }
      });
    });
    return list;
  }, [state.students]);

  // Parse raw text or table data into normalized objects
  const parseCSVContent = (content: string) => {
    try {
      const workbook = XLSX.read(content, { type: 'string', raw: true });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
      return json.map(row => {
        const stringRow: Record<string, string> = {};
        Object.keys(row).forEach(k => {
          stringRow[k.trim()] = String(row[k] ?? '').trim();
        });
        return stringRow;
      });
    } catch (err) {
      console.error('Error parsing CSV:', err);
      return [];
    }
  };

  // Handle file change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSuccessMessage(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let json: Array<Record<string, string>> = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheet];
          json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' }).map(r => {
            const out: Record<string, string> = {};
            Object.keys(r).forEach(k => { out[k.trim()] = String(r[k] ?? '').trim(); });
            return out;
          });
        } else {
          // CSV / TXT
          const text = evt.target?.result as string;
          json = parseCSVContent(text);
        }

        setRawRows(json);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error al leer el archivo. Asegúrese de que sea un archivo CSV o Excel válido.');
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  };

  // Handle paste parsing
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    setSuccessMessage(null);
    const parsed = parseCSVContent(pastedText);
    setRawRows(parsed);
  };

  // Match rows with students in state
  const matchedRows: ParsedObservationRow[] = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    return rawRows.map((row) => {
      // Find candidate keys
      const idKey = Object.keys(row).find(k => /^(id|matricula|codigo|id_estudiante|student_id)$/i.test(k));
      const nameKey = Object.keys(row).find(k => /^(estudiante|nombre|alumno|full_name|name)$/i.test(k));
      const gradeKey = Object.keys(row).find(k => /^(grado|grade|curso|nivel)$/i.test(k));
      const sectionKey = Object.keys(row).find(k => /^(seccion|section|aula|sec)$/i.test(k));
      const periodKey = Object.keys(row).find(k => /^(periodo|period|lapso)$/i.test(k));
      
      const strengthsKey = Object.keys(row).find(k => 
        /^(fortalezas|cualidades|fortaleza|aspectos_destacar|strengths|fortalezas_cualidades)$/i.test(k) ||
        k.toLowerCase().includes('fortaleza') ||
        k.toLowerCase().includes('destacar')
      );

      const recommendationsKey = Object.keys(row).find(k => 
        /^(recomendaciones|sugerencias|aspectos_estimular|recomendacion|recommendations|recomendaciones_estimular)$/i.test(k) ||
        k.toLowerCase().includes('recomenda') ||
        k.toLowerCase().includes('estimular')
      );

      const rawId = idKey ? row[idKey] : undefined;
      const rawName = nameKey ? row[nameKey] : (row['Estudiante'] || Object.values(row)[0] || '');
      const rawGrade = gradeKey ? row[gradeKey] : undefined;
      const rawSection = sectionKey ? row[sectionKey] : undefined;
      const rawPeriodValue = periodKey ? row[periodKey].toUpperCase() : undefined;
      const strengths = strengthsKey ? row[strengthsKey] : (row['Fortalezas'] || '');
      const recommendations = recommendationsKey ? row[recommendationsKey] : (row['Recomendaciones'] || '');

      // Determine period
      let resolvedPeriod: EvaluationPeriod = state.currentPeriod;
      if (targetPeriod !== 'AUTO') {
        resolvedPeriod = targetPeriod;
      } else if (rawPeriodValue && ['P1', 'P2', 'P3'].includes(rawPeriodValue)) {
        resolvedPeriod = rawPeriodValue as EvaluationPeriod;
      }

      // Search student:
      let student: Student | undefined;
      
      // 1. Try by ID if present
      if (rawId && rawId.trim()) {
        student = state.students.find(s => s.id === rawId.trim());
      }

      // 2. Try by normalized name
      if (!student && rawName) {
        const normSearch = normalize(rawName);
        student = state.students.find(s => {
          const normStud = normalize(s.fullName);
          return normStud === normSearch || normStud.includes(normSearch) || normSearch.includes(normStud);
        });
      }

      // If scope is limited to a specific section, check match
      if (student && selectedScope !== 'ALL') {
        const [scopeGrade, scopeSection] = selectedScope.split('___');
        if (student.grade !== scopeGrade || student.section !== scopeSection) {
          return {
            rawId,
            rawName,
            rawGrade,
            rawSection,
            rawPeriod: rawPeriodValue,
            strengths,
            recommendations,
            matchedStudent: student,
            targetPeriod: resolvedPeriod,
            status: 'not_found',
            statusMessage: `Estudiante en otra aula (${student.grade} ${student.section})`
          };
        }
      }

      if (!student) {
        return {
          rawId,
          rawName,
          rawGrade,
          rawSection,
          rawPeriod: rawPeriodValue,
          strengths,
          recommendations,
          targetPeriod: resolvedPeriod,
          status: 'not_found',
          statusMessage: 'No se encontró en la lista de estudiantes'
        };
      }

      // Check if both strengths and recommendations are empty
      if (!strengths.trim() && !recommendations.trim()) {
        return {
          rawId,
          rawName,
          rawGrade,
          rawSection,
          rawPeriod: rawPeriodValue,
          strengths,
          recommendations,
          matchedStudent: student,
          targetPeriod: resolvedPeriod,
          status: 'skipped_empty',
          statusMessage: 'Campos de observaciones vacíos en la fila'
        };
      }

      // Check overwrite mode
      if (overwriteMode === 'preserve') {
        const existing = state.evaluations[student.id]?.[resolvedPeriod]?.observations;
        if (existing && (existing.strengths.trim() || existing.recommendations.trim())) {
          return {
            rawId,
            rawName,
            rawGrade,
            rawSection,
            rawPeriod: rawPeriodValue,
            strengths,
            recommendations,
            matchedStudent: student,
            targetPeriod: resolvedPeriod,
            status: 'existing_preserved',
            statusMessage: 'Ya tiene observaciones (conservada)'
          };
        }
      }

      return {
        rawId,
        rawName,
        rawGrade,
        rawSection,
        rawPeriod: rawPeriodValue,
        strengths,
        recommendations,
        matchedStudent: student,
        targetPeriod: resolvedPeriod,
        status: 'matched',
        statusMessage: 'Listo para cargar'
      };
    });
  }, [rawRows, state.students, state.evaluations, targetPeriod, selectedScope, overwriteMode, state.currentPeriod]);

  // Filtered preview
  const displayRows = useMemo(() => {
    return matchedRows.filter(r => {
      if (previewFilter === 'valid' && r.status !== 'matched') return false;
      if (previewFilter === 'errors' && r.status === 'matched') return false;
      if (searchFilter.trim()) {
        const q = normalize(searchFilter);
        const nameMatch = normalize(r.rawName).includes(q) || (r.matchedStudent && normalize(r.matchedStudent.fullName).includes(q));
        const strengthsMatch = normalize(r.strengths).includes(q);
        const recMatch = normalize(r.recommendations).includes(q);
        return nameMatch || strengthsMatch || recMatch;
      }
      return true;
    });
  }, [matchedRows, previewFilter, searchFilter]);

  // Statistics
  const validCount = matchedRows.filter(r => r.status === 'matched').length;
  const errorCount = matchedRows.filter(r => r.status === 'not_found').length;
  const preservedCount = matchedRows.filter(r => r.status === 'existing_preserved' || r.status === 'skipped_empty').length;

  // Apply batch update
  const handleApplyImport = () => {
    const validUpdates = matchedRows
      .filter(r => r.status === 'matched' && r.matchedStudent)
      .map(r => ({
        studentId: r.matchedStudent!.id,
        period: r.targetPeriod,
        strengths: r.strengths,
        recommendations: r.recommendations
      }));

    if (validUpdates.length === 0) {
      alert('No hay observaciones válidas listas para importar.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onBatchUpdateObservations(validUpdates);
      setIsProcessing(false);
      setSuccessMessage(`¡Éxito! Se actualizaron correctamente ${validUpdates.length} observaciones en el sistema.`);
      // Clear file
      setRawRows([]);
      setPastedText('');
      setUploadedFileName(null);
    }, 400);
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    let targetStudents = state.students;
    if (selectedScope !== 'ALL') {
      const [scopeGrade, scopeSection] = selectedScope.split('___');
      targetStudents = state.students.filter(s => s.grade === scopeGrade && s.section === scopeSection);
    }
    targetStudents = [...targetStudents].sort((a, b) => a.fullName.localeCompare(b.fullName));

    const periodToUse = targetPeriod === 'AUTO' ? state.currentPeriod : targetPeriod;

    const dataRows = targetStudents.map((st) => {
      const currentObs = state.evaluations[st.id]?.[periodToUse]?.observations;
      return {
        'ID_Estudiante': st.id,
        'Estudiante': st.fullName,
        'Grado': st.grade,
        'Seccion': st.section,
        'Periodo': periodToUse,
        'Fortalezas_Cualidades': currentObs?.strengths || 'Demuestra entusiasmo por participar en las actividades y comparte con sus compañeros.',
        'Recomendaciones_Estimular': currentObs?.recommendations || 'Se sugiere continuar fomentando el hábito de la lectura compartida en el hogar.'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Observaciones');

    const fileName = `Plantilla_Observaciones_SENI_${periodToUse}_${selectedScope !== 'ALL' ? selectedScope.replace('___', '_') : 'Todas_Aulas'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* 1. MODAL HEADER */}
        <div className="bg-[#0b1b3d] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Carga Masiva de Observaciones Cualitativas
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                  Administrador
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Importe fortalezas y recomendaciones en lote para boletines e informes oficiales desde CSV o Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. CONFIGURATION & TEMPLATE BAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Target Period */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Período de Evaluación:</label>
            <select
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="AUTO">Detectar de columna o usar actual ({state.currentPeriod})</option>
              <option value="P1">P1 - Primer Período (Noviembre)</option>
              <option value="P2">P2 - Segundo Período (Marzo)</option>
              <option value="P3">P3 - Tercer Período (Junio)</option>
            </select>
          </div>

          {/* Scope / Classroom */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Filtrar por Aula:</label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ALL">Toda la Escuela (Todas las Aulas)</option>
              {sectionOptions.map(opt => (
                <option key={`${opt.grade}___${opt.section}`} value={`${opt.grade}___${opt.section}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Overwrite mode */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Acción con existentes:</label>
            <select
              value={overwriteMode}
              onChange={(e) => setOverwriteMode(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="overwrite">Sobrescribir si ya existen</option>
              <option value="preserve">Solo rellenar si están vacías</option>
            </select>
          </div>

          {/* Template Download Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleDownloadTemplate}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Descargar archivo Excel/CSV con los estudiantes seleccionados para rellenar fácilmente"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla</span>
            </button>
          </div>

        </div>

        {/* 3. INPUT METHOD TABS */}
        <div className="bg-white border-b border-slate-200 px-6 pt-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputTab('file')}
              className={`px-4 py-2 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
                inputTab === 'file'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Subir Archivo (.csv / .xlsx)</span>
            </button>
            <button
              onClick={() => setInputTab('paste')}
              className={`px-4 py-2 border-b-2 font-bold text-xs flex items-center gap-2 transition-all ${
                inputTab === 'paste'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Pegar Texto Directo (CSV / Excel)</span>
            </button>
          </div>

          {rawRows.length > 0 && (
            <button
              onClick={() => {
                setRawRows([]);
                setPastedText('');
                setUploadedFileName(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold"
            >
              Limpiar datos cargados
            </button>
          )}
        </div>

        {/* 4. MAIN CONTENT AREA (SCROLLABLE) */}
        <div className="p-6 grow overflow-y-auto space-y-5">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="grow">
                <p className="font-bold text-sm">{successMessage}</p>
                <p className="text-xs text-emerald-700">Las observaciones ya están visibles en los boletines y la pestaña de Observaciones Cualitativas.</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Tab 1: File Upload Box */}
          {inputTab === 'file' && rawRows.length === 0 && (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-csv-upload-input"
              />
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                Arrastre o seleccione su archivo CSV o Excel de observaciones
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                El archivo debe contener al menos las columnas <strong>Estudiante</strong> (o Nombre), <strong>Fortalezas</strong> y <strong>Recomendaciones</strong>.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Examinar archivo (.csv / .xlsx)
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Descargar Plantilla Oficial
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Direct Paste Box */}
          {inputTab === 'paste' && rawRows.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Pegue aquí el texto copiado de Excel o un archivo CSV:
                </label>
                <span className="text-[11px] text-slate-500">
                  Separado por tabuladores, comas o punto y coma
                </span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Estudiante\tFortalezas\tRecomendaciones\nJuan Pérez\tDemuestra creatividad al pintar y comparte.\tEstimular el seguimiento de instrucciones.\nMaría Gómez\tParticipativa y empática.\tFomentar la autonomía al ordenar sus materiales.`}
                className="w-full h-44 p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-slate-50"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleProcessPastedText}
                  disabled={!pastedText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Procesar y Validar Datos
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TABLE (When rows exist) */}
          {matchedRows.length > 0 && (
            <div className="space-y-4">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-slate-500 block">Total en archivo:</span>
                  <span className="text-xl font-black text-slate-800">{matchedRows.length}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-emerald-700 block">Listos para cargar:</span>
                  <span className="text-xl font-black text-emerald-800">{validCount}</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-rose-700 block">No encontrados:</span>
                  <span className="text-xl font-black text-rose-800">{errorCount}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-amber-700 block">Omitidos / Existentes:</span>
                  <span className="text-xl font-black text-amber-800">{preservedCount}</span>
                </div>
              </div>

              {/* Table Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
                
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setPreviewFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      previewFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({matchedRows.length})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      previewFilter === 'valid'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Válidos ({validCount})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('errors')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      previewFilter === 'errors'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    No encontrados ({errorCount})
                  </button>
                </div>

                {/* Search in preview */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por nombre o texto..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

              </div>

              {/* Preview Rows Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 w-10">No.</th>
                      <th className="py-2 px-3 w-28">Estado</th>
                      <th className="py-2 px-3">Estudiante en Sistema</th>
                      <th className="py-2 px-3 w-16 text-center">Período</th>
                      <th className="py-2 px-3">Fortalezas a Destacar</th>
                      <th className="py-2 px-3">Recomendaciones Familia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No hay filas que coincidan con el filtro actual.
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((r, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50 transition-colors ${
                            r.status === 'matched' ? 'bg-emerald-50/20' : r.status === 'not_found' ? 'bg-rose-50/20' : 'bg-amber-50/10'
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            {r.status === 'matched' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Listo
                              </span>
                            ) : r.status === 'not_found' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                No hallado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                <Info className="w-3 h-3" />
                                Omitido
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {r.matchedStudent ? (
                              <div>
                                <span className="font-bold text-slate-900 block">{r.matchedStudent.fullName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {r.matchedStudent.grade} "{r.matchedStudent.section}"
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-rose-900 block">{r.rawName || 'Sin Nombre'}</span>
                                <span className="text-[10px] text-rose-500">{r.statusMessage}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="font-bold font-mono px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px]">
                              {r.targetPeriod}
                            </span>
                          </td>
                          <td className="py-2 px-3 max-w-xs">
                            <p className="line-clamp-2 text-slate-700 text-[11px]" title={r.strengths}>
                              {r.strengths || <span className="italic text-slate-400">(Vacío)</span>}
                            </p>
                          </td>
                          <td className="py-2 px-3 max-w-xs">
                            <p className="line-clamp-2 text-slate-700 text-[11px]" title={r.recommendations}>
                              {r.recommendations || <span className="italic text-slate-400">(Vacío)</span>}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Formato recomendado de columnas en el archivo:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-0.5 text-[11px]">
                <li><strong>Estudiante</strong>: Nombre completo del alumno (se asocia automáticamente aunque no tenga el ID).</li>
                <li><strong>Fortalezas</strong> (o Fortalezas_Cualidades): Texto cualitativo de logros y cualidades a destacar.</li>
                <li><strong>Recomendaciones</strong> (o Recomendaciones_Estimular): Sugerencias pedagógicas para la familia.</li>
                <li><strong>Periodo</strong> (opcional): <code>P1</code>, <code>P2</code> o <code>P3</code>. Si no se especifica, se aplicará al período seleccionado arriba.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* 5. MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {uploadedFileName && (
              <span>Archivo cargado: <strong>{uploadedFileName}</strong> ({rawRows.length} filas)</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleApplyImport}
              disabled={validCount === 0 || isProcessing}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Aplicando cambios...</span>
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Aplicar Carga Masiva ({validCount} observaciones)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
