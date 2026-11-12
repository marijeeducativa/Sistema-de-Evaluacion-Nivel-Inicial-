import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, GradeLevel } from '../types';

/**
 * Sanitizes a string for safe use in file names
 */
function sanitizeFileName(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

/**
 * Renders an HTML element onto canvas with high resolution for print
 */
async function captureSheetToCanvas(sheetEl: HTMLElement): Promise<HTMLCanvasElement> {
  return await html2canvas(sheetEl, {
    scale: 2, // 2x DPI for crisp typography and lines
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1056, // 11in at 96 DPI
    windowHeight: 816, // 8.5in at 96 DPI
    onclone: (clonedDoc, clonedElement) => {
      // Ensure cloned sheet is visible and styled properly
      (clonedElement as HTMLElement).style.display = 'grid';
      (clonedElement as HTMLElement).style.width = '11in';
      (clonedElement as HTMLElement).style.minHeight = '8.5in';
      (clonedElement as HTMLElement).style.maxHeight = '8.5in';
      (clonedElement as HTMLElement).style.margin = '0';
      (clonedElement as HTMLElement).style.boxShadow = 'none';
    }
  });
}

/**
 * Generates and downloads a 2-page PDF for a single student
 */
export async function downloadSingleReportCardPDF(
  student: Student,
  grade: GradeLevel,
  section: string,
  element: HTMLElement,
  onProgress?: (msg: string) => void
): Promise<void> {
  onProgress?.('Preparando documento PDF...');

  const sheets = element.querySelectorAll<HTMLElement>('.sheet');
  if (sheets.length < 2) {
    throw new Error('No se encontraron las dos hojas del boletín para generar el PDF.');
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter', // 11 x 8.5 inches
    compress: true
  });

  // Sheet 1: Exterior (Portada + Contraportada)
  onProgress?.('Generando carátula y página exterior (1/2)...');
  const canvas1 = await captureSheetToCanvas(sheets[0]);
  const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData1, 'JPEG', 0, 0, 11, 8.5, undefined, 'FAST');

  // Sheet 2: Interior (Indicadores + Observaciones)
  onProgress?.('Generando matriz de indicadores interior (2/2)...');
  const canvas2 = await captureSheetToCanvas(sheets[1]);
  const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
  pdf.addPage('letter', 'landscape');
  pdf.addImage(imgData2, 'JPEG', 0, 0, 11, 8.5, undefined, 'FAST');

  const cleanName = sanitizeFileName(student.fullName);
  const cleanGrade = sanitizeFileName(grade);
  const fileName = `Boletin_${cleanName}_${cleanGrade}_Sec_${section}.pdf`;

  onProgress?.('Descargando archivo PDF...');
  pdf.save(fileName);
}

/**
 * Generates and downloads a consolidated multi-page PDF for all students in a classroom
 */
export async function downloadBatchReportCardsPDF(
  students: Student[],
  grade: GradeLevel,
  section: string,
  containerElement: HTMLElement,
  onProgress?: (progress: { current: number; total: number; studentName: string }) => void
): Promise<void> {
  const studentContainers = containerElement.querySelectorAll<HTMLElement>('.report-card-print-container');
  if (studentContainers.length === 0) {
    throw new Error('No se encontraron boletines para generar el paquete PDF.');
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'letter',
    compress: true
  });

  let isFirstPage = true;

  for (let i = 0; i < studentContainers.length; i++) {
    const studentContainer = studentContainers[i];
    const student = students[i] || { fullName: `Estudiante_${i + 1}` };

    onProgress?.({
      current: i + 1,
      total: studentContainers.length,
      studentName: student.fullName
    });

    const sheets = studentContainer.querySelectorAll<HTMLElement>('.sheet');
    if (sheets.length < 2) continue;

    // Sheet 1 (Exterior)
    const canvas1 = await captureSheetToCanvas(sheets[0]);
    const imgData1 = canvas1.toDataURL('image/jpeg', 0.92);

    if (!isFirstPage) {
      pdf.addPage('letter', 'landscape');
    }
    pdf.addImage(imgData1, 'JPEG', 0, 0, 11, 8.5, undefined, 'FAST');
    isFirstPage = false;

    // Sheet 2 (Interior)
    const canvas2 = await captureSheetToCanvas(sheets[1]);
    const imgData2 = canvas2.toDataURL('image/jpeg', 0.92);

    pdf.addPage('letter', 'landscape');
    pdf.addImage(imgData2, 'JPEG', 0, 0, 11, 8.5, undefined, 'FAST');

    // Yield back to event loop so browser UI / progress bar updates smoothly
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  const cleanGrade = sanitizeFileName(grade);
  const fileName = `Boletines_Oficiales_${cleanGrade}_Sec_${section}_Completo.pdf`;
  pdf.save(fileName);
}
