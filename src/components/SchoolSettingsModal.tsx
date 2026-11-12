import React, { useState } from 'react';
import { 
  AppState, 
  SchoolInfo, 
  SupabaseConfig,
  CronFrequency,
  CronTaskType
} from '../types';
import { runCronMaintenanceTask } from '../services/supabaseService';
import { exportStateAsJson } from '../services/storage';
import { 
  X, 
  Upload, 
  Building2, 
  Database, 
  Activity, 
  Download, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Play,
  Trash2,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';

interface SchoolSettingsModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onSaveSchoolInfo: (info: SchoolInfo) => void;
  onSaveSupabaseConfig: (config: SupabaseConfig) => void;
  onResetData: () => void;
  onImportJson: (importedState: AppState) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  state,
  isOpen,
  onClose,
  onSaveSchoolInfo,
  onSaveSupabaseConfig,
  onResetData,
  onImportJson
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'school' | 'supabase' | 'backup'>('supabase');
  const [schoolData, setSchoolData] = useState<SchoolInfo>({ ...state.schoolInfo });
  const [supabaseData, setSupabaseData] = useState<SupabaseConfig>({ 
    ...state.supabaseConfig,
    cronFrequency: state.supabaseConfig.cronFrequency || 'every_5_min',
    cronTask: state.supabaseConfig.cronTask || 'keep_alive',
    executionLogs: state.supabaseConfig.executionLogs || []
  });
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronExecutionResult, setCronExecutionResult] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | undefined>(state.schoolInfo.logoBase64);

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo de imagen no debe superar los 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoPreview(base64);
        setSchoolData(prev => ({ ...prev, logoBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSchool = () => {
    onSaveSchoolInfo(schoolData);
    alert('Datos del Centro Educativo actualizados exitosamente.');
  };

  const handleSaveSupabase = () => {
    onSaveSupabaseConfig(supabaseData);
    alert('Configuración de Supabase y Cron Job guardada.');
  };

  // Run selected cron task right now
  const handleTriggerManualCron = async (taskOverride?: CronTaskType) => {
    setIsRunningCron(true);
    setCronExecutionResult('Ejecutando tarea de mantenimiento con Supabase...');
    
    try {
      const { log, updatedConfig } = await runCronMaintenanceTask(
        { ...state, supabaseConfig: supabaseData },
        taskOverride
      );
      setSupabaseData(updatedConfig);
      onSaveSupabaseConfig(updatedConfig);
      setCronExecutionResult(log.message);
    } catch (err: any) {
      setCronExecutionResult(`Error al ejecutar tarea: ${err?.message}`);
    } finally {
      setIsRunningCron(false);
    }
  };

  const handleClearLogs = () => {
    const updated: SupabaseConfig = {
      ...supabaseData,
      executionLogs: []
    };
    setSupabaseData(updated);
    onSaveSupabaseConfig(updated);
  };

  // JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (parsed.students && parsed.evaluations && parsed.schoolInfo) {
            onImportJson(parsed);
            alert('¡Copia de seguridad importada con éxito!');
            onClose();
          } else {
            alert('El archivo no contiene una estructura válida de evaluación MINERD.');
          }
        } catch (err) {
          alert('Error al procesar el archivo JSON: formato incorrecto.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getTaskLabel = (task: CronTaskType) => {
    switch (task) {
      case 'keep_alive':
        return 'Keep-Alive Ping (Mantener BD Activa)';
      case 'backup':
        return 'Copia de Seguridad Periódica (Backup JSON)';
      case 'audit':
        return 'Auditoría de Cumplimiento de Boletines';
      default:
        return task;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-800 text-white rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuración & Mantenimiento
              </h2>
              <p className="text-xs text-slate-500">
                Cron Jobs para Supabase, datos institucionales y copias de seguridad.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'supabase' ? 'border-teal-800 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Cron Job & Supabase</span>
            {supabaseData.cronEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('school')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'school' ? 'border-teal-800 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Datos del Centro</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'backup' ? 'border-teal-800 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Copia de Seguridad</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 flex-grow">
          
          {/* TAB 1: SUPABASE & CRON JOB CONFIGURATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <Activity className="w-4 h-4 text-blue-700" />
                  Mantenimiento Programado (Cron Job) con Supabase
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Configure el Cron Job para realizar tareas automatizadas como mantener la base de datos de Supabase activa (evitando su hibernación por inactividad) o programar copias de seguridad periódicas de las evaluaciones críticas.
                </p>
              </div>

              {/* Supabase Connection Credentials */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 text-xs block">Credenciales de Conexión</span>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzproject.supabase.co"
                    value={supabaseData.url}
                    onChange={(e) => setSupabaseData({ ...supabaseData, url: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseData.anonKey}
                    onChange={(e) => setSupabaseData({ ...supabaseData, anonKey: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre de Tabla Remota en Supabase
                  </label>
                  <input
                    type="text"
                    value={supabaseData.tableName}
                    onChange={(e) => setSupabaseData({ ...supabaseData, tableName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:border-teal-700 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cron Job Parameters */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Activar Cron Job Automatizado</span>
                    <span className="text-[11px] text-slate-500">Ejecuta la tarea en segundo plano con la frecuencia indicada.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supabaseData.cronEnabled}
                      onChange={(e) => setSupabaseData({ ...supabaseData, cronEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
                  </label>
                </div>

                {/* Task Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tarea de Mantenimiento:</label>
                    <select
                      value={supabaseData.cronTask || 'keep_alive'}
                      onChange={(e) => setSupabaseData({ ...supabaseData, cronTask: e.target.value as CronTaskType })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-medium"
                    >
                      <option value="keep_alive">Keep-Alive Ping (Mantener BD Activa)</option>
                      <option value="backup">Copia de Seguridad Periódica (Backup)</option>
                      <option value="audit">Auditoría de Registro de Boletines</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Frecuencia de Ejecución:</label>
                    <select
                      value={supabaseData.cronFrequency || 'daily'}
                      onChange={(e) => setSupabaseData({ ...supabaseData, cronFrequency: e.target.value as CronFrequency })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-medium"
                    >
                      <option value="daily">Una vez al día (Cada 24 horas - Recomendado para Supabase)</option>
                      <option value="hourly">Cada 1 hora</option>
                      <option value="every_5_min">Cada 5 minutos (Keep-Alive frecuente)</option>
                      <option value="weekly">Semanal (Cierre y Respaldo Semanal)</option>
                    </select>
                  </div>
                </div>

                {/* Instant Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    disabled={isRunningCron || !supabaseData.url}
                    onClick={() => handleTriggerManualCron()}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5 text-teal-800" />
                    <span>{isRunningCron ? 'Ejecutando Cron...' : 'Ejecutar Tarea Ahora'}</span>
                  </button>

                  <button
                    onClick={handleSaveSupabase}
                    className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración</span>
                  </button>
                </div>

                {cronExecutionResult && (
                  <p className="text-xs p-2.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                    {cronExecutionResult}
                  </p>
                )}
              </div>

              {/* Execution Logs Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-slate-600" />
                    <span>Historial de Ejecuciones del Cron</span>
                  </span>
                  {supabaseData.executionLogs && supabaseData.executionLogs.length > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpiar historial</span>
                    </button>
                  )}
                </div>

                {(!supabaseData.executionLogs || supabaseData.executionLogs.length === 0) ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded border border-slate-200 text-xs">
                    No se han registrado ejecuciones de Cron todavía.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Fecha y Hora</th>
                          <th className="py-1.5 px-2">Tarea</th>
                          <th className="py-1.5 px-2 text-center">Estado</th>
                          <th className="py-1.5 px-3">Mensaje / Duración</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supabaseData.executionLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 whitespace-nowrap text-slate-500 tabular-nums">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({new Date(log.timestamp).toLocaleDateString()})
                            </td>
                            <td className="py-1.5 px-2 font-medium text-slate-800">
                              {log.task === 'keep_alive' ? 'Keep-Alive' : log.task === 'backup' ? 'Backup' : 'Auditoría'}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                log.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {log.success ? 'EXITOSO' : 'FALLO'}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-slate-700 truncate max-w-xs" title={log.message}>
                              {log.message} <span className="text-slate-400 tabular-nums">({log.durationMs}ms)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SCHOOL INFO */}
          {activeTab === 'school' && (
            <div className="space-y-4">
              
              {/* Logo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Centro" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Sin Logo</span>
                  )}
                </div>
                <div className="space-y-1 grow">
                  <label className="block font-bold text-slate-800">
                    Logo o Escudo del Centro Educativo
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Se imprimirá en la portada del boletín y en el informe pedagógico oficial.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-teal-800" />
                    <span>Subir Logo (PNG/JPG)</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoPreview && (
                    <button
                      onClick={() => {
                        setLogoPreview(undefined);
                        setSchoolData(prev => ({ ...prev, logoBase64: undefined }));
                      }}
                      className="ml-2 text-rose-600 hover:underline text-[11px]"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* School Fields Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Centro</label>
                  <input
                    type="text"
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código SIGERD / Centro</label>
                  <input
                    type="text"
                    value={schoolData.code}
                    onChange={(e) => setSchoolData({ ...schoolData, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regional Educativa</label>
                  <input
                    type="text"
                    value={schoolData.regional}
                    onChange={(e) => setSchoolData({ ...schoolData, regional: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distrito Educativo</label>
                  <input
                    type="text"
                    value={schoolData.district}
                    onChange={(e) => setSchoolData({ ...schoolData, district: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Director/a del Centro</label>
                  <input
                    type="text"
                    value={schoolData.director}
                    onChange={(e) => setSchoolData({ ...schoolData, director: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coordinador/a Pedagógica</label>
                  <input
                    type="text"
                    value={schoolData.coordinador}
                    onChange={(e) => setSchoolData({ ...schoolData, coordinador: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Año Escolar</label>
                  <input
                    type="text"
                    value={schoolData.academicYear}
                    onChange={(e) => setSchoolData({ ...schoolData, academicYear: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanda Escolar</label>
                  <input
                    type="text"
                    value={schoolData.tanda}
                    onChange={(e) => setSchoolData({ ...schoolData, tanda: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveSchool}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Datos del Centro</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP AND RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">Descargar Respaldo Completo</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Exporta toda la información (estudiantes, maestros, calificaciones de P1, P2 y P3, observaciones cualitativas y configuración de centro) en un archivo JSON portátil.
                </p>
                <button
                  onClick={() => exportStateAsJson(state)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar JSON de Respaldo</span>
                </button>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs">Restaurar Copia de Seguridad JSON</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sube un archivo de evaluación previamente exportado para restaurar todos los registros.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4 text-teal-800" />
                  <span>Seleccionar Archivo JSON</span>
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
              </div>

              <div className="p-4 border border-rose-200 rounded-lg bg-rose-50/50 space-y-2">
                <h3 className="font-bold text-rose-900 text-xs">Reiniciar a Datos Iniciales del MINERD</h3>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Esta acción restaurará la base de datos a los 8 docentes y 80+ estudiantes semilla del Centro Educativo Santo Domingo.
                </p>
                <button
                  onClick={() => {
                    if (confirm('¿Está seguro de reiniciar los datos a la plantilla original de demostración? Se perderán las modificaciones locales no exportadas.')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Datos Semilla</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
