import { SupabaseConfig, AppState, CronLogEntry, CronTaskType } from '../types';

export interface PingResult {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  durationMs: number;
}

export function getCronIntervalMs(frequency: string, customMinutes: number = 5): number {
  switch (frequency) {
    case 'every_5_min':
      return 5 * 60 * 1000;
    case 'hourly':
      return 60 * 60 * 1000;
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return Math.max(1, customMinutes) * 60 * 1000;
  }
}

export async function pingSupabase(config: SupabaseConfig): Promise<PingResult> {
  const timestamp = new Date().toISOString();
  const startTime = performance.now();

  if (!config.url || !config.anonKey) {
    return {
      success: false,
      status: 400,
      message: 'Falta configurar la URL o la Anon Key de Supabase.',
      timestamp,
      durationMs: 0
    };
  }

  const cleanUrl = config.url.trim().replace(/\/+$/, '');
  const tableName = (config.tableName || 'evaluaciones_inicial').trim();
  const testEndpoint = `${cleanUrl}/rest/v1/${tableName}?select=id&limit=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'apikey': config.anonKey.trim(),
        'Authorization': `Bearer ${config.anonKey.trim()}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);

    if (response.ok || response.status === 200 || response.status === 404 || response.status === 401) {
      return {
        success: response.status !== 401,
        status: response.status,
        message: response.status === 401 
          ? 'Servidor activo, pero la Anon Key parece ser inválida (401).' 
          : `Keep-Alive exitoso (${durationMs}ms): Base de datos Supabase despierta y activa.`,
        timestamp,
        durationMs
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Respuesta del servidor: HTTP ${response.status} ${response.statusText}`,
        timestamp,
        durationMs
      };
    }
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      status: 0,
      message: error?.name === 'AbortError' 
        ? 'Tiempo de espera agotado (Timeout) al conectar con Supabase.' 
        : `Error de red al conectar: ${error?.message || 'Host inalcanzable'}`,
      timestamp,
      durationMs
    };
  }
}

export async function syncStateToSupabase(
  state: AppState, 
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; message: string; durationMs: number; status: number }> {
  const { supabaseConfig } = state;
  const startTime = performance.now();

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return { 
      success: false, 
      message: 'Configure las credenciales de Supabase antes de sincronizar.',
      durationMs: 0,
      status: 400
    };
  }

  const cleanUrl = supabaseConfig.url.trim().replace(/\/+$/, '');
  const tableName = (supabaseConfig.tableName || 'evaluaciones_inicial').trim();
  const endpoint = `${cleanUrl}/rest/v1/${tableName}`;

  onProgress?.(`Enviando copia a tabla '${tableName}'...`);

  try {
    const recordId = `eval-${state.schoolInfo.code || '05102'}`;
    const payload = {
      id: recordId,
      school_code: state.schoolInfo.code || '05102',
      academic_year: state.schoolInfo.academicYear || '2024-2025',
      period: state.currentPeriod || 'P1',
      data: state,
      updated_at: new Date().toISOString()
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${endpoint}?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': supabaseConfig.anonKey.trim(),
        'Authorization': `Bearer ${supabaseConfig.anonKey.trim()}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);

    if (response.ok || response.status === 201 || response.status === 204) {
      return { 
        success: true, 
        message: `Copia de seguridad guardada en Supabase tabla '${tableName}' (${durationMs}ms).`,
        durationMs,
        status: response.status
      };
    } else {
      const errText = await response.text().catch(() => '');
      return { 
        success: false, 
        message: `Error al respaldar en Supabase (HTTP ${response.status}): ${errText || response.statusText}`,
        durationMs,
        status: response.status
      };
    }
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return { 
      success: false, 
      message: `Fallo de conexión al respaldar: ${err?.message || 'Error de red'}`,
      durationMs,
      status: 0
    };
  }
}

export async function fetchLatestStateFromSupabase(
  config: SupabaseConfig,
  schoolCode: string = '05102'
): Promise<{ success: boolean; data?: AppState; updatedAt?: string; message: string }> {
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Faltan credenciales de Supabase.' };
  }

  const cleanUrl = config.url.trim().replace(/\/+$/, '');
  const tableName = (config.tableName || 'evaluaciones_inicial').trim();
  const endpoint = `${cleanUrl}/rest/v1/${tableName}?select=*&order=updated_at.desc&limit=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': config.anonKey.trim(),
        'Authorization': `Bearer ${config.anonKey.trim()}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const records = await response.json();
      if (Array.isArray(records) && records.length > 0 && records[0].data) {
        return { 
          success: true, 
          data: records[0].data as AppState, 
          updatedAt: records[0].updated_at,
          message: 'Datos recuperados exitosamente desde Supabase.' 
        };
      }
      return { success: false, message: 'No hay registros en Supabase todavía.' };
    } else {
      return { success: false, message: `Error al consultar Supabase (HTTP ${response.status})` };
    }
  } catch (err: any) {
    return { success: false, message: `Error de red al consultar Supabase: ${err?.message}` };
  }
}

// Unified Cron Task Runner
export async function runCronMaintenanceTask(
  state: AppState,
  taskOverride?: CronTaskType
): Promise<{ log: CronLogEntry; updatedConfig: SupabaseConfig }> {
  const config = state.supabaseConfig;
  const taskToRun: CronTaskType = taskOverride || config.cronTask || 'keep_alive';
  const timestamp = new Date().toISOString();

  let log: CronLogEntry;

  if (taskToRun === 'backup') {
    const res = await syncStateToSupabase(state);
    log = {
      id: `log-${Date.now()}`,
      timestamp,
      task: 'backup',
      success: res.success,
      status: res.status,
      message: res.message,
      durationMs: res.durationMs
    };
  } else if (taskToRun === 'audit') {
    const startTime = performance.now();
    // Audit data completeness
    const totalStudents = state.students.length;
    let completed = 0;
    state.students.forEach(st => {
      const obs = state.evaluations[st.id]?.[state.currentPeriod]?.observations;
      if (obs?.strengths && obs?.recommendations) completed++;
    });
    const durationMs = Math.round(performance.now() - startTime);
    log = {
      id: `log-${Date.now()}`,
      timestamp,
      task: 'audit',
      success: true,
      status: 200,
      message: `Auditoría completada: ${completed} de ${totalStudents} estudiantes con boletín completo en ${state.currentPeriod}.`,
      durationMs
    };
  } else {
    // Default keep_alive ping
    const res = await pingSupabase(config);
    log = {
      id: `log-${Date.now()}`,
      timestamp,
      task: 'keep_alive',
      success: res.success,
      status: res.status,
      message: res.message,
      durationMs: res.durationMs
    };
  }

  const updatedLogs = [log, ...(config.executionLogs || [])].slice(0, 15);

  const updatedConfig: SupabaseConfig = {
    ...config,
    totalPings: config.totalPings + 1,
    successfulPings: log.success ? config.successfulPings + 1 : config.successfulPings,
    lastPingAt: timestamp,
    lastPingStatus: log.success ? 'success' : 'error',
    lastPingMessage: log.message,
    executionLogs: updatedLogs
  };

  return { log, updatedConfig };
}
