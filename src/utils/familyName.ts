// Utility functions for Dominican Republic family names formatting

export function toTitleCase(str: string): string {
  if (!str) return '';
  const lowercaseWords = ['la', 'del', 'los', 'las', 'y'];
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, idx) => {
      if (word === 'de') return 'De';
      if (idx > 0 && lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extracts and formats "Familia [Apellidos]" from a student's full name.
 * Handles common Dominican compound surnames like:
 * - De la Cruz, De los Santos, De Leon, De Oleo, Del Rosario, etc.
 * Example:
 * - "ANA CECILIA JACOBO PEÑA" -> "Familia Jacobo Peña"
 * - "ROUX ARLETTE DE LA CRUZ SURIEL" -> "Familia De la Cruz Suriel"
 * - "CARLA MARIE POLANCO DE LOS SANTOS" -> "Familia Polanco De los Santos"
 * - "CARLOS MANUEL DE LEON MORENO" -> "Familia De Leon Moreno"
 * - "LEYLA ALCANTARA SOTO" -> "Familia Alcantara Soto"
 */
export function extractFamilyName(fullName: string): string {
  if (!fullName) return 'Familia';
  const clean = fullName.trim();
  const upper = clean.toUpperCase();

  // If provided in "APELLIDOS, NOMBRES" format
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const surnames = parts[0].trim();
    if (surnames) {
      return `Familia ${toTitleCase(surnames)}`;
    }
  }

  // Handle specific known compound surnames in Dominican Republic:
  if (upper.includes('DE LA CRUZ')) {
    const match = upper.match(/DE LA CRUZ\s+[A-ZÁÉÍÓÚÑ]+/);
    if (match) return 'Familia ' + toTitleCase(match[0]);
    return 'Familia ' + toTitleCase('De la Cruz');
  }

  if (upper.includes('DE LOS SANTOS')) {
    const match = upper.match(/[A-ZÁÉÍÓÚÑ]+\s+DE LOS SANTOS/);
    if (match) return 'Familia ' + toTitleCase(match[0]);
    return 'Familia ' + toTitleCase('De los Santos');
  }

  if (upper.includes('DE LEON')) {
    const match = upper.match(/DE LEON\s+[A-ZÁÉÍÓÚÑ]+/);
    if (match) return 'Familia ' + toTitleCase(match[0]);
    return 'Familia ' + toTitleCase('De Leon');
  }

  if (upper.includes('DE OLEO')) {
    const match = upper.match(/[A-ZÁÉÍÓÚÑ]+\s+DE OLEO/);
    if (match) return 'Familia ' + toTitleCase(match[0]);
    return 'Familia ' + toTitleCase('De Oleo');
  }

  if (upper.includes('DEL ROSARIO')) {
    const match = upper.match(/[A-ZÁÉÍÓÚÑ]+\s+DEL ROSARIO/);
    if (match) return 'Familia ' + toTitleCase(match[0]);
    return 'Familia ' + toTitleCase('Del Rosario');
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return 'Familia ' + toTitleCase(words[0] || '');
  }
  if (words.length === 2) {
    return 'Familia ' + toTitleCase(words[1]);
  }

  // For 3 or more words (e.g. [ANA, CECILIA, JACOBO, PEÑA] or [LEYLA, ALCANTARA, SOTO])
  // In Dominican naming, the last two words are typically the two surnames
  const lastTwo = words.slice(-2).join(' ');
  return 'Familia ' + toTitleCase(lastTwo);
}

/**
 * Returns the formatted family name for a student object.
 * If student.parentName already starts with "Familia " and has surnames, it preserves it.
 * Otherwise, it generates "Familia [Apellidos]" from student.fullName.
 */
export function getStudentFamilyName(student: { fullName: string; parentName?: string }): string {
  if (student.parentName && student.parentName.trim().startsWith('Familia ') && student.parentName.trim() !== 'Familia') {
    return student.parentName.trim();
  }

  return extractFamilyName(student.fullName);
}
