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

/**
 * Converts any modern CSS color (oklch, oklab, color-mix) to standard hex/rgba for html2canvas 1.4.1
 */
function normalizeCssColorForCanvas(colorVal: string, ctx: CanvasRenderingContext2D | null): string {
  if (!colorVal || (!colorVal.includes('oklch') && !colorVal.includes('oklab') && !colorVal.includes('color-mix'))) {
    return colorVal;
  }
  if (!ctx) return '#0f172a';
  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = colorVal;
    return ctx.fillStyle || '#0f172a';
  } catch {
    return '#0f172a';
  }
}

/**
 * Renders a Letter-portrait (8.5 x 11 in) analytical report page to canvas
 */
async function captureLetterPageToCanvas(pageEl: HTMLElement): Promise<HTMLCanvasElement> {
  return await html2canvas(pageEl, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 816, // 8.5in at 96 DPI
    windowHeight: 1056, // 11in at 96 DPI
    onclone: (clonedDoc, clonedElement) => {
      clonedDoc.documentElement.style.color = '#0f172a';
      clonedDoc.documentElement.style.backgroundColor = '#ffffff';
      clonedDoc.body.style.color = '#0f172a';
      clonedDoc.body.style.backgroundColor = '#ffffff';

      const el = clonedElement as HTMLElement;
      el.style.width = '8.5in';
      el.style.minWidth = '8.5in';
      el.style.maxWidth = '8.5in';
      el.style.height = '11in';
      el.style.minHeight = '11in';
      el.style.maxHeight = '11in';
      el.style.margin = '0';
      el.style.border = 'none';
      el.style.boxShadow = 'none';
      el.style.backgroundColor = '#ffffff';

      const tempCanvas = clonedDoc.createElement('canvas');
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      const ctx = tempCanvas.getContext('2d');
      const view = clonedDoc.defaultView;
      if (view) {
        const allNodes = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];
        allNodes.forEach(node => {
          const cs = view.getComputedStyle(node);
          if (cs.color.includes('oklch') || cs.color.includes('oklab')) {
            node.style.color = normalizeCssColorForCanvas(cs.color, ctx);
          }
          if (cs.backgroundColor.includes('oklch') || cs.backgroundColor.includes('oklab')) {
            node.style.backgroundColor = normalizeCssColorForCanvas(cs.backgroundColor, ctx);
          }
          if (cs.borderColor.includes('oklch') || cs.borderColor.includes('oklab')) {
            node.style.borderColor = normalizeCssColorForCanvas(cs.borderTopColor, ctx);
          }
          if (cs.boxShadow && (cs.boxShadow.includes('oklch') || cs.boxShadow.includes('oklab'))) {
            node.style.boxShadow = 'none';
          }
        });
      }
    }
  });
}

/**
 * Generates and downloads a multi-page Letter-portrait PDF for Analytical End-of-Period Reports
 */
export async function downloadAnalyticalReportPDF(
  fileNameBase: string,
  containerElement: HTMLElement,
  onProgress?: (progress: { current: number; total: number; label: string }) => void
): Promise<void> {
  const pages = containerElement.querySelectorAll<HTMLElement>('.letter-report-page');
  if (pages.length === 0) {
    throw new Error('No se encontraron páginas del reporte analítico para generar el PDF.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter', // 8.5 x 11 inches
    compress: true
  });

  for (let i = 0; i < pages.length; i++) {
    onProgress?.({
      current: i + 1,
      total: pages.length,
      label: `Renderizando página ${i + 1} de ${pages.length} (Formato Carta)...`
    });

    const canvas = await captureLetterPageToCanvas(pages[i]);
    const imgData = canvas.toDataURL('image/jpeg', 0.94);

    if (i > 0) {
      pdf.addPage('letter', 'portrait');
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');

    await new Promise(resolve => setTimeout(resolve, 25));
  }

  const cleanFile = `${sanitizeFileName(fileNameBase)}.pdf`;
  pdf.save(cleanFile);
}

