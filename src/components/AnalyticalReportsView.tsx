import React, { useMemo, useRef, useState } from 'react';
import {
  AppState,
  AppUser,
  EvaluationPeriod,
  GradeLevel
} from '../types';
import {
  buildSectionAnalyticalReport,
  buildGeneralLevelAnalyticalReport,
  DomainAnalyticsItem,
  IndicatorAnalyticsItem,
  PeriodSnapshot,
  StudentInterventionItem,
  PERIOD_LABELS
} from '../utils/analyticalReportData';
import { downloadAnalyticalReportPDF } from '../services/pdfExport';
import {
  FileDown,
  Loader2,
  Building2,
  Users,
  Lock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface AnalyticalReportsViewProps {
  state: AppState;
  currentUser: AppUser;
  initialMode?: 'section' | 'general';
  onGradeChange: (grade: GradeLevel) => void;
  onSectionChange: (section: string) => void;
  onPeriodChange: (period: EvaluationPeriod) => void;
}

const SECTION_STUDENT_ROWS_PER_PAGE = 9;
const GENERAL_STUDENT_ROWS_PER_PAGE = 10;

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function formatDelta(val: number | null, suffix = ' pts', invertGood = false): string {
  if (val === null) return '—';
  const sign = val > 0 ? '+' : '';
  void invertGood;
  return `${sign}${val}${suffix}`;
}

function getDomainStatusBadgeClass(status: DomainAnalyticsItem['status']): string {
  if (status === 'Consolidado') return 'lr-badge lr-badge-ok';
  if (status === 'En desarrollo') return 'lr-badge lr-badge-mid';
  if (status === 'Prioritario') return 'lr-badge lr-badge-high';
  return 'lr-badge lr-badge-neutral';
}

function getPriorityBadgeClass(priority: StudentInterventionItem['priority']): string {
  if (priority === 'Alta') return 'lr-badge lr-badge-high';
  if (priority === 'Media') return 'lr-badge lr-badge-mid';
  return 'lr-badge lr-badge-ok';
}

function getSectionStatusBadgeClass(status: string): string {
  if (status === 'Completada' || status === 'Al día') return 'lr-badge lr-badge-ok';
  if (status === 'En seguimiento') return 'lr-badge lr-badge-info';
  if (status === 'Rezagada') return 'lr-badge lr-badge-mid';
  return 'lr-badge lr-badge-neutral';
}

interface LetterPageFrameProps {
  kicker: string;
  title: string;
  subtitle: string;
  periodBadge: string;
  academicYear: string;
  schoolName: string;
  district: string;
  generatedAt: string;
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
}

const LetterPageFrame: React.FC<LetterPageFrameProps> = ({
  kicker,
  title,
  subtitle,
  periodBadge,
  academicYear,
  schoolName,
  district,
  generatedAt,
  pageNumber,
  totalPages,
  children
}) => (
  <div className="letter-report-page">
    <div>
      <div className="lr-header">
        <div>
          <p className="lr-header-kicker">{kicker}</p>
          <h2 className="lr-header-title">{title}</h2>
          <p className="lr-header-sub">{subtitle}</p>
        </div>
        <div className="lr-header-right">
          <span className="lr-header-badge">{periodBadge}</span>
          <div className="lr-header-meta">Año Escolar {academicYear}</div>
        </div>
      </div>
    </div>

    <div className="lr-page-body">{children}</div>

    <div className="lr-footer">
      <span>
        {schoolName} · {district} · Documento Técnico Pedagógico (Formato Carta 8.5&quot; × 11&quot;)
      </span>
      <span>
        Corte: {generatedAt} · Página {pageNumber} de {totalPages}
      </span>
    </div>
  </div>
);

export const AnalyticalReportsView: React.FC<AnalyticalReportsViewProps> = ({
  state,
  currentUser,
  initialMode,
  onGradeChange,
  onSectionChange,
  onPeriodChange
}) => {
  const isDocente = currentUser.role === 'docente';
  const canViewGeneral = currentUser.role === 'administrador' || currentUser.role === 'coordinadora';

  const [reportMode, setReportMode] = useState<'section' | 'general'>(() => {
    if (!canViewGeneral) return 'section';
    return initialMode || 'general';
  });

  // Ensure docente always stays locked to section mode and her assigned classroom
  const effectiveMode: 'section' | 'general' = canViewGeneral ? reportMode : 'section';
  const activeGrade: GradeLevel =
    isDocente && currentUser.grade ? currentUser.grade : state.selectedGrade;
  const activeSection: string =
    isDocente && currentUser.section ? currentUser.section : state.selectedSection;
  const activePeriod = state.currentPeriod;

  const availableSections = useMemo(() => {
    const secs = Array.from(
      new Set(state.students.filter(s => s.grade === activeGrade).map(s => s.section))
    ).sort();
    return secs.length > 0 ? secs : ['A'];
  }, [state.students, activeGrade]);

  const sectionReport = useMemo(() => {
    return buildSectionAnalyticalReport(state, activeGrade, activeSection, activePeriod);
  }, [state, activeGrade, activeSection, activePeriod]);

  const generalReport = useMemo(() => {
    if (!canViewGeneral) return null;
    return buildGeneralLevelAnalyticalReport(state, activePeriod);
  }, [canViewGeneral, state, activePeriod]);

  const reportViewportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; label: string } | null>(null);

  const handleDownloadPdf = async () => {
    if (!reportViewportRef.current) return;
    try {
      setIsGeneratingPdf(true);
      setPdfProgress({ current: 1, total: 1, label: 'Preparando páginas en formato Carta...' });

      const baseName =
        effectiveMode === 'general'
          ? `Reporte_Analitico_General_Nivel_Inicial_${activePeriod}_${state.schoolInfo.academicYear}`
          : `Reporte_Analitico_${activeGrade}_Sec_${activeSection}_${activePeriod}_${state.schoolInfo.academicYear}`;

      await downloadAnalyticalReportPDF(baseName, reportViewportRef.current, progress => {
        setPdfProgress(progress);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al generar PDF analítico:', err);
      alert('No se pudo generar el PDF del reporte analítico: ' + msg);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  // Precompute pagination counts cleanly
  const sectionPagination = useMemo(() => {
    const flagged = sectionReport.flaggedStudents;
    const chunks = chunkArray(flagged, SECTION_STUDENT_ROWS_PER_PAGE);
    // Page 1: Executive + Longitudinal + Domains
    // Page 2: Critical Indicators + Strengths + Domain Reinforcement Strategies
    // Pages 3..K: Priority student chunks (at least 1 page for summary even if 0 flagged)
    // Extra Final Page if last chunk has > 4 rows (or if 0 flagged -> fits on Page 3 directly!)
    const studentPagesCount = Math.max(1, chunks.length);
    const lastChunkSize = chunks.length > 0 ? chunks[chunks.length - 1].length : 0;
    const needsSeparateActionPage = lastChunkSize > 4;
    const totalPages = 2 + studentPagesCount + (needsSeparateActionPage ? 1 : 0);
    return { chunks, studentPagesCount, needsSeparateActionPage, totalPages };
  }, [sectionReport.flaggedStudents]);

  const generalPagination = useMemo(() => {
    if (!generalReport) return { chunks: [] as StudentInterventionItem[][], totalPages: 3 };
    const chunks = chunkArray(generalReport.flaggedStudents, GENERAL_STUDENT_ROWS_PER_PAGE);
    // Page 1: Executive + Longitudinal + Grade Summaries
    // Page 2: All Sections Comparison + Institutional 6-Domain Breakdown
    // Page 3: Critical Indicators per Grade + Institutional Decisions & Signatures
    // Page 4+: Priority Students across Nivel Inicial (only if flaggedStudents > 0)
    const totalPages = 3 + chunks.length;
    return { chunks, totalPages };
  }, [generalReport]);

  const renderLongitudinalTable = (longitudinal: Record<EvaluationPeriod, PeriodSnapshot>, active: EvaluationPeriod) => {
    const periods: EvaluationPeriod[] = ['P1', 'P2', 'P3'];
    const prevKey: EvaluationPeriod | null = active === 'P2' ? 'P1' : active === 'P3' ? 'P2' : null;
    const curSnap = longitudinal[active];
    const prevSnap = prevKey ? longitudinal[prevKey] : null;

    return (
      <table className="lr-table">
        <thead>
          <tr>
            <th style={{ width: '21%' }}>Período / Corte</th>
            <th className="lr-num" style={{ width: '13%' }}>Estado</th>
            <th className="lr-num" style={{ width: '10%' }}>Avance</th>
            <th className="lr-num" style={{ width: '10%' }}>Logrado (L)</th>
            <th className="lr-num" style={{ width: '11%' }}>En Proc. (EP)</th>
            <th className="lr-num" style={{ width: '10%' }}>Iniciado (I)</th>
            <th className="lr-num" style={{ width: '11%' }}>Asistencia</th>
            <th className="lr-num" style={{ width: '14%' }}>Boletines Listos</th>
          </tr>
        </thead>
        <tbody>
          {periods.map(p => {
            const snap = longitudinal[p];
            const isCurrent = p === active;
            return (
              <tr
                key={p}
                style={isCurrent ? { backgroundColor: '#eff6ff', fontWeight: 700 } : undefined}
              >
                <td>
                  <span style={{ fontWeight: 700, color: '#0b1b3d' }}>
                    {p} · {p === 'P1' ? 'Nov' : p === 'P2' ? 'Mar' : 'Jun'}
                  </span>
                  {isCurrent && (
                    <span style={{ marginLeft: 5, fontSize: 7.5, color: '#1d4ed8', fontWeight: 800 }}>
                      (Actual)
                    </span>
                  )}
                </td>
                <td className="lr-num">
                  <span className={snap.hasData ? 'lr-badge lr-badge-ok' : 'lr-badge lr-badge-neutral'}>
                    {snap.hasData ? 'Registrado' : 'Pendiente'}
                  </span>
                </td>
                <td className="lr-num">{snap.hasData ? `${snap.progressPercent}%` : '—'}</td>
                <td className="lr-num" style={{ color: '#166534', fontWeight: 700 }}>
                  {snap.hasData ? `${snap.percentL}%` : '—'}
                </td>
                <td className="lr-num" style={{ color: '#92400e', fontWeight: 700 }}>
                  {snap.hasData ? `${snap.percentEP}%` : '—'}
                </td>
                <td className="lr-num" style={{ color: '#991b1b', fontWeight: 700 }}>
                  {snap.hasData ? `${snap.percentI}%` : '—'}
                </td>
                <td className="lr-num">
                  {snap.attendanceAvg !== null ? `${snap.attendanceAvg}%` : '—'}
                </td>
                <td className="lr-num">
                  {snap.hasData ? `${snap.readyBulletinsCount}/${snap.studentsCount}` : `0/${snap.studentsCount}`}
                </td>
              </tr>
            );
          })}
          <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
            <td colSpan={2} style={{ color: '#0b1b3d' }}>
              {prevKey ? `Variación (${active} vs ${prevKey})` : 'Referencia Comparativa Futura'}
            </td>
            <td className="lr-num">
              {prevSnap && prevSnap.hasData && curSnap.hasData
                ? formatDelta(curSnap.progressPercent - prevSnap.progressPercent, '%')
                : 'Base P1'}
            </td>
            <td className="lr-num" style={{ color: '#166534' }}>
              {prevSnap && prevSnap.hasData && curSnap.hasData
                ? formatDelta(curSnap.percentL - prevSnap.percentL)
                : 'Base'}
            </td>
            <td className="lr-num" style={{ color: '#92400e' }}>
              {prevSnap && prevSnap.hasData && curSnap.hasData
                ? formatDelta(curSnap.percentEP - prevSnap.percentEP)
                : 'Base'}
            </td>
            <td className="lr-num" style={{ color: '#991b1b' }}>
              {prevSnap && prevSnap.hasData && curSnap.hasData
                ? formatDelta(curSnap.percentI - prevSnap.percentI)
                : 'Base'}
            </td>
            <td className="lr-num">
              {prevSnap && prevSnap.attendanceAvg !== null && curSnap.attendanceAvg !== null
                ? formatDelta(curSnap.attendanceAvg - prevSnap.attendanceAvg, '%')
                : '—'}
            </td>
            <td className="lr-num" style={{ fontSize: 7.5, color: '#475569' }}>
              Comparativo P1-P3
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderDomainTable = (domains: DomainAnalyticsItem[]) => (
    <table className="lr-table">
      <thead>
        <tr>
          <th style={{ width: '25%' }}>Dominio Curricular MINERD</th>
          <th className="lr-num" style={{ width: '9%' }}>% L</th>
          <th className="lr-num" style={{ width: '9%' }}>% EP</th>
          <th className="lr-num" style={{ width: '9%' }}>% I</th>
          <th style={{ width: '20%' }}>Distribución Visual</th>
          <th className="lr-num" style={{ width: '15%' }}>Histórico %L (P1|P2|P3)</th>
          <th className="lr-num" style={{ width: '13%' }}>Diagnóstico</th>
        </tr>
      </thead>
      <tbody>
        {domains.map(d => (
          <tr key={d.domain.id}>
            <td style={{ fontWeight: 700, color: '#0f172a' }}>{d.domain.shortName}</td>
            <td className="lr-num" style={{ color: '#166534', fontWeight: 700 }}>
              {d.totalScored > 0 ? `${d.percentL}%` : '—'}
            </td>
            <td className="lr-num" style={{ color: '#92400e', fontWeight: 700 }}>
              {d.totalScored > 0 ? `${d.percentEP}%` : '—'}
            </td>
            <td className="lr-num" style={{ color: '#991b1b', fontWeight: 700 }}>
              {d.totalScored > 0 ? `${d.percentI}%` : '—'}
            </td>
            <td>
              {d.totalScored > 0 ? (
                <div className="lr-bar-track">
                  <div style={{ width: `${d.percentL}%`, backgroundColor: '#16a34a' }} />
                  <div style={{ width: `${d.percentEP}%`, backgroundColor: '#f59e0b' }} />
                  <div style={{ width: `${d.percentI}%`, backgroundColor: '#dc2626' }} />
                </div>
              ) : (
                <span style={{ fontSize: 7.5, color: '#94a3b8' }}>Sin registros</span>
              )}
            </td>
            <td className="lr-num" style={{ fontSize: 7.8, color: '#334155' }}>
              {d.p1PercentL !== null ? `${d.p1PercentL}%` : '—'} |{' '}
              {d.p2PercentL !== null ? `${d.p2PercentL}%` : '—'} |{' '}
              {d.p3PercentL !== null ? `${d.p3PercentL}%` : '—'}
            </td>
            <td className="lr-num">
              <span className={getDomainStatusBadgeClass(d.status)}>{d.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSectionReportPages = () => {
    const r = sectionReport;
    const { chunks, studentPagesCount, needsSeparateActionPage, totalPages } = sectionPagination;
    const commonHeader = {
      kicker: 'MINERD · Nivel Inicial · Informe Analítico de Cierre de Período por Sección',
      title: `Reporte Analítico de Sección: ${r.grade} "${r.section}"`,
      subtitle: `Docente Titular: ${r.teacherName} · ${PERIOD_LABELS[r.period].full}`,
      periodBadge: `Período ${r.period}`,
      academicYear: r.schoolInfo.academicYear,
      schoolName: r.schoolInfo.name,
      district: r.schoolInfo.district,
      generatedAt: r.generatedAt,
      totalPages
    };

    const actionAndSignaturesBlock = (
      <>
        <div>
          <h3 className="lr-section-title">
            Plan de Acción y Compromisos para el Próximo Período (Base Comparativa)
          </h3>
          <div className="lr-strategy-card">
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 8.8, lineHeight: 1.42, color: '#1e293b' }}>
              {r.actionCommitments.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 3 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lr-signatures">
          <div>
            <div className="lr-sig-line">{r.teacherName}</div>
            <div className="lr-sig-role">Docente Titular · {r.grade} &quot;{r.section}&quot;</div>
          </div>
          <div>
            <div className="lr-sig-line">{r.schoolInfo.coordinador}</div>
            <div className="lr-sig-role">Coordinación Pedagógica</div>
          </div>
          <div>
            <div className="lr-sig-line">{r.schoolInfo.director}</div>
            <div className="lr-sig-role">Dirección del Centro</div>
          </div>
        </div>
      </>
    );

    const pages: React.ReactNode[] = [];

    // PAGE 1: Context, KPIs, Diagnosis, Longitudinal Table & 6 Domains
    pages.push(
      <LetterPageFrame key="sec-p1" {...commonHeader} pageNumber={1}>
        <div className="lr-meta-strip">
          <div>
            <span className="lr-meta-item-label">Centro Educativo</span>
            <span className="lr-meta-item-val">{r.schoolInfo.name}</span>
          </div>
          <div>
            <span className="lr-meta-item-label">Código / Distrito</span>
            <span className="lr-meta-item-val">
              {r.schoolInfo.code} · {r.schoolInfo.district}
            </span>
          </div>
          <div>
            <span className="lr-meta-item-label">Grado y Sección</span>
            <span className="lr-meta-item-val">
              {r.grade} · Sección {r.section}
            </span>
          </div>
          <div>
            <span className="lr-meta-item-label">Matrícula / Cobertura</span>
            <span className="lr-meta-item-val">
              {r.currentSnapshot.studentsCount} alumnos · {r.currentSnapshot.workedIndicatorsCount}/
              {r.currentSnapshot.totalCurriculumIndicators} ind.
            </span>
          </div>
        </div>

        <div className="lr-kpi-grid">
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Avance de Evaluación</p>
            <div className="lr-kpi-val" style={{ color: '#0f766e' }}>
              {r.currentSnapshot.progressPercent}%
            </div>
            <div className="lr-kpi-sub">
              {r.currentSnapshot.evaluatedCount}/{r.currentSnapshot.studentsCount} alumnos evaluados
            </div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Nivel Logrado (L)</p>
            <div className="lr-kpi-val" style={{ color: '#166534' }}>
              {r.currentSnapshot.hasData ? `${r.currentSnapshot.percentL}%` : '—'}
            </div>
            <div className="lr-kpi-sub">
              EP: {r.currentSnapshot.percentEP}% · I: {r.currentSnapshot.percentI}%
            </div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Asistencia Promedio</p>
            <div className="lr-kpi-val" style={{ color: '#1e40af' }}>
              {r.currentSnapshot.attendanceAvg !== null ? `${r.currentSnapshot.attendanceAvg}%` : '—'}
            </div>
            <div className="lr-kpi-sub">
              Boletines listos: {r.currentSnapshot.readyBulletinsCount}/{r.currentSnapshot.studentsCount}
            </div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Casos para Refuerzo</p>
            <div className="lr-kpi-val" style={{ color: r.highPriorityCount > 0 ? '#991b1b' : '#0f172a' }}>
              {r.highPriorityCount + r.mediumPriorityCount}
            </div>
            <div className="lr-kpi-sub">
              Alta: {r.highPriorityCount} · Media: {r.mediumPriorityCount} · Esperado: {r.expectedCount}
            </div>
          </div>
        </div>

        <div>
          <h3 className="lr-section-title">1. Diagnóstico Pedagógico de Cierre de Período</h3>
          <div className="lr-diagnosis-box">{r.executiveDiagnosis}</div>
        </div>

        <div>
          <h3 className="lr-section-title">
            2. Matriz Comparativa Longitudinal (P1 · P2 · P3 — Línea Base)
          </h3>
          {renderLongitudinalTable(r.longitudinal, r.period)}
          <div className="lr-baseline-note" style={{ marginTop: 6 }}>
            {r.baselineComparisonNotes}
          </div>
        </div>

        <div>
          <h3 className="lr-section-title">3. Desempeño por Dominios Curriculares MINERD</h3>
          {renderDomainTable(r.domainBreakdown)}
        </div>
      </LetterPageFrame>
    );

    // PAGE 2: Critical Indicators, Strengths & Domain Strategies
    pages.push(
      <LetterPageFrame key="sec-p2" {...commonHeader} pageNumber={2}>
        <div>
          <h3 className="lr-section-title">
            4. Indicadores Prioritarios para Reforzamiento (Mayor Incidencia de I y EP)
          </h3>
          {r.criticalIndicators.length === 0 ? (
            <div className="lr-diagnosis-box">
              No se identifican indicadores con oportunidad de mejora registrados aún en {r.period}. Una vez evaluados los estudiantes en la matriz, esta tabla listará automáticamente los indicadores con mayor concentración de Iniciado (I) y En Proceso (EP).
            </div>
          ) : (
            <table className="lr-table">
              <thead>
                <tr>
                  <th style={{ width: '9%' }}>Código</th>
                  <th style={{ width: '15%' }}>Dominio</th>
                  <th style={{ width: '46%' }}>Indicador de Logro</th>
                  <th className="lr-num" style={{ width: '8%' }}>Eval.</th>
                  <th className="lr-num" style={{ width: '12%' }}>L / EP / I</th>
                  <th className="lr-num" style={{ width: '10%' }}>% Mejora</th>
                </tr>
              </thead>
              <tbody>
                {r.criticalIndicators.map(ind => (
                  <tr key={ind.id}>
                    <td style={{ fontWeight: 700, color: '#0b1b3d' }}>{ind.code}</td>
                    <td style={{ fontWeight: 600 }}>{ind.domainShortName}</td>
                    <td>{ind.shortText || ind.text}</td>
                    <td className="lr-num">{ind.evaluatedStudents}</td>
                    <td className="lr-num">
                      <span style={{ color: '#166534', fontWeight: 700 }}>{ind.countL}</span> /{' '}
                      <span style={{ color: '#92400e', fontWeight: 700 }}>{ind.countEP}</span> /{' '}
                      <span style={{ color: '#991b1b', fontWeight: 700 }}>{ind.countI}</span>
                    </td>
                    <td className="lr-num">
                      <span className={ind.countI > 0 ? 'lr-badge lr-badge-high' : 'lr-badge lr-badge-mid'}>
                        {ind.opportunityPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 className="lr-section-title">5. Principales Fortalezas Consolidadas del Grupo</h3>
          {r.strengthIndicators.length === 0 ? (
            <div className="lr-diagnosis-box">Sin indicadores evaluados en {r.period} todavía.</div>
          ) : (
            <table className="lr-table">
              <thead>
                <tr>
                  <th style={{ width: '9%' }}>Código</th>
                  <th style={{ width: '15%' }}>Dominio</th>
                  <th style={{ width: '54%' }}>Indicador Consolidado</th>
                  <th className="lr-num" style={{ width: '12%' }}>L / EP / I</th>
                  <th className="lr-num" style={{ width: '10%' }}>% Logro</th>
                </tr>
              </thead>
              <tbody>
                {r.strengthIndicators.map(ind => (
                  <tr key={ind.id}>
                    <td style={{ fontWeight: 700, color: '#0b1b3d' }}>{ind.code}</td>
                    <td style={{ fontWeight: 600 }}>{ind.domainShortName}</td>
                    <td>{ind.shortText || ind.text}</td>
                    <td className="lr-num">
                      {ind.countL} / {ind.countEP} / {ind.countI}
                    </td>
                    <td className="lr-num">
                      <span className="lr-badge lr-badge-ok">{ind.percentL}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 className="lr-section-title">
            6. Estrategias de Reforzamiento Pedagógico por Dominio Prioritario
          </h3>
          {r.priorityDomainsForAction.length === 0 ? (
            <div className="lr-diagnosis-box">
              Las orientaciones didácticas por dominio se generarán automáticamente al iniciar el registro de indicadores de la sección.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {r.priorityDomainsForAction.map(dom => (
                <div key={dom.domain.id} className="lr-strategy-card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 3
                    }}
                  >
                    <span style={{ fontSize: 9.2, fontWeight: 800, color: '#0b1b3d' }}>
                      {dom.domain.name}
                    </span>
                    <span style={{ fontSize: 8.2, fontWeight: 700, color: '#475569' }}>
                      L: {dom.percentL}% · EP: {dom.percentEP}% · I: {dom.percentI}%
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 8.5, lineHeight: 1.35, color: '#334155' }}>
                    {dom.reinforcementStrategy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </LetterPageFrame>
    );

    // PAGE 3..N: Priority Student Interventions
    if (chunks.length === 0) {
      pages.push(
        <LetterPageFrame key="sec-p3" {...commonHeader} pageNumber={3}>
          <div>
            <h3 className="lr-section-title">
              7. Seguimiento Nominal de Estudiantes con Necesidad de Apoyo o Intervención
            </h3>
            <div className="lr-diagnosis-box">
              {r.currentSnapshot.hasData
                ? `Los ${r.currentSnapshot.studentsCount} estudiante(s) de ${r.grade} "${r.section}" evaluados en ${r.period} se encuentran en rango Esperado (sin alertas críticas de indicadores en Iniciado ni baja asistencia). Se recomienda mantener el acompañamiento lúdico habitual y el diálogo positivo con las familias.`
                : `No se registran alertas estudiantiles porque la sección aún no cuenta con calificaciones cargadas en ${r.period}.`}
            </div>
          </div>
          {actionAndSignaturesBlock}
        </LetterPageFrame>
      );
    } else {
      chunks.forEach((chunk, chunkIdx) => {
        const pageNum = 3 + chunkIdx;
        const isLastChunk = chunkIdx === studentPagesCount - 1;
        const includeActionsHere = isLastChunk && !needsSeparateActionPage;

        pages.push(
          <LetterPageFrame key={`sec-p${pageNum}`} {...commonHeader} pageNumber={pageNum}>
            <div>
              <h3 className="lr-section-title">
                7. Seguimiento Nominal e Intervenciones Focalizadas{' '}
                {chunks.length > 1 ? `(Parte ${chunkIdx + 1} de ${chunks.length})` : ''}
              </h3>
              <table className="lr-table">
                <thead>
                  <tr>
                    <th className="lr-num" style={{ width: '4%' }}>#</th>
                    <th style={{ width: '21%' }}>Estudiante</th>
                    <th className="lr-num" style={{ width: '11%' }}>L / EP / I</th>
                    <th className="lr-num" style={{ width: '7%' }}>Asist.</th>
                    <th className="lr-num" style={{ width: '9%' }}>Prioridad</th>
                    <th style={{ width: '18%' }}>Motivo / Dominios</th>
                    <th style={{ width: '30%' }}>Intervención Pedagógica Sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((st, idx) => (
                    <tr key={st.student.id}>
                      <td className="lr-num" style={{ fontWeight: 700, color: '#475569' }}>
                        {chunkIdx * SECTION_STUDENT_ROWS_PER_PAGE + idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.student.fullName}</div>
                        <div style={{ fontSize: 7.5, color: '#64748b' }}>
                          {st.student.age} años · {st.scoredCount}/{st.expectedIndicators} ind.
                        </div>
                      </td>
                      <td className="lr-num">
                        <span style={{ color: '#166534', fontWeight: 700 }}>{st.countL}</span> /{' '}
                        <span style={{ color: '#92400e', fontWeight: 700 }}>{st.countEP}</span> /{' '}
                        <span style={{ color: '#991b1b', fontWeight: 700 }}>{st.countI}</span>
                      </td>
                      <td className="lr-num">
                        {st.attendancePercent !== null ? `${st.attendancePercent}%` : '—'}
                      </td>
                      <td className="lr-num">
                        <span className={getPriorityBadgeClass(st.priority)}>{st.priority}</span>
                      </td>
                      <td style={{ fontSize: 7.8 }}>
                        <div>{st.reasons.join(' · ') || 'Seguimiento'}</div>
                        {st.weakDomains.length > 0 && (
                          <div style={{ color: '#475569', fontWeight: 600 }}>
                            Foco: {st.weakDomains.join(', ')}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 7.9, color: '#1e293b' }}>{st.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {includeActionsHere && actionAndSignaturesBlock}
          </LetterPageFrame>
        );
      });

      if (needsSeparateActionPage) {
        pages.push(
          <LetterPageFrame key="sec-final" {...commonHeader} pageNumber={totalPages}>
            <div>
              <h3 className="lr-section-title">8. Síntesis de Cobertura Estudiantil de la Sección</h3>
              <div className="lr-meta-strip" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div>
                  <span className="lr-meta-item-label">Prioridad Alta</span>
                  <span className="lr-meta-item-val" style={{ color: '#991b1b' }}>
                    {r.highPriorityCount} estudiante(s)
                  </span>
                </div>
                <div>
                  <span className="lr-meta-item-label">Prioridad Media</span>
                  <span className="lr-meta-item-val" style={{ color: '#92400e' }}>
                    {r.mediumPriorityCount} estudiante(s)
                  </span>
                </div>
                <div>
                  <span className="lr-meta-item-label">Desempeño Esperado</span>
                  <span className="lr-meta-item-val" style={{ color: '#166534' }}>
                    {r.expectedCount} estudiante(s)
                  </span>
                </div>
              </div>
            </div>
            {actionAndSignaturesBlock}
          </LetterPageFrame>
        );
      }
    }

    return pages;
  };

  const renderGeneralReportPages = () => {
    if (!generalReport) return null;
    const g = generalReport;
    const { chunks, totalPages } = generalPagination;

    const commonHeader = {
      kicker: 'MINERD · Dirección y Coordinación de Nivel Inicial · Informe Institucional',
      title: 'Reporte Analítico General de Desempeño del Nivel Inicial',
      subtitle: `${g.schoolInfo.name} · ${PERIOD_LABELS[g.period].full}`,
      periodBadge: `Período ${g.period}`,
      academicYear: g.schoolInfo.academicYear,
      schoolName: g.schoolInfo.name,
      district: g.schoolInfo.district,
      generatedAt: g.generatedAt,
      totalPages
    };

    const gradesList: GradeLevel[] = ['Prekínder', 'Kínder', 'Preprimario'];

    const pages: React.ReactNode[] = [];

    // PAGE 1: Institutional Synthesis + Longitudinal P1-P2-P3 + Grade Summaries
    pages.push(
      <LetterPageFrame key="gen-p1" {...commonHeader} pageNumber={1}>
        <div className="lr-meta-strip">
          <div>
            <span className="lr-meta-item-label">Centro Educativo</span>
            <span className="lr-meta-item-val">{g.schoolInfo.name}</span>
          </div>
          <div>
            <span className="lr-meta-item-label">Distrito / Regional</span>
            <span className="lr-meta-item-val">
              {g.schoolInfo.district} · {g.schoolInfo.regional}
            </span>
          </div>
          <div>
            <span className="lr-meta-item-label">Coordinación / Dirección</span>
            <span className="lr-meta-item-val">{g.schoolInfo.coordinador}</span>
          </div>
          <div>
            <span className="lr-meta-item-label">Cobertura Institucional</span>
            <span className="lr-meta-item-val">
              {g.totalSections} secciones · {g.totalStudents} estudiantes
            </span>
          </div>
        </div>

        <div className="lr-kpi-grid">
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Avance Global de Registro</p>
            <div className="lr-kpi-val" style={{ color: '#0f766e' }}>
              {g.currentSnapshot.progressPercent}%
            </div>
            <div className="lr-kpi-sub">
              {g.currentSnapshot.readyBulletinsCount}/{g.totalStudents} boletines listos
            </div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Logro Global (L)</p>
            <div className="lr-kpi-val" style={{ color: '#166534' }}>
              {g.currentSnapshot.hasData ? `${g.currentSnapshot.percentL}%` : '—'}
            </div>
            <div className="lr-kpi-sub">
              EP: {g.currentSnapshot.percentEP}% · I: {g.currentSnapshot.percentI}%
            </div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Asistencia Global</p>
            <div className="lr-kpi-val" style={{ color: '#1e40af' }}>
              {g.currentSnapshot.attendanceAvg !== null ? `${g.currentSnapshot.attendanceAvg}%` : '—'}
            </div>
            <div className="lr-kpi-sub">Meta institucional MINERD ≥ 90%</div>
          </div>
          <div className="lr-kpi-card">
            <p className="lr-kpi-label">Estudiantes Prioritarios</p>
            <div className="lr-kpi-val" style={{ color: g.highPriorityCount > 0 ? '#991b1b' : '#0f172a' }}>
              {g.highPriorityCount + g.mediumPriorityCount}
            </div>
            <div className="lr-kpi-sub">
              Prioridad Alta: {g.highPriorityCount} · Media: {g.mediumPriorityCount}
            </div>
          </div>
        </div>

        <div>
          <h3 className="lr-section-title">1. Diagnóstico Ejecutivo del Nivel Inicial</h3>
          <div className="lr-diagnosis-box">{g.executiveDiagnosis}</div>
        </div>

        <div>
          <h3 className="lr-section-title">
            2. Matriz Comparativa Longitudinal del Nivel (P1 · P2 · P3 — Línea Base)
          </h3>
          {renderLongitudinalTable(g.longitudinal, g.period)}
          <div className="lr-baseline-note" style={{ marginTop: 6 }}>
            {g.baselineComparisonNotes}
          </div>
        </div>

        <div>
          <h3 className="lr-section-title">3. Consolidado Comparativo por Grado</h3>
          <table className="lr-table">
            <thead>
              <tr>
                <th style={{ width: '17%' }}>Grado</th>
                <th className="lr-num" style={{ width: '9%' }}>Secc.</th>
                <th className="lr-num" style={{ width: '10%' }}>Matrícula</th>
                <th className="lr-num" style={{ width: '10%' }}>Avance</th>
                <th className="lr-num" style={{ width: '16%' }}>%L / %EP / %I</th>
                <th className="lr-num" style={{ width: '18%' }}>Histórico %L (P1|P2|P3)</th>
                <th className="lr-num" style={{ width: '9%' }}>Asist.</th>
                <th className="lr-num" style={{ width: '11%' }}>Alertas A/M</th>
              </tr>
            </thead>
            <tbody>
              {g.gradeSummaries.map(gr => (
                <tr key={gr.grade}>
                  <td style={{ fontWeight: 700, color: '#0b1b3d' }}>{gr.grade}</td>
                  <td className="lr-num">{gr.sectionsCount}</td>
                  <td className="lr-num">{gr.studentsCount}</td>
                  <td className="lr-num" style={{ fontWeight: 700 }}>{gr.progressPercent}%</td>
                  <td className="lr-num">
                    <span style={{ color: '#166534', fontWeight: 700 }}>{gr.percentL}%</span> /{' '}
                    <span style={{ color: '#92400e' }}>{gr.percentEP}%</span> /{' '}
                    <span style={{ color: '#991b1b', fontWeight: 700 }}>{gr.percentI}%</span>
                  </td>
                  <td className="lr-num" style={{ fontSize: 7.8 }}>
                    {gr.p1PercentL !== null ? `${gr.p1PercentL}%` : '—'} |{' '}
                    {gr.p2PercentL !== null ? `${gr.p2PercentL}%` : '—'} |{' '}
                    {gr.p3PercentL !== null ? `${gr.p3PercentL}%` : '—'}
                  </td>
                  <td className="lr-num">{gr.attendanceAvg !== null ? `${gr.attendanceAvg}%` : '—'}</td>
                  <td className="lr-num">
                    <span style={{ color: '#991b1b', fontWeight: 700 }}>{gr.highPriorityCount}</span> /{' '}
                    <span style={{ color: '#92400e', fontWeight: 700 }}>{gr.mediumPriorityCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LetterPageFrame>
    );

    // PAGE 2: Classroom-by-Classroom Comparison + Institutional 6-Domain Breakdown
    pages.push(
      <LetterPageFrame key="gen-p2" {...commonHeader} pageNumber={2}>
        <div>
          <h3 className="lr-section-title">
            4. Comparativo de Cumplimiento y Desempeño por Sección / Aula
          </h3>
          <table className="lr-table">
            <thead>
              <tr>
                <th style={{ width: '17%' }}>Grado y Sección</th>
                <th style={{ width: '20%' }}>Docente Titular</th>
                <th className="lr-num" style={{ width: '7%' }}>Alum.</th>
                <th className="lr-num" style={{ width: '9%' }}>Avance</th>
                <th className="lr-num" style={{ width: '15%' }}>%L / %EP / %I</th>
                <th className="lr-num" style={{ width: '8%' }}>Asist.</th>
                <th className="lr-num" style={{ width: '9%' }}>Boletines</th>
                <th className="lr-num" style={{ width: '7%' }}>A/M</th>
                <th className="lr-num" style={{ width: '8%' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {g.classroomRows.map(row => (
                <tr key={`${row.grade}-${row.section}`}>
                  <td style={{ fontWeight: 700, color: '#0b1b3d' }}>
                    {row.grade} &quot;{row.section}&quot;
                  </td>
                  <td>{row.teacherName}</td>
                  <td className="lr-num">{row.studentsCount}</td>
                  <td className="lr-num" style={{ fontWeight: 700 }}>{row.progressPercent}%</td>
                  <td className="lr-num">
                    {row.percentL + row.percentEP + row.percentI > 0 ? (
                      <>
                        <span style={{ color: '#166534', fontWeight: 700 }}>{row.percentL}%</span>/
                        <span style={{ color: '#92400e' }}>{row.percentEP}%</span>/
                        <span style={{ color: '#991b1b', fontWeight: 700 }}>{row.percentI}%</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="lr-num">{row.attendanceAvg !== null ? `${row.attendanceAvg}%` : '—'}</td>
                  <td className="lr-num">
                    {row.readyBulletinsCount}/{row.studentsCount}
                  </td>
                  <td className="lr-num">
                    {row.highPriorityCount}/{row.mediumPriorityCount}
                  </td>
                  <td className="lr-num">
                    <span className={getSectionStatusBadgeClass(row.status)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="lr-section-title">
            5. Balance Curricular Institucional por Dominios del Nivel Inicial
          </h3>
          {renderDomainTable(g.domainBreakdown)}
        </div>
      </LetterPageFrame>
    );

    // PAGE 3: Critical Indicators by Grade + Institutional Decisions & Official Signatures
    pages.push(
      <LetterPageFrame key="gen-p3" {...commonHeader} pageNumber={3}>
        <div>
          <h3 className="lr-section-title">
            6. Indicadores Prioritarios de Reforzamiento por Grado ({g.period})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {gradesList.map(grade => {
              const items: IndicatorAnalyticsItem[] = g.criticalIndicatorsByGrade[grade] || [];
              return (
                <div key={grade} className="lr-strategy-card">
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#0b1b3d', marginBottom: 4 }}>
                    {grade} · Top Indicadores con Mayor Incidencia de I y EP
                  </div>
                  {items.length === 0 ? (
                    <div style={{ fontSize: 8.2, color: '#64748b' }}>
                      Sin indicadores evaluados con rezago registrado en {grade} durante {g.period}.
                    </div>
                  ) : (
                    <table className="lr-table">
                      <thead>
                        <tr>
                          <th style={{ width: '10%' }}>Código</th>
                          <th style={{ width: '16%' }}>Dominio</th>
                          <th style={{ width: '52%' }}>Indicador</th>
                          <th className="lr-num" style={{ width: '12%' }}>L / EP / I</th>
                          <th className="lr-num" style={{ width: '10%' }}>% Mejora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(ind => (
                          <tr key={ind.id}>
                            <td style={{ fontWeight: 700 }}>{ind.code}</td>
                            <td>{ind.domainShortName}</td>
                            <td>{ind.shortText || ind.text}</td>
                            <td className="lr-num">
                              {ind.countL}/{ind.countEP}/{ind.countI}
                            </td>
                            <td className="lr-num">
                              <span className={ind.countI > 0 ? 'lr-badge lr-badge-high' : 'lr-badge lr-badge-mid'}>
                                {ind.opportunityPercent}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="lr-section-title">
            7. Decisiones Institucionales de Reforzamiento, Acompañamiento y Línea Base
          </h3>
          <div className="lr-strategy-card">
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 8.7, lineHeight: 1.4, color: '#1e293b' }}>
              {g.institutionalDecisions.map((dec, idx) => (
                <li key={idx} style={{ marginBottom: 3 }}>
                  {dec}
                </li>
              ))}
            </ul>
            {g.flaggedStudents.length === 0 && g.currentSnapshot.hasData && (
              <p style={{ margin: '6px 0 0 0', fontSize: 8.4, fontWeight: 700, color: '#166534' }}>
                Nota de Seguimiento Estudiantil: No se identifican estudiantes en prioridad Alta o Media al corte actual.
              </p>
            )}
          </div>
        </div>

        <div className="lr-signatures" style={{ gridTemplateColumns: 'repeat(2, 1fr)', paddingTop: 18 }}>
          <div>
            <div className="lr-sig-line" style={{ width: '75%', margin: '0 auto' }}>
              {g.schoolInfo.coordinador}
            </div>
            <div className="lr-sig-role">Coordinación Pedagógica del Nivel Inicial</div>
          </div>
          <div>
            <div className="lr-sig-line" style={{ width: '75%', margin: '0 auto' }}>
              {g.schoolInfo.director}
            </div>
            <div className="lr-sig-role">Dirección del Centro Educativo</div>
          </div>
        </div>
      </LetterPageFrame>
    );

    // PAGE 4+: Consolidated Priority Student Cases Across All Sections
    chunks.forEach((chunk, chunkIdx) => {
      const pageNum = 4 + chunkIdx;
      pages.push(
        <LetterPageFrame key={`gen-p${pageNum}`} {...commonHeader} pageNumber={pageNum}>
          <div>
            <h3 className="lr-section-title">
              8. Nómina Consolidada de Estudiantes Prioritarios del Nivel Inicial{' '}
              {chunks.length > 1 ? `(Parte ${chunkIdx + 1} de ${chunks.length})` : ''}
            </h3>
            <table className="lr-table">
              <thead>
                <tr>
                  <th className="lr-num" style={{ width: '4%' }}>#</th>
                  <th style={{ width: '21%' }}>Estudiante</th>
                  <th style={{ width: '13%' }}>Grado / Docente</th>
                  <th className="lr-num" style={{ width: '10%' }}>L / EP / I</th>
                  <th className="lr-num" style={{ width: '7%' }}>Asist.</th>
                  <th className="lr-num" style={{ width: '8%' }}>Prior.</th>
                  <th style={{ width: '16%' }}>Motivo / Dominios</th>
                  <th style={{ width: '21%' }}>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((st, idx) => (
                  <tr key={st.student.id}>
                    <td className="lr-num" style={{ fontWeight: 700, color: '#475569' }}>
                      {chunkIdx * GENERAL_STUDENT_ROWS_PER_PAGE + idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.student.fullName}</div>
                      <div style={{ fontSize: 7.4, color: '#64748b' }}>
                        {st.student.age} años · {st.scoredCount}/{st.expectedIndicators} ind.
                      </div>
                    </td>
                    <td style={{ fontSize: 7.8 }}>
                      <div style={{ fontWeight: 700, color: '#0b1b3d' }}>
                        {st.grade} &quot;{st.section}&quot;
                      </div>
                      <div style={{ color: '#64748b' }}>{st.teacherName}</div>
                    </td>
                    <td className="lr-num">
                      <span style={{ color: '#166534', fontWeight: 700 }}>{st.countL}</span>/
                      <span style={{ color: '#92400e', fontWeight: 700 }}>{st.countEP}</span>/
                      <span style={{ color: '#991b1b', fontWeight: 700 }}>{st.countI}</span>
                    </td>
                    <td className="lr-num">
                      {st.attendancePercent !== null ? `${st.attendancePercent}%` : '—'}
                    </td>
                    <td className="lr-num">
                      <span className={getPriorityBadgeClass(st.priority)}>{st.priority}</span>
                    </td>
                    <td style={{ fontSize: 7.6 }}>
                      <div>{st.reasons.join(' · ') || 'Seguimiento'}</div>
                      {st.weakDomains.length > 0 && (
                        <div style={{ color: '#475569', fontWeight: 600 }}>
                          Foco: {st.weakDomains.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 7.6, color: '#1e293b' }}>{st.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LetterPageFrame>
      );
    });

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Control Toolbar (non-printable) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#0b1b3d] text-white shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Reportes Analíticos de Fin de Período
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Diagnóstico de logros, comparativo longitudinal P1–P2–P3 y seguimiento para decisiones de reforzamiento. Exportación directa en papel Carta (8.5&quot; × 11&quot;).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canViewGeneral && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setReportMode('general')}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    effectiveMode === 'general'
                      ? 'bg-[#0b1b3d] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>General del Nivel</span>
                </button>
                <button
                  onClick={() => setReportMode('section')}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    effectiveMode === 'section'
                      ? 'bg-[#0b1b3d] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Por Sección</span>
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF (Carta)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Context Selectors Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-bold px-2 text-[11px]">Corte:</span>
              {(['P1', 'P2', 'P3'] as EvaluationPeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap ${
                    activePeriod === p
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {PERIOD_LABELS[p].short}
                </button>
              ))}
            </div>

            {/* Classroom Selector (only when in Section Mode) */}
            {effectiveMode === 'section' && (
              isDocente ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Sección Asignada: {activeGrade} &quot;{activeSection}&quot;
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-bold px-1.5 text-[11px]">Sección:</span>
                  <select
                    value={activeGrade}
                    onChange={e => onGradeChange(e.target.value as GradeLevel)}
                    className="bg-white px-2.5 py-1 rounded-md border border-slate-300 font-bold text-slate-800 text-xs"
                  >
                    <option value="Prekínder">Prekínder (3a)</option>
                    <option value="Kínder">Kínder (4a)</option>
                    <option value="Preprimario">Preprimario (5a)</option>
                  </select>
                  <select
                    value={activeSection}
                    onChange={e => onSectionChange(e.target.value)}
                    className="bg-white px-2.5 py-1 rounded-md border border-slate-300 font-bold text-slate-800 text-xs"
                  >
                    {availableSections.map(sec => (
                      <option key={sec} value={sec}>
                        Sección {sec}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {effectiveMode === 'general'
                  ? `Vista General del Nivel · ${generalPagination.totalPages} páginas Carta`
                  : `Vista de Sección · ${sectionPagination.totalPages} páginas Carta`}
              </span>
            </span>
          </div>
        </div>

        {/* PDF Progress Indicator */}
        {isGeneratingPdf && pdfProgress && (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 text-xs text-teal-900">
            <div className="flex items-center gap-2 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
              <span>{pdfProgress.label}</span>
            </div>
            <span className="font-bold tabular-nums">
              {pdfProgress.current} / {pdfProgress.total}
            </span>
          </div>
        )}
      </div>

      {/* Quick Live Overview Cards (screen only) */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold">Formato Exacto de Impresión</p>
            <p className="font-bold text-slate-900 mt-0.5">
              Papel Carta Vertical (8.5&quot; × 11&quot;) sin desbordamientos
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold">Análisis Comparativo P1 · P2 · P3</p>
            <p className="font-bold text-slate-900 mt-0.5">
              Línea base y variación automática entre períodos
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold">Decisiones de Intervención</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {effectiveMode === 'general' && generalReport
                ? `${generalReport.highPriorityCount} prioridad Alta · ${generalReport.mediumPriorityCount} prioridad Media`
                : `${sectionReport.highPriorityCount} prioridad Alta · ${sectionReport.mediumPriorityCount} prioridad Media`}
            </p>
          </div>
        </div>
      </div>

      {/* Letter-Portrait Pages Preview & Export Container */}
      <div className="overflow-x-auto pb-4">
        <div ref={reportViewportRef} className="letter-report-viewport">
          {effectiveMode === 'general' && canViewGeneral
            ? renderGeneralReportPages()
            : renderSectionReportPages()}
        </div>
      </div>
    </div>
  );
};
