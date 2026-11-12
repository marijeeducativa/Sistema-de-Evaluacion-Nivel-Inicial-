import { GradeLevel } from '../types';

export interface SuggestedPhrase {
  id: string;
  domainId: string;
  domainName: string;
  type: 'strength' | 'recommendation';
  grade: GradeLevel;
  text: string;
  tags: string[];
}

export const PHRASE_BANK: SuggestedPhrase[] = [
  // ==========================================
  // 1. PREKÍNDER (3 AÑOS)
  // ==========================================

  // Socioemocional - Prekínder - Fortalezas
  {
    id: 'pk-se-str-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Prekínder',
    text: '{nombre} se ha adaptado con alegría a la rutina escolar, demostrando afecto espontáneo hacia sus docentes y compañeros mediante abrazos y sonrisas.',
    tags: ['adaptación', 'afecto', 'rutina', 'alegría']
  },
  {
    id: 'pk-se-str-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Comparte voluntariamente sus juguetes y materiales de juego en los rincones, interactuando en armonía con sus pares.',
    tags: ['compartir', 'socialización', 'juguetes', 'compañerismo']
  },
  {
    id: 'pk-se-str-3',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Expresa sus necesidades y emociones básicas con naturalidad, reconociendo lo que le produce bienestar o incomodidad.',
    tags: ['emociones', 'expresión', 'bienestar', 'autonomía']
  },
  // Socioemocional - Prekínder - Recomendaciones
  {
    id: 'pk-se-rec-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Reforzar en casa la despedida matutina positiva y la seguridad emocional al separarse de la familia.',
    tags: ['desapego', 'seguridad', 'familia', 'despedida']
  },
  {
    id: 'pk-se-rec-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Acompañar en el hogar el manejo de la frustración cuando deba ceder un juguete o esperar su turno.',
    tags: ['frustración', 'paciencia', 'turnos', 'límites']
  },

  // Artístico - Prekínder - Fortalezas
  {
    id: 'pk-art-str-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Disfruta explorando la pintura dactilar y garabateo libre con crayolas gruesas, experimentando con mezclas de colores.',
    tags: ['pintura', 'colores', 'creatividad', 'garabateo']
  },
  {
    id: 'pk-art-str-2',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Baila con entusiasmo siguiendo ritmos musicales y participa con curiosidad en juegos de dramatización con títeres.',
    tags: ['música', 'ritmo', 'títeres', 'baile']
  },
  // Artístico - Prekínder - Recomendaciones
  {
    id: 'pk-art-rec-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Ofrecer en el hogar papel grande y crayones no tóxicos para motivar su expresión plástica sin temor a mancharse.',
    tags: ['crayones', 'expresión', 'motricidad', 'casa']
  },

  // Psicomotor - Prekínder - Fortalezas
  {
    id: 'pk-pm-str-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Se desplaza con agilidad, saltando con ambos pies y manteniendo el equilibrio en circuitos sencillos.',
    tags: ['equilibrio', 'saltar', 'desplazamiento', 'motricidad gruesa']
  },
  {
    id: 'pk-pm-str-2',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Colabora activamente en el lavado de manos antes de la merienda y en el guardado ordenado de materiales.',
    tags: ['higiene', 'orden', 'merienda', 'autocuidado']
  },
  // Psicomotor - Prekínder - Recomendaciones
  {
    id: 'pk-pm-rec-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Jugar a moldear masilla casera, rasgar papeles y ensartar aros grandes para estimular la fuerza en sus manitas.',
    tags: ['masilla', 'manos', 'fuerza', 'motricidad fina']
  },

  // Descubrimiento - Prekínder - Fortalezas
  {
    id: 'pk-dm-str-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Muestra vivo interés por los animales y plantas del entorno, observando hojas y flores con asombro.',
    tags: ['naturaleza', 'animales', 'plantas', 'curiosidad']
  },
  // Descubrimiento - Prekínder - Recomendaciones
  {
    id: 'pk-dm-rec-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Involucrarle en casa en pequeñas acciones de cuidado, como regar una planta o depositar la basura en el zafacón.',
    tags: ['cuidado', 'medio ambiente', 'plantas', 'responsabilidad']
  },

  // Cognitivo - Prekínder - Fortalezas
  {
    id: 'pk-cog-str-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Reconoce objetos cotidianos por su función e identifica con rapidez juguetes de su preferencia.',
    tags: ['objetos', 'reconocimiento', 'memoria', 'atención']
  },
  {
    id: 'pk-cog-str-2',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Arma torres de bloques con equilibrio y ensarta piezas de acuerdo a su tamaño básico.',
    tags: ['construcción', 'bloques', 'tamaño', 'lógica']
  },
  // Cognitivo - Prekínder - Recomendaciones
  {
    id: 'pk-cog-rec-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Jugar en familia a clasificar objetos por dos atributos simples: "los grandes aquí, los pequeños allá".',
    tags: ['clasificación', 'tamaño', 'juego', 'conceptos']
  },

  // Comunicativo - Prekínder - Fortalezas
  {
    id: 'pk-com-str-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Escucha con atención cuentos leídos por el adulto, señalando las ilustraciones y mencionando los personajes.',
    tags: ['cuentos', 'atención', 'personajes', 'lectura']
  },
  {
    id: 'pk-com-str-2',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Prekínder',
    text: 'Responde a su nombre y comunica sus deseos con palabras claras y gestos expresivos.',
    tags: ['lenguaje', 'nombre', 'comunicación', 'vocabulario']
  },
  // Comunicativo - Prekínder - Recomendaciones
  {
    id: 'pk-com-rec-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'recommendation',
    grade: 'Prekínder',
    text: 'Evitar el uso excesivo de pantallas digitales y priorizar la conversación cara a cara y canciones infantiles.',
    tags: ['pantallas', 'diálogo', 'canciones', 'estimulación oral']
  },

  // ==========================================
  // 2. KÍNDER (4 AÑOS)
  // ==========================================

  // Socioemocional - Kínder - Fortalezas
  {
    id: 'ki-se-str-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Kínder',
    text: '{nombre} manifiesta una convivencia escolar armoniosa, mostrando cortesía, empatía y respeto hacia sus pares.',
    tags: ['convivencia', 'empatía', 'cortesía', 'respeto']
  },
  {
    id: 'ki-se-str-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Kínder',
    text: 'Valora y respeta las opiniones de sus compañeros durante los momentos de círculo y juego cooperativo.',
    tags: ['círculo', 'escucha', 'compañerismo', 'opiniones']
  },
  {
    id: 'ki-se-str-3',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Kínder',
    text: 'Muestra gran iniciativa y perseverancia al completar sus asignaciones en los rincones de aprendizaje.',
    tags: ['iniciativa', 'perseverancia', 'rincones', 'autonomía']
  },
  // Socioemocional - Kínder - Recomendaciones
  {
    id: 'ki-se-rec-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Brindarle oportunidades en casa para tomar pequeñas decisiones (elegir su ropa, organizar sus zapatos) para consolidar su autonomía.',
    tags: ['decisiones', 'autonomía', 'hogar', 'responsabilidad']
  },
  {
    id: 'ki-se-rec-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Reforzar el uso de palabras mágicas ("por favor", "gracias", "permiso") en las interacciones diarias familiares.',
    tags: ['cortesía', 'normas', 'valores', 'socialización']
  },

  // Artístico - Kínder - Fortalezas
  {
    id: 'ki-art-str-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Reconoce e incorpora elementos de la identidad dominicana en sus creaciones plásticas y musicales.',
    tags: ['cultura dominicana', 'música', 'arte', 'creatividad']
  },
  {
    id: 'ki-art-str-2',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Combina masilla y materiales reciclados creando figuras con detalles y volumen tridimensional.',
    tags: ['masilla', 'reciclaje', 'volumen', 'escultura']
  },
  // Artístico - Kínder - Recomendaciones
  {
    id: 'ki-art-rec-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Acompañar en el hogar la audición de música folklórica y clásica infantil comentando los instrumentos que se escuchan.',
    tags: ['música clásica', 'instrumentos', 'audición', 'ritmo']
  },

  // Psicomotor - Kínder - Fortalezas
  {
    id: 'ki-pm-str-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Kínder',
    text: 'Distingue con precisión nociones espaciales (arriba/abajo, dentro/fuera) y responde a indicaciones de desplazamiento.',
    tags: ['lateralidad', 'espacio', 'direcciones', 'coordinación']
  },
  {
    id: 'ki-pm-str-2',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Kínder',
    text: 'Muestra agarre adecuado de la tijera y realiza cortes en línea recta y curva con progresiva seguridad.',
    tags: ['tijeras', 'recorte', 'motricidad fina', 'prensión']
  },
  // Psicomotor - Kínder - Recomendaciones
  {
    id: 'ki-pm-rec-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Promover actividades al aire libre que impliquen pedalear en triciclo, lanzar y atrapar pelotas a distancias moderadas.',
    tags: ['aire libre', 'pelotas', 'coordinación ojo-mano', 'deporte']
  },

  // Descubrimiento - Kínder - Fortalezas
  {
    id: 'ki-dm-str-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Identifica semejanzas y diferencias entre animales domésticos y silvestres, formulando preguntas interesantes.',
    tags: ['animales', 'ciencias', 'diferencias', 'observación']
  },
  {
    id: 'ki-dm-str-2',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Demuestra conciencia sobre la importancia del agua y colabora cerrando la llave mientras se enjabona.',
    tags: ['agua', 'medio ambiente', 'recursos', 'ecología']
  },
  // Descubrimiento - Kínder - Recomendaciones
  {
    id: 'ki-dm-rec-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Realizar en casa pequeños experimentos seguros (como flotabilidad de objetos en agua o germinación de habichuelas).',
    tags: ['experimentos', 'flotabilidad', 'germinación', 'ciencias']
  },

  // Cognitivo - Kínder - Fortalezas
  {
    id: 'ki-cog-str-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Predice acontecimientos lógicos en narraciones y explica con sus palabras lo que podría ocurrir a continuación.',
    tags: ['predicción', 'inferencia', 'lógica', 'pensamiento']
  },
  {
    id: 'ki-cog-2',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Agrupa objetos por color y forma simultáneamente, justificando el criterio utilizado con claridad.',
    tags: ['clasificación', 'criterios', 'formas', 'colores']
  },
  // Cognitivo - Kínder - Recomendaciones
  {
    id: 'ki-cog-rec-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Afianzar en el hogar la relación de número y cantidad hasta el 5 utilizando juguetes concretos o frutas.',
    tags: ['conteo', 'cantidad', 'números', 'matemática temprana']
  },

  // Comunicativo - Kínder - Fortalezas
  {
    id: 'ki-com-str-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Identifica su nombre escrito entre varios carteles y realiza intentos firmes de graficarlo de forma no convencional.',
    tags: ['nombre propio', 'escritura', 'carteles', 'alfabetización']
  },
  {
    id: 'ki-com-str-2',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Kínder',
    text: 'Describe láminas y situaciones con oraciones completas y entonación adecuada, esperando su turno para hablar.',
    tags: ['descripción', 'vocabulario', 'oraciones', 'fluidez']
  },
  // Comunicativo - Kínder - Recomendaciones
  {
    id: 'ki-com-rec-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'recommendation',
    grade: 'Kínder',
    text: 'Leer juntos cuentos diarios, señalando el texto de izquierda a derecha para familiarizar la direccionalidad de la lectura.',
    tags: ['lectura diaria', 'direccionalidad', 'libros', 'familia']
  },

  // ==========================================
  // 3. PREPRIMARIO (5 AÑOS)
  // ==========================================

  // Socioemocional - Preprimario - Fortalezas
  {
    id: 'prep-se-str-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Preprimario',
    text: '{nombre} evidencia un excelente liderazgo positivo, autorregulación y madurez socioemocional ante las dinámicas del aula.',
    tags: ['liderazgo', 'autorregulación', 'madurez', 'convivencia']
  },
  {
    id: 'prep-se-str-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Comunica su postura con respeto y argumenta sus puntos de vista buscando acuerdos consensuados en el grupo.',
    tags: ['argumentación', 'diálogo', 'acuerdos', 'asertividad']
  },
  {
    id: 'prep-se-str-3',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Cumple de manera responsable y autónoma con sus deberes y tareas escolares, cuidando sus útiles y los ajenos.',
    tags: ['responsabilidad', 'deberes', 'cuidado', 'autonomía']
  },
  // Socioemocional - Preprimario - Recomendaciones
  {
    id: 'prep-se-rec-1',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Continuar fortaleciendo en el hogar la puntualidad y la constancia al finalizar las tareas antes de pasar al juego.',
    tags: ['puntualidad', 'constancia', 'hábitos', 'transición a primaria']
  },
  {
    id: 'prep-se-rec-2',
    domainId: 'socioemocional',
    domainName: 'Dominio Socioemocional',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Estimular su confianza para expresar dudas ante el docente cuando no comprenda alguna consigna.',
    tags: ['confianza', 'preguntas', 'seguridad', 'participación']
  },

  // Artístico - Preprimario - Fortalezas
  {
    id: 'prep-art-str-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Dibuja con admirable nivel de detalle anatómico y espacial (figura humana con cuello, manos, dedos y contexto escénico).',
    tags: ['figura humana', 'dibujo', 'detalles', 'expresión artística']
  },
  {
    id: 'prep-art-str-2',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Reproduce patrones rítmicos complejos con instrumentos de percusión menor y participa con soltura en danzas tradicionales.',
    tags: ['percusión', 'patrones rítmicos', 'danza tradicional', 'música']
  },
  // Artístico - Preprimario - Recomendaciones
  {
    id: 'prep-art-rec-1',
    domainId: 'artistico',
    domainName: 'Dominio Artístico y Creativo',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Animarle a narrar historias inventadas a partir de sus dibujos para enriquecer la articulación entre plástica y oralidad.',
    tags: ['historias', 'imaginación', 'narrativa', 'creatividad']
  },

  // Psicomotor - Preprimario - Fortalezas
  {
    id: 'prep-pm-str-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Posee una sólida lateralidad afianzada y coordinación visomotora fina, demostrando trazos firmes y precisos.',
    tags: ['lateralidad', 'trazos', 'prensión trípode', 'motricidad fina']
  },
  {
    id: 'prep-pm-str-2',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Se desplaza con equilibrio postural y control corporal en actividades gimnásticas y juegos reglados.',
    tags: ['control postural', 'juegos reglados', 'gimnasia', 'equilibrio']
  },
  // Psicomotor - Preprimario - Recomendaciones
  {
    id: 'prep-pm-rec-1',
    domainId: 'psicomotor',
    domainName: 'Dominio Psicomotor y de Salud',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Supervisar en casa la postura adecuada al sentarse a la mesa y el agarre trípode del lápiz para evitar fatiga.',
    tags: ['postura', 'agarre trípode', 'escritura', 'salud postural']
  },

  // Descubrimiento - Preprimario - Fortalezas
  {
    id: 'prep-dm-str-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Aplica de forma autónoma pasos sencillos del método científico: observa, formula hipótesis y registra hallazgos.',
    tags: ['método científico', 'hipótesis', 'registro', 'investigación']
  },
  {
    id: 'prep-dm-str-2',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Describe fenómenos naturales y propone acciones concretas para el reciclaje y protección ambiental en su centro escolar.',
    tags: ['reciclaje', 'fenómenos naturales', 'ecología', 'medio ambiente']
  },
  // Descubrimiento - Preprimario - Recomendaciones
  {
    id: 'prep-dm-rec-1',
    domainId: 'descubrimiento',
    domainName: 'Dominio Descubrimiento del Mundo',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Fomentar la clasificación de residuos en casa (papel, plástico, orgánico) para reforzar su compromiso ecológico.',
    tags: ['reciclaje en casa', 'valores ecológicos', 'medio ambiente']
  },

  // Cognitivo - Preprimario - Fortalezas
  {
    id: 'prep-cog-str-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Domina la secuencia numérica hasta el 9, realiza conteo exacto y resuelve problemas lógicos de adición y sustracción concreta.',
    tags: ['números hasta 9', 'adición', 'sustracción', 'resolución de problemas']
  },
  {
    id: 'prep-cog-str-2',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Crea e interpreta gráficos sencillos y patrones matemáticos complejos de tamaño, cantidad y posición.',
    tags: ['patrones', 'gráficos', 'series', 'pensamiento matemático']
  },
  // Cognitivo - Preprimario - Recomendaciones
  {
    id: 'prep-cog-rec-1',
    domainId: 'cognitivo',
    domainName: 'Dominio Cognitivo',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Integrar problemas matemáticos en la vida cotidiana (ej: "si tenemos 4 platos y vienen 2 visitas, ¿cuántos necesitamos?").',
    tags: ['problemas cotidianos', 'conteo mental', 'lógica familiar']
  },

  // Comunicativo - Preprimario - Fortalezas
  {
    id: 'prep-com-str-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Escribe su nombre completo de manera convencional y reconoce sonidos iniciales y finales de palabras significativas.',
    tags: ['nombre completo', 'conciencia fonológica', 'escritura convencional']
  },
  {
    id: 'prep-com-str-2',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Comprende textos funcionales y literarios con alto nivel de inferencia, identificando la idea central y moralejas.',
    tags: ['comprensión lectora', 'inferencia', 'textos funcionales', 'literatura']
  },
  {
    id: 'prep-com-str-3',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'strength',
    grade: 'Preprimario',
    text: 'Produce textos orales y escritos no convencionales expresando vivencias y sentimientos con destacada coherencia.',
    tags: ['producción textual', 'coherencia', 'expresión oral', 'creatividad']
  },
  // Comunicativo - Preprimario - Recomendaciones
  {
    id: 'prep-com-rec-1',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Continuar fortaleciendo la biblioteca del hogar, visitando librerías o bibliotecas para motivar el amor por la lectura independiente.',
    tags: ['biblioteca en casa', 'amor por la lectura', 'transición a 1ro']
  },
  {
    id: 'prep-com-rec-2',
    domainId: 'comunicativo',
    domainName: 'Dominio Comunicativo',
    type: 'recommendation',
    grade: 'Preprimario',
    text: 'Jugar a las rimas y trabalenguas para agilizar la articulación y discriminación auditiva antes del ingreso a Primaria.',
    tags: ['rimas', 'trabalenguas', 'discriminación auditiva', 'fonética']
  }
];
