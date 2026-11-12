import * as XLSX from 'xlsx';
import { AppState, EvaluationPeriod, GradeLevel } from '../types';
import { getIndicatorsByGrade } from '../data/minerdCurriculum';

export function exportSectionSheetToExcel(
  state: AppState,
  grade: GradeLevel,
  section: string,
  period: EvaluationPeriod
): void {
  const students = state.students
    .filter(s => s.grade === grade && s.section === section)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const indicators = getIndicatorsByGrade(grade);
  const teacher = state.teachers.find(t => t.grade === grade && t.section === section);

  // 1. Data Rows
  const rows: any[] = [];

  students.forEach((student, idx) => {
    const evalRecord = state.evaluations[student.id];
    const periodEval = evalRecord ? evalRecord[period] : null;
    const scores = periodEval?.scores || {};

    let countL = 0;
    let countEP = 0;
    let countI = 0;
    let countPending = 0;

    const rowObj: Record<string, any> = {
      'No.': idx + 1,
      'Estudiante': student.fullName,
      'Edad': `${student.age} Años`,
      'Sexo': student.gender || 'N/D'
    };

    indicators.forEach((ind) => {
      const score = scores[ind.id] || '';
      rowObj[`[${ind.code}] ${ind.shortText}`] = score || '-';
      if (score === 'L') countL++;
      else if (score === 'EP') countEP++;
      else if (score === 'I') countI++;
      else countPending++;
    });

    const totalEvaluated = countL + countEP + countI;
    const totalIndicators = indicators.length;
    const percentL = totalEvaluated > 0 ? Math.round((countL / totalEvaluated) * 100) : 0;
    const percentEP = totalEvaluated > 0 ? Math.round((countEP / totalEvaluated) * 100) : 0;
    const percentI = totalEvaluated > 0 ? Math.round((countI / totalEvaluated) * 100) : 0;
    const progress = Math.round((totalEvaluated / totalIndicators) * 100);

    rowObj['Total L (Logrado)'] = countL;
    rowObj['Total EP (En Proceso)'] = countEP;
    rowObj['Total I (Iniciado)'] = countI;
    rowObj['Pendientes'] = countPending;
    rowObj['% Avance Llenado'] = `${progress}%`;
    rowObj['% Logro (L)'] = `${percentL}%`;
    rowObj['% En Proceso (EP)'] = `${percentEP}%`;
    rowObj['% Iniciado (I)'] = `${percentI}%`;
    rowObj['Observaciones Cualitativas - Fortalezas'] = periodEval?.observations.strengths || '';
    rowObj['Observaciones Cualitativas - Recomendaciones'] = periodEval?.observations.recommendations || '';

    rows.push(rowObj);
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-adjust column widths
  const colWidths = [
    { wch: 5 },  // No.
    { wch: 35 }, // Estudiante
    { wch: 8 },  // Edad
    { wch: 6 },  // Sexo
  ];
  indicators.forEach(() => colWidths.push({ wch: 18 }));
  colWidths.push({ wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 40 });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${grade} ${section} - ${period}`);

  // Add Summary Sheet
  const summaryRows = [
    { 'Parámetro': 'Centro Educativo', 'Valor': state.schoolInfo.name },
    { 'Parámetro': 'Código de Centro', 'Valor': state.schoolInfo.code },
    { 'Parámetro': 'Regional / Distrito', 'Valor': `${state.schoolInfo.regional} - ${state.schoolInfo.district}` },
    { 'Parámetro': 'Año Escolar', 'Valor': state.schoolInfo.academicYear },
    { 'Parámetro': 'Grado y Sección', 'Valor': `${grade} - Sección ${section}` },
    { 'Parámetro': 'Docente Titular', 'Valor': teacher?.name || 'No asignado' },
    { 'Parámetro': 'Período Evaluativo', 'Valor': period === 'P1' ? 'P1 (Agosto - Diciembre)' : period === 'P2' ? 'P2 (Enero - Marzo)' : 'P3 (Abril - Junio)' },
    { 'Parámetro': 'Total de Estudiantes Matriculados', 'Valor': students.length },
    { 'Parámetro': 'Total Indicadores del Grado', 'Valor': indicators.length },
    { 'Parámetro': 'Fecha de Generación', 'Valor': new Date().toLocaleString('es-DO') }
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  summaryWs['!cols'] = [{ wch: 35 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ficha Resumen');

  const fileName = `MINERD_${grade.replace(/\s+/g, '')}_Sec${section}_${period}_${state.schoolInfo.code}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportCumulativeSheetToExcel(
  state: AppState,
  grade: GradeLevel,
  section: string
): void {
  const students = state.students
    .filter(s => s.grade === grade && s.section === section)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const indicators = getIndicatorsByGrade(grade);
  const rows: any[] = [];

  students.forEach((student, idx) => {
    const record = state.evaluations[student.id];

    indicators.forEach((ind) => {
      const p1Score = record?.P1.scores[ind.id] || '-';
      const p2Score = record?.P2.scores[ind.id] || '-';
      const p3Score = record?.P3.scores[ind.id] || '-';

      rows.push({
        'No.': idx + 1,
        'Estudiante': student.fullName,
        'Grado': student.grade,
        'Sección': student.section,
        'Código Indicador': ind.code,
        'Indicador': ind.text,
        'P1 (Ago-Dic)': p1Score,
        'P2 (Ene-Mar)': p2Score,
        'P3 (Abr-Jun)': p3Score,
        'Estado Final Año': p3Score !== '-' ? p3Score : p2Score !== '-' ? p2Score : p1Score
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 12 },
    { wch: 8 },
    { wch: 16 },
    { wch: 50 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Acumulado ${grade} ${section}`);
  XLSX.writeFile(wb, `MINERD_Acumulativo_${grade.replace(/\s+/g, '')}_Sec${section}.xlsx`);
}
