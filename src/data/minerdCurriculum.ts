import { Domain, Indicator, GradeLevel } from '../types';

export const DOMAINS: Domain[] = [
  {
    id: 'socioemocional',
    name: 'Dominio Socioemocional',
    shortName: 'Socioemocional',
    color: '#3b82f6',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  {
    id: 'artistico',
    name: 'Dominio Artístico y Creativo',
    shortName: 'Artístico',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    textColor: 'text-purple-800'
  },
  {
    id: 'psicomotor',
    name: 'Dominio Psicomotor y de Salud',
    shortName: 'Psicomotor',
    color: '#10b981',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    textColor: 'text-emerald-800'
  },
  {
    id: 'descubrimiento',
    name: 'Dominio Descubrimiento del Mundo',
    shortName: 'Descubrimiento',
    color: '#f59e0b',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    textColor: 'text-amber-800'
  },
  {
    id: 'cognitivo',
    name: 'Dominio Cognitivo',
    shortName: 'Cognitivo',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-50',
    badgeBorder: 'border-cyan-200',
    textColor: 'text-cyan-800'
  },
  {
    id: 'comunicativo',
    name: 'Dominio Comunicativo',
    shortName: 'Comunicativo',
    color: '#ec4899',
    badgeBg: 'bg-pink-50',
    badgeBorder: 'border-pink-200',
    textColor: 'text-pink-800'
  }
];

// Indicators for Prekínder (3 Años)
export const PREKINDER_INDICATORS: Indicator[] = [
  // Dominio Socioemocional
  {
    id: 'pk-se-1',
    code: 'SE-1',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Expresa sus sentimientos, emociones e ideas de forma gráfica o escrita, al escuchar narraciones, mensajes, cuentos, canciones, poesías leídas por otras personas, de manera no convencional.',
    shortText: 'Expresa sentimientos/emociones de forma gráfica/oral.'
  },
  {
    id: 'pk-se-2',
    code: 'SE-2',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Sigue una secuencia en el uso de algunos textos orales, en situaciones cotidianas de comunicación al expresar sentimientos, gestos, emociones y movimientos corporales.',
    shortText: 'Sigue secuencia en textos orales expresando gestos.'
  },
  {
    id: 'pk-se-3',
    code: 'SE-3',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Usa diversas formas de expresión con intención de comunicar sus ideas, opiniones, emociones, sentimientos y experiencias.',
    shortText: 'Usa formas de expresión para comunicar opiniones.'
  },
  {
    id: 'pk-se-4',
    code: 'SE-4',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Colabora en la puesta en práctica de la solución acordada de problemas sencillos o situaciones cotidianas que afectan a sí mismo o al grupo.',
    shortText: 'Colabora en la solución de problemas sencillos.'
  },
  {
    id: 'pk-se-5',
    code: 'SE-5',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Responde a preguntas sobre situaciones o actividades que se desarrollan en su contexto inmediato.',
    shortText: 'Responde preguntas sobre situaciones de su contexto.'
  },
  {
    id: 'pk-se-6',
    code: 'SE-6',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Comprende, progresivamente, el orden lógico de actividades en una rutina.',
    shortText: 'Comprende el orden lógico de actividades de rutina.'
  },
  {
    id: 'pk-se-7',
    code: 'SE-7',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Expresa las acciones y actitudes que le producen bienestar o no a su persona y a los demás.',
    shortText: 'Expresa acciones que le producen bienestar.'
  },
  {
    id: 'pk-se-8',
    code: 'SE-8',
    domainId: 'socioemocional',
    grade: 'Prekínder',
    text: 'Demuestra afecto a través de sus gestos, palabras y comportamientos.',
    shortText: 'Demuestra afecto con gestos y palabras.'
  },

  // Dominio Artístico y Creativo
  {
    id: 'pk-art-1',
    code: 'ART-1',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Realiza producciones plásticas bidimensionales (dibujo) al representar ideas reales o imaginarias.',
    shortText: 'Realiza dibujos representando ideas reales/imaginarias.'
  },
  {
    id: 'pk-art-2',
    code: 'ART-2',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Maneja títeres de dedos y manos junto a compañeros y compañeras, cantando o contando historias.',
    shortText: 'Maneja títeres contando historias con compañeros.'
  },
  {
    id: 'pk-art-3',
    code: 'ART-3',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Conversa acerca de las actuaciones de los personajes en dramatizaciones y obras de títeres que observa.',
    shortText: 'Conversa sobre personajes en dramatizaciones.'
  },
  {
    id: 'pk-art-4',
    code: 'ART-4',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Realiza producciones plásticas bidimensionales (dibujo) seleccionando y combinando colores primarios y secundarios al representar ideas reales o imaginarias.',
    shortText: 'Combina colores primarios/secundarios en dibujos.'
  },
  {
    id: 'pk-art-5',
    code: 'ART-5',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Explora con su cuerpo sonidos y movimientos, de forma libre y siguiendo un ritmo.',
    shortText: 'Explora con su cuerpo sonidos y movimientos.'
  },
  {
    id: 'pk-art-6',
    code: 'ART-6',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Explora las posibilidades sonoras de su voz y de sonidos producidos al percutir, sacudir o frotar instrumentos musicales y objetos o materiales de su entorno.',
    shortText: 'Explora posibilidades sonoras (voz, instrumentos).'
  },
  {
    id: 'pk-art-7',
    code: 'ART-7',
    domainId: 'artistico',
    grade: 'Prekínder',
    text: 'Entona canciones infantiles y las acompaña con instrumentos de percusión menor.',
    shortText: 'Entona canciones acompañadas de percusión.'
  },

  // Dominio Psicomotor y de Salud
  {
    id: 'pk-pm-1',
    code: 'PM-1',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Realiza movimientos en diferentes direcciones y velocidades, de forma libre y siguiendo un ritmo.',
    shortText: 'Realiza movimientos (direcciones/velocidades).'
  },
  {
    id: 'pk-pm-2',
    code: 'PM-2',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Realiza juegos de desplazamiento en el espacio, mostrando progresión en la estabilidad y equilibrio de su cuerpo según indicaciones derecha- izquierda.',
    shortText: 'Muestra estabilidad y equilibrio en desplazamientos.'
  },
  {
    id: 'pk-pm-3',
    code: 'PM-3',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Explora y manipula objetos y los incorpora al juego o improvisaciones lúdicas.',
    shortText: 'Explora y manipula objetos en juegos.'
  },
  {
    id: 'pk-pm-4',
    code: 'PM-4',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Experimenta con su cuerpo movimientos de estiramiento, relajación y descanso, al iniciar y al finalizar actividades físicas.',
    shortText: 'Experimenta estiramiento, relajación y descanso.'
  },
  {
    id: 'pk-pm-5',
    code: 'PM-5',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Imita de manera espontánea situaciones reales e imaginarias a partir canciones y juegos de rondas.',
    shortText: 'Imita situaciones reales/imaginarias en juegos.'
  },
  {
    id: 'pk-pm-6',
    code: 'PM-6',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Participa en actividades de higiene y cuidado personal, con apoyo del adulto.',
    shortText: 'Participa en actividades de higiene personal.'
  },
  {
    id: 'pk-pm-7',
    code: 'PM-7',
    domainId: 'psicomotor',
    grade: 'Prekínder',
    text: 'Reproduce secuencia rítmica y melódica con su cuerpo e instrumentos musicales.',
    shortText: 'Reproduce secuencias rítmicas con el cuerpo.'
  },

  // Dominio Descubrimiento del Mundo
  {
    id: 'pk-dm-1',
    code: 'DM-1',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Describe situaciones de su comunidad local a partir de preguntas, con el apoyo de adultos.',
    shortText: 'Describe situaciones de su comunidad local.'
  },
  {
    id: 'pk-dm-2',
    code: 'DM-2',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Participa en actividades relacionadas con la comunidad local.',
    shortText: 'Participa en actividades de la comunidad.'
  },
  {
    id: 'pk-dm-3',
    code: 'DM-3',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Comparte informaciones con ayuda del adulto, sobre temas de interés de su entorno inmediato.',
    shortText: 'Comparte información sobre su entorno inmediato.'
  },
  {
    id: 'pk-dm-4',
    code: 'DM-4',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Cuestiona, observa y explora su entorno natural a partir de temas de interés.',
    shortText: 'Cuestiona y explora su entorno natural.'
  },
  {
    id: 'pk-dm-5',
    code: 'DM-5',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Describe algunas características de los seres vivos de su entorno.',
    shortText: 'Describe características de seres vivos.'
  },
  {
    id: 'pk-dm-6',
    code: 'DM-6',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Dialoga sobre el cuidado y respeto a los seres vivos y su entorno.',
    shortText: 'Dialoga sobre el respeto a seres vivos.'
  },
  {
    id: 'pk-dm-7',
    code: 'DM-7',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Participan en el cuidado del entorno escolar.',
    shortText: 'Participa en el cuidado del entorno escolar.'
  },
  {
    id: 'pk-dm-8',
    code: 'DM-8',
    domainId: 'descubrimiento',
    grade: 'Prekínder',
    text: 'Colabora en la reducción de la producción de desecho y en su depósito adecuado; así como en acciones cotidianas de uso adecuado de agua y fuente de energía.',
    shortText: 'Colabora en reducción de desechos y uso de agua.'
  },

  // Dominio Cognitivo
  {
    id: 'pk-cog-1',
    code: 'COG-1',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Ordena hechos sencillos de la realidad ocurridos en su entorno inmediato utilizando su imaginación.',
    shortText: 'Ordena hechos sencillos de la realidad.'
  },
  {
    id: 'pk-cog-2',
    code: 'COG-2',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Predice acontecimientos explicando lo ocurrido de acuerdo a su conocimiento y experiencias previas.',
    shortText: 'Predice acontecimientos según experiencias previas.'
  },
  {
    id: 'pk-cog-3',
    code: 'COG-3',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Asume progresivamente las reglas acordadas en algunos juegos.',
    shortText: 'Asume reglas acordadas en algunos juegos.'
  },
  {
    id: 'pk-cog-4',
    code: 'COG-4',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Integra de manera espontánea objetos del entorno cercano a sus juegos simulando situaciones reales o imaginarias.',
    shortText: 'Integra objetos a juegos simulando situaciones.'
  },
  {
    id: 'pk-cog-5',
    code: 'COG-5',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Responde a preguntas sobre situaciones o actividades que se desarrollan en su contexto inmediato.',
    shortText: 'Responde preguntas sobre actividades del contexto.'
  },
  {
    id: 'pk-cog-6',
    code: 'COG-6',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Expresa sus ideas sobre lo que observa y las actividades cotidianas que realiza.',
    shortText: 'Expresa ideas sobre lo que observa.'
  },
  {
    id: 'pk-cog-7',
    code: 'COG-7',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Participa en la búsqueda y selección de alternativas al solucionar situaciones cotidianas.',
    shortText: 'Participa en búsqueda de soluciones cotidianas.'
  },
  {
    id: 'pk-cog-8',
    code: 'COG-8',
    domainId: 'cognitivo',
    grade: 'Prekínder',
    text: 'Expresa a los demás sus acuerdos o desacuerdos ante situaciones o hechos cotidianos.',
    shortText: 'Expresa acuerdos o desacuerdos ante hechos.'
  },

  // Dominio Comunicativo
  {
    id: 'pk-com-1',
    code: 'COM-1',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Escucha, textos cortos, asociando imágenes, palabras y frases cortas, mediante la exploración diferentes recursos y medios.',
    shortText: 'Escucha textos cortos asociando imágenes/palabras.'
  },
  {
    id: 'pk-com-2',
    code: 'COM-2',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Comunica ideas mediante imágenes, textos funcionales e icónicos en formato digitales e impreso.',
    shortText: 'Comunica ideas mediante imágenes/textos icónicos.'
  },
  {
    id: 'pk-com-3',
    code: 'COM-3',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Comprende textos orales sencillos y realiza preguntas para profundizar sobre temas de su interés.',
    shortText: 'Comprende textos orales sencillos y pregunta.'
  },
  {
    id: 'pk-com-4',
    code: 'COM-4',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Produce textos orales y los expone en lenguaje no verbal (gestos, ademanes, postura…) y paraverbal de acuerdo a sus necesidades.',
    shortText: 'Produce textos orales con lenguaje no verbal.'
  },
  {
    id: 'pk-com-5',
    code: 'COM-5',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Escucha su nombre e intenta escribirlo de forma no convencional o progresivamente convencional.',
    shortText: 'Escucha su nombre e intenta escribirlo.'
  },
  {
    id: 'pk-com-6',
    code: 'COM-6',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Utiliza la narración en las formas convencionales de lectura con ayuda del adulto.',
    shortText: 'Utiliza la narración con ayuda del adulto.'
  },
  {
    id: 'pk-com-7',
    code: 'COM-7',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Respeta las reglas de convivencia y comunicación, esperando su turno para formular preguntas sencillas de su interés.',
    shortText: 'Respeta reglas de comunicación (espera turno).'
  },
  {
    id: 'pk-com-8',
    code: 'COM-8',
    domainId: 'comunicativo',
    grade: 'Prekínder',
    text: 'Identifica problemas del entorno y expresa posibles soluciones mediante un tipo de texto oral o manera no convencional.',
    shortText: 'Identifica problemas y expresa soluciones oralmente.'
  }
];

// Indicators for Kínder (4 Años)
export const KINDER_INDICATORS: Indicator[] = [
  // Dominio Socioemocional
  {
    id: 'ki-se-1',
    code: 'SE-1',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Comunica sus ideas, pensamientos, emociones y experiencias con la finalidad de que los demás puedan entender lo que pretende comunicar.',
    shortText: 'Comunica ideas y emociones para ser entendido.'
  },
  {
    id: 'ki-se-2',
    code: 'SE-2',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Utiliza técnicas y materiales en sus producciones para expresar sus emociones, sentimientos, ideas y experiencias.',
    shortText: 'Utiliza técnicas/materiales para expresar sentimientos.'
  },
  {
    id: 'ki-se-3',
    code: 'SE-3',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Escucha y valora las opiniones de los demás.',
    shortText: 'Escucha y valora las opiniones de los demás.'
  },
  {
    id: 'ki-se-4',
    code: 'SE-4',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Expresa ideas y sentimientos a través de imágenes sencillas creadas con masillas.',
    shortText: 'Expresa ideas/sentimientos con imágenes/masilla.'
  },
  {
    id: 'ki-se-5',
    code: 'SE-5',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Describe situaciones problemáticas del entorno, ubicándolas de forma adecuada y creativa.',
    shortText: 'Describe situaciones problemáticas de forma creativa.'
  },
  {
    id: 'ki-se-6',
    code: 'SE-6',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Identifica y comparte sus gustos y preferencias con respeto, cortesía expresiones muy breves y sencillas.',
    shortText: 'Comparte gustos y preferencias con respeto.'
  },
  {
    id: 'ki-se-7',
    code: 'SE-7',
    domainId: 'socioemocional',
    grade: 'Kínder',
    text: 'Valora a sus compañeros respetando sus ideas y sentimientos.',
    shortText: 'Valora a compañeros respetando ideas y sentimientos.'
  },

  // Dominio Artístico y Creativo
  {
    id: 'ki-art-1',
    code: 'ART-1',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Identifica al menos 3 o 4 elementos de la cultura dominicana.',
    shortText: 'Identifica 3-4 elementos de cultura dominicana.'
  },
  {
    id: 'ki-art-2',
    code: 'ART-2',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Usa diversas formas de los lenguajes de las artes y materiales de desecho con intención de comunicar sus ideas, emociones y experiencias.',
    shortText: 'Usa lenguajes artísticos para comunicar ideas.'
  },
  {
    id: 'ki-art-3',
    code: 'ART-3',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Explora y manipula títeres y objetos y los incorpora al juego o improvisaciones lúdicas.',
    shortText: 'Explora y manipula títeres en improvisaciones.'
  },
  {
    id: 'ki-art-4',
    code: 'ART-4',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Explora las posibilidades sonoras de su cuerpo, voz y de sonidos producidos al percutir, sacudir o frotar instrumentos musicales y objetos de su entorno.',
    shortText: 'Explora posibilidades sonoras (cuerpo/instrumentos).'
  },
  {
    id: 'ki-art-5',
    code: 'ART-5',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Entona canciones infantiles y las acompaña con instrumentos de percusión menor.',
    shortText: 'Entona canciones con instrumentos de percusión.'
  },
  {
    id: 'ki-art-6',
    code: 'ART-6',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Escucha con atención cuentos musicales, identificando los sonidos de voces e instrumentos.',
    shortText: 'Escucha cuentos musicales identificando sonidos.'
  },
  {
    id: 'ki-art-7',
    code: 'ART-7',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Mueve su cuerpo de forma espontánea, con estímulos sonoros de origen diverso.',
    shortText: 'Mueve su cuerpo espontáneamente con música.'
  },
  {
    id: 'ki-art-8',
    code: 'ART-8',
    domainId: 'artistico',
    grade: 'Kínder',
    text: 'Reproduce patrones rítmicos sencillos con su cuerpo, su voz o instrumentos.',
    shortText: 'Reproduce patrones rítmicos sencillos.'
  },

  // Dominio Psicomotor y de Salud
  {
    id: 'ki-pm-1',
    code: 'PM-1',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Realiza movimientos en diferentes direcciones, posiciones y velocidades, según indicaciones.',
    shortText: 'Realiza movimientos (direcciones/velocidades).'
  },
  {
    id: 'ki-pm-2',
    code: 'PM-2',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Ubica objetos y realiza movimientos según indicaciones derecha- izquierda, con relación a su cuerpo.',
    shortText: 'Ubica objetos según indicaciones derecha-izquierda.'
  },
  {
    id: 'ki-pm-3',
    code: 'PM-3',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Explora y manipula objetos y los incorpora al juego o improvisaciones lúdicas al representar situaciones reales o imaginarias.',
    shortText: 'Explora objetos en juegos reales o imaginarios.'
  },
  {
    id: 'ki-pm-4',
    code: 'PM-4',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Imita situaciones reales e imaginaria a partir canciones, juegos de rondas o cuentos cortos.',
    shortText: 'Imita situaciones a partir de cuentos/rondas.'
  },
  {
    id: 'ki-pm-5',
    code: 'PM-5',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Participa en juegos grupales reglados de reglas, aceptando procedimientos acordados en el grupo.',
    shortText: 'Participa en juegos grupales aceptando reglas.'
  },
  {
    id: 'ki-pm-6',
    code: 'PM-6',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Realiza movimientos con algunas partes de su cuerpo de manera coordinada en el espacio parcial y total.',
    shortText: 'Coordina movimientos de partes del cuerpo.'
  },
  {
    id: 'ki-pm-7',
    code: 'PM-7',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Realiza desplazamientos en el espacio mostrando estabilidad y equilibrio en sus movimientos.',
    shortText: 'Se desplaza con estabilidad y equilibrio.'
  },
  {
    id: 'ki-pm-8',
    code: 'PM-8',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Experimenta con su cuerpo movimientos de estiramiento, relajación y descanso, al finalizar actividades físicas.',
    shortText: 'Experimenta estiramiento y relajación.'
  },
  {
    id: 'ki-pm-9',
    code: 'PM-9',
    domainId: 'psicomotor',
    grade: 'Kínder',
    text: 'Participa en actividades de higiene y cuidado personal, con apoyo del adulto.',
    shortText: 'Participa en higiene y cuidado personal con apoyo.'
  },

  // Dominio Descubrimiento del Mundo
  {
    id: 'ki-dm-1',
    code: 'DM-1',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Describe situaciones de su comunidad local a partir de observación, exploración y preguntas, con el apoyo de adultos.',
    shortText: 'Describe situaciones de su comunidad (apoyo adulto).'
  },
  {
    id: 'ki-dm-2',
    code: 'DM-2',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Participa en proyectos sobre problemas sencillos que afectan su comunidad.',
    shortText: 'Participa en proyectos de problemas comunitarios.'
  },
  {
    id: 'ki-dm-3',
    code: 'DM-3',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Colabora en la búsqueda de información con ayuda del adulto, sobre temas de interés de su entorno inmediato natural y fenómenos naturales.',
    shortText: 'Colabora buscando información de temas de interés.'
  },
  {
    id: 'ki-dm-4',
    code: 'DM-4',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Cuestiona, observa y explora su entorno natural cercano con ayuda de otras personas.',
    shortText: 'Cuestiona y explora su entorno natural con ayuda.'
  },
  {
    id: 'ki-dm-5',
    code: 'DM-5',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Usa utensilios, artefactos de su entorno o recursos tecnológicos, al realizar experimentos sencillos.',
    shortText: 'Usa utensilios/tecnología para experimentos sencillos.'
  },
  {
    id: 'ki-dm-6',
    code: 'DM-6',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Registra los resultados de la exploración del entorno natural de forma oral, escrita o gráfica, de manera convencional o no.',
    shortText: 'Registra resultados de exploración (oral/escrita/gráfica).'
  },
  {
    id: 'ki-dm-7',
    code: 'DM-7',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Comprensión de la importancia del manejo adecuado de los desechos.',
    shortText: 'Comprende importancia del manejo de desechos.'
  },
  {
    id: 'ki-dm-8',
    code: 'DM-8',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Identifica algunas semejanzas y diferencias entre seres vivos de su entorno.',
    shortText: 'Identifica semejanzas y diferencias en seres vivos.'
  },
  {
    id: 'ki-dm-9',
    code: 'DM-9',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Utiliza informaciones sobre personas, animales u objetos conocidos para apoyar sus explicaciones.',
    shortText: 'Usa información conocida para apoyar explicaciones.'
  },
  {
    id: 'ki-dm-10',
    code: 'DM-10',
    domainId: 'descubrimiento',
    grade: 'Kínder',
    text: 'Colabora y explica algunas medidas en actividades de protección y cuidado del entorno escolar, recursos, sus plantas y animales.',
    shortText: 'Colabora y explica medidas de protección ambiental.'
  },

  // Dominio Cognitivo
  {
    id: 'ki-cog-1',
    code: 'COG-1',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Ordena hechos sencillos de la realidad ocurridos en su entorno inmediato utilizando su imaginación.',
    shortText: 'Ordena hechos sencillos usando imaginación.'
  },
  {
    id: 'ki-cog-2',
    code: 'COG-2',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Predice acontecimientos explicando lo ocurrido de acuerdo con su conocimiento y experiencias previas.',
    shortText: 'Predice acontecimientos según experiencias previas.'
  },
  {
    id: 'ki-cog-3',
    code: 'COG-3',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Asume progresivamente las reglas acordadas en algunos juegos.',
    shortText: 'Asume reglas acordadas en juegos.'
  },
  {
    id: 'ki-cog-4',
    code: 'COG-4',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Integra de manera espontánea objetos del entorno cercano a sus juegos simulando situaciones reales o imaginarias.',
    shortText: 'Integra objetos a juegos simulando situaciones.'
  },
  {
    id: 'ki-cog-5',
    code: 'COG-5',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Responde a preguntas sobre situaciones o actividades que se desarrollan en su contexto inmediato.',
    shortText: 'Responde preguntas sobre situaciones del contexto.'
  },
  {
    id: 'ki-cog-6',
    code: 'COG-6',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Expresa sus ideas sobre lo que observa y las actividades cotidianas que realiza.',
    shortText: 'Expresa ideas sobre observaciones y actividades.'
  },
  {
    id: 'ki-cog-7',
    code: 'COG-7',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Expresa a los demás sus acuerdos o desacuerdos ante situaciones o hechos cotidiano.',
    shortText: 'Expresa acuerdos/desacuerdos ante hechos cotidianos.'
  },
  {
    id: 'ki-cog-8',
    code: 'COG-8',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Participa en la búsqueda y selección de alternativas al solucionar situaciones cotidianas.',
    shortText: 'Participa buscando alternativas a problemas.'
  },
  {
    id: 'ki-cog-9',
    code: 'COG-9',
    domainId: 'cognitivo',
    grade: 'Kínder',
    text: 'Colabora en la puesta en búsqueda de la solución acordada de problemas sencillos o situaciones cotidianas que afectan a sí mismo o al grupo.',
    shortText: 'Colabora en la solución de problemas sencillos.'
  },

  // Dominio Comunicativo (Ubicado en interior + continuación en contraportada)
  {
    id: 'ki-com-1',
    code: 'COM-1',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Sigue una secuencia en el uso de textos orales que escucha, en situaciones cotidianas de comunicación.',
    shortText: 'Sigue secuencia en textos orales que escucha.'
  },
  {
    id: 'ki-com-2',
    code: 'COM-2',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Formula y responde a preguntas, al obtener informaciones sobre temas de su interés.',
    shortText: 'Formula y responde preguntas para obtener información.'
  },
  {
    id: 'ki-com-3',
    code: 'COM-3',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Asume progresivamente normas de comunicación establecidas.',
    shortText: 'Asume normas de comunicación establecidas.'
  },
  {
    id: 'ki-com-4',
    code: 'COM-4',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Usa frases sencillas organizadas en forma lógica, crítica y creativa en la descripción de situaciones cotidianas.',
    shortText: 'Usa frases sencillas en descripciones lógicas.'
  },
  {
    id: 'ki-com-5',
    code: 'COM-5',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Produce textos orales y los expone en lenguaje no verbal (gestos, ademanes, postura…) y paraverbal.',
    shortText: 'Produce textos orales con lenguaje no verbal.'
  },
  {
    id: 'ki-com-6',
    code: 'COM-6',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Escucha su nombre e intenta escribirlo de manera no convencional o progresivamente convencional.',
    shortText: 'Escucha e intenta escribir su nombre (convencional/no).'
  },
  {
    id: 'ki-com-7',
    code: 'COM-7',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Utiliza la narración en las formas convencionales de lectura con ayuda del adulto.',
    shortText: 'Utiliza la narración en lectura con ayuda.'
  },
  {
    id: 'ki-com-8',
    code: 'COM-8',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Responde a preguntas sencillas sobre la idea general de un texto.',
    shortText: 'Responde a preguntas sobre idea general de un texto.'
  },
  {
    id: 'ki-com-9',
    code: 'COM-9',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Interpreta mensajes a partir de imágenes y símbolos, en textos sencillos y establece comparaciones progresivas en palabras que inician o terminan similar.',
    shortText: 'Interpreta mensajes de imágenes/símbolos.'
  },
  {
    id: 'ki-com-10',
    code: 'COM-10',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Lee progresivamente, de manera no convencional o convencional, imágenes y palabras en textos sencillos.',
    shortText: 'Lee progresivamente imágenes y palabras.'
  },
  {
    id: 'ki-com-11',
    code: 'COM-11',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Expresa con sus palabras ideas o información escuchadas o leídas en textos funcionales y literarios.',
    shortText: 'Expresa ideas de textos leídos con sus palabras.'
  },
  {
    id: 'ki-com-12',
    code: 'COM-12',
    domainId: 'comunicativo',
    grade: 'Kínder',
    text: 'Reproduce o produce textos basados en situaciones reales e imaginarias de manera no convencional y progresivamente convencional.',
    shortText: 'Reproduce/produce textos basados en situaciones.'
  }
];

// Indicators for Preprimario (5 Años)
export const PREPRIMARIO_INDICATORS: Indicator[] = [
  // Dominio Socioemocional
  {
    id: 'prep-se-1',
    code: 'SE-1',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Comunica sus ideas, pensamientos, emociones y experiencias con la intención de que otros comprendan el mensaje.',
    shortText: 'Comunica ideas y emociones con intención clara.'
  },
  {
    id: 'prep-se-2',
    code: 'SE-2',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Utiliza técnicas y materiales en sus producciones para expresar sus emociones, sentimientos, ideas y experiencias.',
    shortText: 'Usa técnicas para expresar sentimientos/experiencias.'
  },
  {
    id: 'prep-se-3',
    code: 'SE-3',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Expresa ideas y sentimientos a través de producciones digitales en creación de imágenes, formas y sonidos.',
    shortText: 'Expresa ideas a través de producciones digitales.'
  },
  {
    id: 'prep-se-4',
    code: 'SE-4',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Conversa sobre distintos temas escuchando y valorando la opinión de los demás.',
    shortText: 'Conversa sobre distintos temas escuchando a otros.'
  },
  {
    id: 'prep-se-5',
    code: 'SE-5',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Comunica su opinión sustentada con razones sobre situaciones cotidianas.',
    shortText: 'Comunica opinión sustentada con razones.'
  },
  {
    id: 'prep-se-6',
    code: 'SE-6',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Colabora en la elaboración de un plan de solución sencillo sobre un problema identificado.',
    shortText: 'Colabora en plan de solución de problemas.'
  },
  {
    id: 'prep-se-7',
    code: 'SE-7',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Identifica a los miembros de su familia algunas costumbres, tradiciones y ocupaciones de su comunidad.',
    shortText: 'Identifica miembros de familia y costumbres.'
  },
  {
    id: 'prep-se-8',
    code: 'SE-8',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Cumple con sus deberes realizando las actividades escolares que le son solicitadas.',
    shortText: 'Cumple deberes y actividades escolares.'
  },
  {
    id: 'prep-se-9',
    code: 'SE-9',
    domainId: 'socioemocional',
    grade: 'Preprimario',
    text: 'Comenta sobre las historias, y personajes de su familia y la comunidad.',
    shortText: 'Comenta historias/personajes de familia/comunidad.'
  },

  // Dominio Artístico y Creativo
  {
    id: 'prep-art-1',
    code: 'ART-1',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Selecciona y combina colores primarios y secundarios, utilizándolos con intencionalidad en sus producciones plásticas bidimensionales y tridimensionales.',
    shortText: 'Combina colores primarios/secundarios intencionalmente.'
  },
  {
    id: 'prep-art-2',
    code: 'ART-2',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Reproduce algunos elementos de la cultura dominicana y de otras culturas, utilizando elementos de los lenguajes artísticos.',
    shortText: 'Reproduce elementos de cultura dominicana/otras.'
  },
  {
    id: 'prep-art-3',
    code: 'ART-3',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Reproduce o continua a partir de modelos, patrones rítmicos y melódicos con su cuerpo e instrumentos musicales.',
    shortText: 'Reproduce/crea patrones rítmicos y melódicos.'
  },
  {
    id: 'prep-art-4',
    code: 'ART-4',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Danza en forma espontánea, rítmica y con materiales diversos.',
    shortText: 'Danza en forma espontánea con materiales diversos.'
  },
  {
    id: 'prep-art-5',
    code: 'ART-5',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Dibuja libremente con mayor precisión e intencionalidad comunicativa, agregando progresivamente elementos del lenguaje plástico.',
    shortText: 'Dibuja con precisión e intencionalidad comunicativa.'
  },
  {
    id: 'prep-art-6',
    code: 'ART-6',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Crea figuras bidimensionales y tridimensionales utilizando el papel.',
    shortText: 'Crea figuras 2D y 3D utilizando papel.'
  },
  {
    id: 'prep-art-7',
    code: 'ART-7',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Describe la trama y la participación de algunos personajes de dramatizaciones y obras de títeres.',
    shortText: 'Describe trama/personajes de dramatizaciones.'
  },
  {
    id: 'prep-art-8',
    code: 'ART-8',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Maneja títeres sencillos, junto a compañeros y compañeras, contando historias para otras personas.',
    shortText: 'Maneja títeres contando historias a otros.'
  },
  {
    id: 'prep-art-9',
    code: 'ART-9',
    domainId: 'artistico',
    grade: 'Preprimario',
    text: 'Representa situaciones reales e imaginarias a partir de poesías, canciones o cuentos.',
    shortText: 'Representa situaciones a partir de poesía/cuentos.'
  },

  // Dominio Psicomotor y de Salud
  {
    id: 'prep-pm-1',
    code: 'PM-1',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Comunica a través del movimiento una idea, sentimientos o experiencia incorporando objetos al juego o improvisaciones lúdicas.',
    shortText: 'Comunica ideas a través del movimiento y juego.'
  },
  {
    id: 'prep-pm-2',
    code: 'PM-2',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Identifica su lateralidad en la realización de acciones motrices y en la ejecución de diferentes tipos de formaciones.',
    shortText: 'Identifica lateralidad en acciones y formaciones.'
  },
  {
    id: 'prep-pm-3',
    code: 'PM-3',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Expresa su disponibilidad corporal para la realización y disfrute de la actividad física.',
    shortText: 'Expresa disponibilidad para actividad física.'
  },
  {
    id: 'prep-pm-4',
    code: 'PM-4',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Participa en juegos grupales reglados, aceptando y cumpliendo los procedimientos acordados en el grupo.',
    shortText: 'Participa en juegos reglados cumpliendo normas.'
  },
  {
    id: 'prep-pm-5',
    code: 'PM-5',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Realiza movimientos con algunas partes de su cuerpo de manera coordinada en el espacio parcial y total.',
    shortText: 'Realiza movimientos coordinados en espacio total.'
  },
  {
    id: 'prep-pm-6',
    code: 'PM-6',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Realiza movimientos en diferentes direcciones, posiciones y velocidades, según indicaciones.',
    shortText: 'Realiza movimientos (dirección/posición/velocidad).'
  },
  {
    id: 'prep-pm-7',
    code: 'PM-7',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Se desplaza en diferentes direcciones y posiciones manteniendo el equilibrio y el control postural.',
    shortText: 'Se desplaza con equilibrio y control postural.'
  },
  {
    id: 'prep-pm-8',
    code: 'PM-8',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Experimenta con su cuerpo movimiento, estiramiento, respiración, relajación y descanso.',
    shortText: 'Experimenta estiramiento, respiración y relajación.'
  },
  {
    id: 'prep-pm-9',
    code: 'PM-9',
    domainId: 'psicomotor',
    grade: 'Preprimario',
    text: 'Cuida su cuerpo, el de los y las demás, practicando hábitos de higiene antes, durante y después de actividades.',
    shortText: 'Cuida su cuerpo practicando hábitos de higiene.'
  },

  // Dominio Descubrimiento del Mundo
  {
    id: 'prep-dm-1',
    code: 'DM-1',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Participa en pequeños experimentos utilizando elementos manipulables y seguros, realizando inferencias y registrando los resultados.',
    shortText: 'Experimenta, infiere y registra resultados.'
  },
  {
    id: 'prep-dm-2',
    code: 'DM-2',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Comunica resultados de la exploración del entorno natural de forma oral, escrita o gráfica.',
    shortText: 'Comunica resultados de exploración (oral/escrita/gráfica).'
  },
  {
    id: 'prep-dm-3',
    code: 'DM-3',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Identifica algunas semejanzas y diferencias entre seres vivos de su entorno.',
    shortText: 'Identifica semejanzas/diferencias en seres vivos.'
  },
  {
    id: 'prep-dm-4',
    code: 'DM-4',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Cuestiona, observa y explora su entorno natural profundizando sobre temas de interés.',
    shortText: 'Cuestiona y explora entorno profundizando temas.'
  },
  {
    id: 'prep-dm-5',
    code: 'DM-5',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Usa utensilios, artefactos y tecnologías de su entorno al realizar experimentos sencillos.',
    shortText: 'Usa TIC y artefactos en experimentos/tareas.'
  },
  {
    id: 'prep-dm-6',
    code: 'DM-6',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Aplica los pasos del método científico de forma guiada al responder interrogantes.',
    shortText: 'Aplica pasos del método científico con apoyo.'
  },
  {
    id: 'prep-dm-7',
    code: 'DM-7',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Describe algunos eventos y fenómenos naturales, así como las medidas de seguridad.',
    shortText: 'Describe eventos, fenómenos naturales y seguridad.'
  },
  {
    id: 'prep-dm-8',
    code: 'DM-8',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Colabora en actividades de manejo adecuado de desechos y reciclaje.',
    shortText: 'Colabora en manejo de desechos y reciclaje.'
  },
  {
    id: 'prep-dm-9',
    code: 'DM-9',
    domainId: 'descubrimiento',
    grade: 'Preprimario',
    text: 'Participa en proyectos sobre problemáticas sencillas que afectan su comunidad y propone acciones para el cuidado del medio ambiente.',
    shortText: 'Participa en proyectos y propone acciones ambientales.'
  },

  // Dominio Cognitivo
  {
    id: 'prep-cog-1',
    code: 'COG-1',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Interpreta imágenes, gráficas o símbolos matemáticos no convencionales y convencionales que representan informaciones de su entorno.',
    shortText: 'Interpreta gráficas/símbolos matemáticos del entorno.'
  },
  {
    id: 'prep-cog-2',
    code: 'COG-2',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Descubre orden lógico y secuencia numérica para completar una serie numérica hasta el 9.',
    shortText: 'Completa series numéricas hasta el 9.'
  },
  {
    id: 'prep-cog-3',
    code: 'COG-3',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Realiza operaciones de adición y sustracción con objetos concretos y representaciones para resolver problemas sencillos.',
    shortText: 'Realiza adición/sustracción con objetos/representaciones.'
  },
  {
    id: 'prep-cog-4',
    code: 'COG-4',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Agrupa objetos por iguales características dadas por otras personas o criterios propios y ofrece explicaciones.',
    shortText: 'Agrupa objetos, explica criterios y analiza situaciones.'
  },
  {
    id: 'prep-cog-5',
    code: 'COG-5',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Realiza agrupaciones de objetos de acuerdo con uno o más atributos en la organización de informaciones.',
    shortText: 'Realiza agrupaciones para organizar información.'
  },
  {
    id: 'prep-cog-6',
    code: 'COG-6',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Reproduce o crea patrones matemáticos de tamaño, longitud, cantidad o posición.',
    shortText: 'Reproduce/crea patrones (tamaño, longitud, cantidad).'
  },
  {
    id: 'prep-cog-7',
    code: 'COG-7',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Utiliza informaciones sobre personas, animales u objetos conocidos para apoyar sus explicaciones o creencias.',
    shortText: 'Apoya explicaciones con información conocida.'
  },
  {
    id: 'prep-cog-8',
    code: 'COG-8',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Identifica progresivamente actividades de la vida diaria que se encuentran organizadas por patrones.',
    shortText: 'Identifica patrones en actividades diarias.'
  },
  {
    id: 'prep-cog-9',
    code: 'COG-9',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Organiza sus ideas para realizar juegos y actividades de la vida cotidiana.',
    shortText: 'Organiza ideas para juegos y actividades.'
  },
  {
    id: 'prep-cog-10',
    code: 'COG-10',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Participa en juegos que abordan procesos lógicos respetando las reglas establecidas y a los participantes.',
    shortText: 'Participa en juegos lógicos respetando reglas.'
  },
  {
    id: 'prep-cog-11',
    code: 'COG-11',
    domainId: 'cognitivo',
    grade: 'Preprimario',
    text: 'Participa en la búsqueda y selección de alternativas al solucionar problemas sencillos.',
    shortText: 'Participa en búsqueda de soluciones a problemas.'
  },

  // Dominio Comunicativo (Ubicado en Contraportada / Continuación)
  {
    id: 'prep-com-1',
    code: 'COM-1',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Sigue una secuencia en el uso de textos orales que escucha, en situaciones cotidianas de comunicación.',
    shortText: 'Sigue una secuencia en textos orales escuchados.'
  },
  {
    id: 'prep-com-2',
    code: 'COM-2',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Formula y responde a preguntas, al obtener informaciones sobre temas de su interés.',
    shortText: 'Formula y responde preguntas para obtener información.'
  },
  {
    id: 'prep-com-3',
    code: 'COM-3',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Asume progresivamente normas de comunicación establecidas.',
    shortText: 'Asume normas de comunicación establecidas.'
  },
  {
    id: 'prep-com-4',
    code: 'COM-4',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Responde a preguntas sencillas sobre la idea general de un texto.',
    shortText: 'Responde preguntas sencillas sobre idea general de un texto.'
  },
  {
    id: 'prep-com-5',
    code: 'COM-5',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Interpreta mensajes a partir de imágenes y símbolos, en textos sencillos y establece comparaciones progresivas en palabras que inician o terminan similar.',
    shortText: 'Interpreta mensajes a partir de imágenes y símbolos.'
  },
  {
    id: 'prep-com-6',
    code: 'COM-6',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Lee progresivamente, de manera no convencional o convencional, imágenes y palabras en textos sencillos.',
    shortText: 'Lee progresivamente (convencional/no) imágenes y palabras.'
  },
  {
    id: 'prep-com-7',
    code: 'COM-7',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Expresa con sus palabras ideas o información escuchadas o leídas en textos funcionales y literarios.',
    shortText: 'Expresa ideas de textos escuchados o leídos.'
  },
  {
    id: 'prep-com-8',
    code: 'COM-8',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Escribe su nombre de manera no convencional o progresivamente convencional.',
    shortText: 'Escribe su nombre de manera no convencional o convencional.'
  },
  {
    id: 'prep-com-9',
    code: 'COM-9',
    domainId: 'comunicativo',
    grade: 'Preprimario',
    text: 'Reproduce o produce textos basados en situaciones reales e imaginarias de manera no convencional y convencional.',
    shortText: 'Produce textos basados en situaciones reales/imaginarias.'
  }
];

export function getIndicatorsByGrade(grade: GradeLevel): Indicator[] {
  switch (grade) {
    case 'Prekínder':
      return PREKINDER_INDICATORS;
    case 'Kínder':
      return KINDER_INDICATORS;
    case 'Preprimario':
      return PREPRIMARIO_INDICATORS;
    default:
      return PREPRIMARIO_INDICATORS;
  }
}
