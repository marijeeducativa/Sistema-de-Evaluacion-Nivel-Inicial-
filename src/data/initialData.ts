import { Student, Teacher, SchoolInfo, StudentEvaluationRecord, GradeLevel } from '../types';
import { getIndicatorsByGrade } from './minerdCurriculum';
import { extractFamilyName } from '../utils/familyName';

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  code: "05102",
  name: "Centro Educativo Santo Domingo",
  district: "Distrito 15-03",
  regional: "Regional 15",
  director: "Lic. Carmen Ortiz Valdez",
  coordinador: "Marije Guerrero",
  academicYear: "2024-2025",
  tanda: "Jornada Escolar Extendida",
  address: "Av. Independencia #104, Santo Domingo, D.N.",
  phone: "(809) 555-0142"
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "t_1789260629591",
    name: "Lissette Moreno",
    grade: "Prekínder",
    section: "A",
    phone: "809-555-1001"
  },
  {
    id: "t_1789260757139",
    name: "Argentina Santos",
    grade: "Prekínder",
    section: "B",
    phone: "809-555-1002"
  },
  {
    id: "t_1789260789747",
    name: "Rosa Martínez",
    grade: "Kínder",
    section: "A",
    phone: "809-555-1003"
  },
  {
    id: "t_1789260823974",
    name: "Anabelle Escoto",
    grade: "Kínder",
    section: "B",
    phone: "809-555-1004"
  },
  {
    id: "t_1789260861076",
    name: "Ilonki Almonte",
    grade: "Kínder",
    section: "C",
    phone: "809-555-1005"
  },
  {
    id: "t_1789260910506",
    name: "María Ysabel de la Cruz",
    grade: "Preprimario",
    section: "A",
    phone: "809-555-1006"
  },
  {
    id: "t_1789260944791",
    name: "Gladys Saviñón",
    grade: "Preprimario",
    section: "B",
    phone: "809-555-1007"
  },
  {
    id: "t_1789260973001",
    name: "Escarlyn Rosario",
    grade: "Preprimario",
    section: "C",
    phone: "809-555-1008"
  }
];

const RAW_STUDENTS: Student[] = [
  // Prekínder A
  { id: "std-pk-a-01", age: 3, grade: "Prekínder", section: "A", fullName: "LEYLA ALCANTARA SOTO", gender: "F", parentName: "Luisa Soto / Pedro Alcantara" },
  { id: "std-pk-a-02", age: 3, grade: "Prekínder", section: "A", fullName: "ZOE CAMILA SANTANA PADILLA", gender: "F", parentName: "Camila Padilla / Ramón Santana" },
  { id: "std-pk-a-03", age: 3, grade: "Prekínder", section: "A", fullName: "ROUX ARLETTE DE LA CRUZ SURIEL", gender: "F", parentName: "Arlette Suriel / Marcos De la Cruz" },
  { id: "std-pk-a-04", age: 3, grade: "Prekínder", section: "A", fullName: "CARLOS MANUEL DE LEON MORENO", gender: "M", parentName: "Manuel De Leon / Sofia Moreno" },
  { id: "std-pk-a-05", age: 3, grade: "Prekínder", section: "A", fullName: "ANA CECILIA JACOBO PEÑA", gender: "F", parentName: "Cecilia Peña / Juan Jacobo" },
  { id: "std-pk-a-06", age: 3, grade: "Prekínder", section: "A", fullName: "SOPHIA ESTHER LINARES GUTIERREZ", gender: "F", parentName: "Esther Gutierrez / David Linares" },
  { id: "std-pk-a-07", age: 3, grade: "Prekínder", section: "A", fullName: "ASHLY MARIAN LORENZO FERRERAS", gender: "F", parentName: "Marian Ferreras / José Lorenzo" },
  { id: "std-pk-a-08", age: 3, grade: "Prekínder", section: "A", fullName: "DEREK KHAEL MARTINEZ JUSTO", gender: "M", parentName: "Khael Justo / Maria Martinez" },
  { id: "std-pk-a-09", age: 3, grade: "Prekínder", section: "A", fullName: "LUCAS EMMANUEL ORTEGA ROJAS", gender: "M", parentName: "Lucas Ortega / Laura Rojas" },
  { id: "std-pk-a-10", age: 3, grade: "Prekínder", section: "A", fullName: "ARATH ESTEBAN PIMENTEL CARRASCO", gender: "M", parentName: "Esteban Pimentel / Karla Carrasco" },
  { id: "std-pk-a-11", age: 3, grade: "Prekínder", section: "A", fullName: "SAMUEL LEONIDAS PIÑA PONCEANO", gender: "M", parentName: "Leonidas Piña / Carmen Ponceano" },
  { id: "std-pk-a-12", age: 3, grade: "Prekínder", section: "A", fullName: "EMELY ESTHER RODRIGUEZ MIRABAL", gender: "F", parentName: "Carlos Rodriguez / Esther Mirabal" },
  { id: "std-pk-a-13", age: 3, grade: "Prekínder", section: "A", fullName: "NATHANIEL RODRIGUEZ PEREZ", gender: "M", parentName: "Nathaniel Rodriguez / Lucia Perez" },
  { id: "std-pk-a-14", age: 3, grade: "Prekínder", section: "A", fullName: "LOGAN ZAID SEGURA VERIGUETE", gender: "M", parentName: "Zaid Segura / Rosa Veriguete" },
  { id: "std-pk-a-15", age: 3, grade: "Prekínder", section: "A", fullName: "MATTHEW TEJEDA MEDINA", gender: "M", parentName: "Matthew Tejeda / Ana Medina" },
  { id: "std-pk-a-16", age: 3, grade: "Prekínder", section: "A", fullName: "LUCAS EMMANUEL TRONCOSO GALLARDO", gender: "M", parentName: "Emmanuel Troncoso / Patricia Gallardo" },
  { id: "std-pk-a-17", age: 3, grade: "Prekínder", section: "A", fullName: "KHALIL SAMUEL VASQUEZ GUERRERO", gender: "M", parentName: "Samuel Vasquez / Dilcia Guerrero" },
  { id: "std-pk-a-18", age: 3, grade: "Prekínder", section: "A", fullName: "ATENEA VITTINI GUZMAN", gender: "F", parentName: "Hector Vittini / Clara Guzman" },
  { id: "std-pk-a-19", age: 3, grade: "Prekínder", section: "A", fullName: "DAFNE MARGOT WILLIAMS UREÑA", gender: "F", parentName: "Daphne Ureña / Margot Williams" },

  // Prekínder B
  { id: "std-1789511791436-x2tf", age: 3, grade: "Prekínder", section: "B", fullName: "ENOC JOSÉ ASENCIO DÍAZ", birthDate: "2023-10-28", gender: "M", parentName: "José Asencio / Ruth Díaz" },
  { id: "std-1789391856650-0-feju", age: 3, grade: "Prekínder", section: "B", fullName: "BARUC DE JESUS ABREU AVILA", gender: "M", parentName: "Jesús Abreu / Maria Avila" },
  { id: "std-1789391856650-1-y7mk", age: 3, grade: "Prekínder", section: "B", fullName: "DEYLANI ANDREA AGUERO BENITEZ", gender: "F", parentName: "Andrea Benitez / Deylan Aguero" },
  { id: "std-1789391856650-2-qdvy", age: 3, grade: "Prekínder", section: "B", fullName: "LEILANY DANERIS BELTRE PEREZ", gender: "F", parentName: "Daneris Perez / Leilany Beltre" },
  { id: "std-1789391856650-3-xbv2", age: 3, grade: "Prekínder", section: "B", fullName: "AYSHA ISABELLA BIDO ROSARIO", gender: "F", parentName: "Isabella Rosario / Juan Bido" },
  { id: "std-1789391856650-4-7lod", age: 3, grade: "Prekínder", section: "B", fullName: "JUAN DAVID BRITO ORTIZ", gender: "M", parentName: "David Brito / Carmen Ortiz" },
  { id: "std-1789391856650-5-jj20", age: 3, grade: "Prekínder", section: "B", fullName: "DEREK JORGE CORPORAN GUZMAN", gender: "M", parentName: "Jorge Corporan / Elena Guzman" },
  { id: "std-1789391856650-6-a9gp", age: 3, grade: "Prekínder", section: "B", fullName: "SAED EMMANUEL CRUZ MOTA", gender: "M", parentName: "Emmanuel Cruz / Rosa Mota" },
  { id: "std-1789391856650-7-is8i", age: 3, grade: "Prekínder", section: "B", fullName: "JAZLYN GONZALEZ PAREDES", gender: "F", parentName: "Jazlyn Paredes / Oscar Gonzalez" },
  { id: "std-1789391856650-8-gb52", age: 3, grade: "Prekínder", section: "B", fullName: "MICHAEL JOSE HERMANN ROJAS", gender: "M", parentName: "José Hermann / Sandra Rojas" },
  { id: "std-1789391856650-9-zig0", age: 3, grade: "Prekínder", section: "B", fullName: "JOSE ALEJANDRO INFANTE TOLENTINO", gender: "M", parentName: "Alejandro Infante / Juana Tolentino" },
  { id: "std-1789391856650-10-3ri5", age: 3, grade: "Prekínder", section: "B", fullName: "ALANNA LINAREZ PERREÑO", gender: "F", parentName: "Perreño Linarez / Alanna Linarez" },
  { id: "std-1789391856650-11-boe3", age: 3, grade: "Prekínder", section: "B", fullName: "ADAIA MATOS FRIAS", gender: "F", parentName: "Matos Frias / Adaia Frias" },
  { id: "std-1789391856650-12-0cf2", age: 3, grade: "Prekínder", section: "B", fullName: "DYLAN MANUEL MORCELO ALAVREZ", gender: "M", parentName: "Manuel Morcelo / Ana Alvarez" },
  { id: "std-1789391856650-13-sq6z", age: 3, grade: "Prekínder", section: "B", fullName: "LEIAH ARLETTE NOVA BRITO", gender: "F", parentName: "Arlette Brito / Carlos Nova" },
  { id: "std-1789391856650-14-41cn", age: 3, grade: "Prekínder", section: "B", fullName: "LUCIA VALENTINA PEREYRA TEJEDA", gender: "F", parentName: "Valentina Tejeda / Marcos Pereyra" },
  { id: "std-1789391856650-15-815o", age: 3, grade: "Prekínder", section: "B", fullName: "AURORA SOFIA QUEZADA ESTEVEZ", gender: "F", parentName: "Sofia Estevez / Luis Quezada" },
  { id: "std-1789391856650-16-uth2", age: 3, grade: "Prekínder", section: "B", fullName: "ZAOMI VASQUEZ MARTE", gender: "F", parentName: "Zaomi Marte / Jorge Vasquez" },
  { id: "std-1789391856650-17-hjn4", age: 3, grade: "Prekínder", section: "B", fullName: "DEBBIE MARGOT WILLIAMS UREÑA", gender: "F", parentName: "Margot Ureña / Williams Paul" },
  { id: "std-1789391856650-18-5k30", age: 3, grade: "Prekínder", section: "B", fullName: "ANA VICTORIA INOA TAVERAS", gender: "F", parentName: "Victoria Taveras / Carlos Inoa" },

  // Kínder A
  { id: "std-1789657658312-mj6p", age: 4, grade: "Kínder", section: "A", fullName: "DENISSE MARGOT WILLIAMS UREÑA", gender: "F", parentName: "Margot Williams / David Ureña" },
  { id: "std-1789657573545-o4f4", age: 4, grade: "Kínder", section: "A", fullName: "NASLY VERDECIA QUEZADA", gender: "F", parentName: "Verdecia Quezada / Nasly Paul" },
  { id: "std-1789391904282-1-zogx", age: 4, grade: "Kínder", section: "A", fullName: "RICARSOPH PHEDRE AUBOURG EDMOND", gender: "M", parentName: "Edmond Aubourg / Phedre Edmond" },
  { id: "std-1789391904282-2-ho85", age: 4, grade: "Kínder", section: "A", fullName: "DANIBEL JULIETTE CEDEÑO JESUS", gender: "F", parentName: "Juliette Jesus / Danibel Cedeño" },
  { id: "std-1789391904282-3-p6ab", age: 4, grade: "Kínder", section: "A", fullName: "VALENTINA VICTORIA GOMEZ RAMIREZ", gender: "F", parentName: "Victoria Ramirez / Carlos Gomez" },
  { id: "std-1789391904282-4-e4aw", age: 4, grade: "Kínder", section: "A", fullName: "JOEL LIMA MOTA", gender: "M", parentName: "Lima Mota / Joel Mota" },
  { id: "std-1789391904282-5-w0zs", age: 4, grade: "Kínder", section: "A", fullName: "STACY LORA ANTIGUA", gender: "F", parentName: "Lora Antigua / Stacy Antigua" },
  { id: "std-1789391904282-6-qvxq", age: 4, grade: "Kínder", section: "A", fullName: "GREICY THAIS MARTINEZ ESTEVEZ", gender: "F", parentName: "Thais Estevez / Jose Martinez" },
  { id: "std-1789391904282-7-of6o", age: 4, grade: "Kínder", section: "A", fullName: "REYNA IRIS MUÑOZ SANTOS", gender: "F", parentName: "Iris Santos / Reyna Muñoz" },
  { id: "std-1789391904282-9-70my", age: 4, grade: "Kínder", section: "A", fullName: "LIAM QUIÑONES VARGAS", gender: "M", parentName: "Vargas Quiñones / Liam Quiñones" },
  { id: "std-1789391904282-10-sqet", age: 4, grade: "Kínder", section: "A", fullName: "DAIRYS RODRIGUEZ HERNANDEZ", gender: "F", parentName: "Rodriguez Hernandez / Dairys Hernandez" },
  { id: "std-1789391904282-11-55sn", age: 4, grade: "Kínder", section: "A", fullName: "ZOE AMAIA RODRIGUEZ LOGROÑO", gender: "F", parentName: "Rodriguez Logroño / Zoe Rodriguez" },
  { id: "std-1789391904282-12-djqk", age: 4, grade: "Kínder", section: "A", fullName: "GABRIEL DE JESUS SANCHEZ HERNANDEZ", gender: "M", parentName: "Sanchez Hernandez / Gabriel Sanchez" },
  { id: "std-1789391904282-13-mzya", age: 4, grade: "Kínder", section: "A", fullName: "RUBI SAMIRA SANTANA MARTINEZ", gender: "F", parentName: "Santana Martinez / Rubi Santana" },

  // Kínder B
  { id: "std-1789575316079-03ik", age: 4, grade: "Kínder", section: "B", fullName: "VALENTIN OYARZO RODRIGUEZ", gender: "M", parentName: "Rodriguez Oyarzo / Valentin Oyarzo" },
  { id: "std-1789575001624-5lt9", age: 4, grade: "Kínder", section: "B", fullName: "GIULIA DIFO MENA", gender: "F", parentName: "Difo Mena / Giulia Difo" },
  { id: "std-1789391957922-0-qota", age: 4, grade: "Kínder", section: "B", fullName: "ABBY ACEVEDO GUERRERO", gender: "F", parentName: "Acevedo Guerrero / Abby Guerrero" },
  { id: "std-1789391957922-1-r4l9", age: 4, grade: "Kínder", section: "B", fullName: "MARCOS JAVIER DE LEON MORENO", gender: "M", parentName: "De Leon Moreno / Marcos De Leon" },
  { id: "std-1789391957922-2-v41u", age: 4, grade: "Kínder", section: "B", fullName: "LUCAS DURAN GARCIA", gender: "M", parentName: "Duran Garcia / Lucas Garcia" },
  { id: "std-1789391957922-3-jkt7", age: 4, grade: "Kínder", section: "B", fullName: "DAVID RAFAEL ESCOTO HERNANDEZ", gender: "M", parentName: "Escoto Hernandez / David Escoto" },
  { id: "std-1789391957922-4-avd2", age: 4, grade: "Kínder", section: "B", fullName: "ZAMAR SOPHIA GOMEZ PEREZ", gender: "F", parentName: "Gomez Perez / Zamar Perez" },
  { id: "std-1789391957922-5-lh6e", age: 4, grade: "Kínder", section: "B", fullName: "AYA DENIS JIMENEZ MELENDEZ", gender: "F", parentName: "Jimenez Melendez / Aya Denis" },
  { id: "std-1789391957922-6-6b13", age: 4, grade: "Kínder", section: "B", fullName: "DANIEL ALEXANDER MARTE CABA", gender: "M", parentName: "Marte Caba / Daniel Marte" },
  { id: "std-1789391957922-7-yexy", age: 4, grade: "Kínder", section: "B", fullName: "THIAGO MATOS FRIAS", gender: "M", parentName: "Matos Frias / Thiago Matos" },
  { id: "std-1789391957922-8-pl7x", age: 4, grade: "Kínder", section: "B", fullName: "AYMEE LARIMAR MEDINA FLORENTINO", gender: "F", parentName: "Medina Florentino / Aymee Florentino" },
  { id: "std-1789391957922-9-2uko", age: 4, grade: "Kínder", section: "B", fullName: "ELLA DARLAYNE MENA JIMENEZ", gender: "F", parentName: "Mena Jimenez / Ella Jimenez" },
  { id: "std-1789391957922-10-tdbw", age: 4, grade: "Kínder", section: "B", fullName: "ALEJANDRO PERALTA BINET", gender: "M", parentName: "Peralta Binet / Alejandro Peralta" },
  { id: "std-1789391957922-12-wn3s", age: 4, grade: "Kínder", section: "B", fullName: "IAN MATTEO ROMERO PIMENTEL", gender: "M", parentName: "Romero Pimentel / Ian Romero" },
  { id: "std-1789391957922-13-aija", age: 4, grade: "Kínder", section: "B", fullName: "MIA KAMILA SANCHEZ CARMONA", gender: "F", parentName: "Sanchez Carmona / Mia Sanchez" },

  // Kínder C
  { id: "std-1789392007609-0-pq12", age: 4, grade: "Kínder", section: "C", fullName: "BRITTANY JAZMEILYN ACOSTA GRULLON", gender: "F", parentName: "Acosta Grullon / Brittany Acosta" },
  { id: "std-1789392007609-1-sbs7", age: 4, grade: "Kínder", section: "C", fullName: "DELAYLA ACOSTA LUGO", gender: "F", parentName: "Acosta Lugo / Delayla Lugo" },
  { id: "std-1789392007609-2-qp6o", age: 4, grade: "Kínder", section: "C", fullName: "ALEJANDRA ESPINAL VALENZUELA", gender: "F", parentName: "Espinal Valenzuela / Alejandra Valenzuela" },
  { id: "std-1789392007609-3-5yyx", age: 4, grade: "Kínder", section: "C", fullName: "AILEEN KENYA MERCEDES HERNANDEZ", gender: "F", parentName: "Mercedes Hernandez / Aileen Mercedes" },
  { id: "std-1789392007609-4-42xb", age: 4, grade: "Kínder", section: "C", fullName: "JADE SOFIA MORILLO ADAMES", gender: "F", parentName: "Morillo Adames / Jade Morillo" },
  { id: "std-1789392007609-5-fmve", age: 4, grade: "Kínder", section: "C", fullName: "ALONSO NADAL DE OLEO", gender: "M", parentName: "Nadal De Oleo / Alonso Nadal" },
  { id: "std-1789392007609-6-cn42", age: 4, grade: "Kínder", section: "C", fullName: "BRUNO OYARZO RODRIGUEZ", gender: "M", parentName: "Oyarzo Rodriguez / Bruno Rodriguez" },
  { id: "std-1789392007609-7-7mal", age: 4, grade: "Kínder", section: "C", fullName: "AMY GABRIELLA PEÑA CONCEPCION", gender: "F", parentName: "Peña Concepcion / Amy Peña" },
  { id: "std-1789392007609-8-bhci", age: 4, grade: "Kínder", section: "C", fullName: "MOISES ARTURO PEREZ MEDINA", gender: "M", parentName: "Perez Medina / Moises Medina" },
  { id: "std-1789392007609-9-78su", age: 4, grade: "Kínder", section: "C", fullName: "SELIDÉS LUCÍA REYES CAIRO", gender: "F", parentName: "Reyes Cairo / Selidés Reyes" },
  { id: "std-1789392007609-10-o12b", age: 4, grade: "Kínder", section: "C", fullName: "ETHAN GAEL ROSARIO LLULIS", gender: "M", parentName: "Rosario Llulis / Ethan Rosario" },
  { id: "std-1789392007609-11-f93e", age: 4, grade: "Kínder", section: "C", fullName: "BRYAN SEBASTIAN RUIZ LOPEZ", gender: "M", parentName: "Ruiz Lopez / Bryan Ruiz" },
  { id: "std-1789392007609-12-lfo0", age: 4, grade: "Kínder", section: "C", fullName: "ENRIQUE SANCHEZ ALVARADO", gender: "M", parentName: "Sanchez Alvarado / Enrique Alvarado" },
  { id: "std-1789392007609-13-wa7g", age: 4, grade: "Kínder", section: "C", fullName: "JADE SANCHEZ AMADOR", gender: "F", parentName: "Sanchez Amador / Jade Sanchez" },
  { id: "std-1789392007609-14-3lta", age: 4, grade: "Kínder", section: "C", fullName: "BRUNO TAVERAS RODRIGUEZ", gender: "M", parentName: "Taveras Rodriguez / Bruno Taveras" },
  { id: "std-1789392007609-15-hlb0", age: 4, grade: "Kínder", section: "C", fullName: "LUCAS VERDECIA CAMPINS", gender: "M", parentName: "Verdecia Campins / Lucas Verdecia" },

  // Preprimario A
  { id: "std-1789392059043-0-gnxp", age: 5, grade: "Preprimario", section: "A", fullName: "MATEO ADAIR ALICEA CASTILLO", gender: "M", parentName: "Alicea Castillo / Mateo Alicea" },
  { id: "std-1789392059043-1-1c14", age: 5, grade: "Preprimario", section: "A", fullName: "ERIDALYS MARIE ALMONTE MORONTA", gender: "F", parentName: "Almonte Moronta / Eridalys Almonte" },
  { id: "std-1789392059043-2-siep", age: 5, grade: "Preprimario", section: "A", fullName: "SOPHIA ISABELLA CASTILLO LARA", gender: "F", parentName: "Castillo Lara / Sophia Castillo" },
  { id: "std-1789392059043-3-20jf", age: 5, grade: "Preprimario", section: "A", fullName: "ADRIAN JESUS CEPEDA MENDEZ", gender: "M", parentName: "Cepeda Mendez / Adrian Cepeda" },
  { id: "std-1789392059043-4-e19z", age: 5, grade: "Preprimario", section: "A", fullName: "RAYSHEL MARIE CONTRERAS JUSTO", gender: "F", parentName: "Contreras Justo / Rayshel Justo" },
  { id: "std-1789392059043-5-a8nn", age: 5, grade: "Preprimario", section: "A", fullName: "DANIELLA SOPHIA DEL FORN FIGUEROA", gender: "F", parentName: "Del Forn Figueroa / Daniella Del Forn" },
  { id: "std-1789392059043-6-rbjd", age: 5, grade: "Preprimario", section: "A", fullName: "ISABELLA NICOLE DEL FORN FIGUEROA", gender: "F", parentName: "Del Forn Figueroa / Isabella Del Forn" },
  { id: "std-1789392059043-7-7pfj", age: 5, grade: "Preprimario", section: "A", fullName: "DAYNALEET KRISTAL DILONE PICHARDO", gender: "F", parentName: "Dilone Pichardo / Daynaleet Pichardo" },
  { id: "std-1789392059043-8-g4ci", age: 5, grade: "Preprimario", section: "A", fullName: "NOAH JANIEL HILARIO NIVAR", gender: "M", parentName: "Hilario Nivar / Noah Hilario" },
  { id: "std-1789392059043-9-ikjb", age: 5, grade: "Preprimario", section: "A", fullName: "EYLEEN AMALIA LLUBERES FELIZ", gender: "F", parentName: "Lluberes Feliz / Eyleen Lluberes" },
  { id: "std-1789392059043-10-nwo2", age: 5, grade: "Preprimario", section: "A", fullName: "PABLO MARIN CAPELLAN", gender: "M", parentName: "Marin Capellan / Pablo Capellan" },
  { id: "std-1789392059043-11-8h06", age: 5, grade: "Preprimario", section: "A", fullName: "AINHOA FRANCELIS MARTE MEJIA", gender: "F", parentName: "Marte Mejia / Ainhoa Marte" },
  { id: "std-1789392059043-12-x8w2", age: 5, grade: "Preprimario", section: "A", fullName: "THIAGO ELIAS MEDRANO ORTIZ", gender: "M", parentName: "Medrano Ortiz / Thiago Medrano" },
  { id: "std-1789392059043-13-h5xl", age: 5, grade: "Preprimario", section: "A", fullName: "YENNIFER NATHALY PAREDES GONZALEZ", gender: "F", parentName: "Paredes Gonzalez / Yennifer Paredes" },
  { id: "std-1789392059043-14-2wwi", age: 5, grade: "Preprimario", section: "A", fullName: "GAEL EDUANKY PAREDES PEREZ", gender: "M", parentName: "Paredes Perez / Gael Paredes" },
  { id: "std-1789392059043-15-us2i", age: 5, grade: "Preprimario", section: "A", fullName: "CARLA MARIE POLANCO DE LOS SANTOS", gender: "F", parentName: "Polanco De Los Santos / Carla Polanco" },
  { id: "std-1789392059043-16-ac0m", age: 5, grade: "Preprimario", section: "A", fullName: "DYLAN QUEZADA ESTEVEZ", gender: "M", parentName: "Quezada Estevez / Dylan Quezada" },
  { id: "std-1789392059043-17-cnkq", age: 5, grade: "Preprimario", section: "A", fullName: "VALENTINA RICART BOYA", gender: "F", parentName: "Ricart Boya / Valentina Ricart" },
  { id: "std-1789392059043-18-o1vv", age: 5, grade: "Preprimario", section: "A", fullName: "ELI ODET SENA MORROBEL", gender: "F", parentName: "Sena Morrobel / Eli Sena" },

  // Preprimario B
  { id: "std-1789392118458-0-cgyk", age: 5, grade: "Preprimario", section: "B", fullName: "WESLY DAVID AGUERO BENITEZ", gender: "M", parentName: "Aguero Benitez / Wesly Aguero" },
  { id: "std-1789392118459-1-0uok", age: 5, grade: "Preprimario", section: "B", fullName: "GAEL ENOC BENNET PEREZ", gender: "M", parentName: "Bennet Perez / Gael Bennet" },
  { id: "std-1789392118459-2-rqv3", age: 5, grade: "Preprimario", section: "B", fullName: "EYMI JAMIN CUSTUDIO MATEO", gender: "F", parentName: "Custudio Mateo / Eymi Custudio" },
  { id: "std-1789392118459-3-grr6", age: 5, grade: "Preprimario", section: "B", fullName: "ZOE CHARLOTTE DISLA ENCARNACION", gender: "F", parentName: "Disla Encarnacion / Zoe Disla" },
  { id: "std-1789392118459-4-i8th", age: 5, grade: "Preprimario", section: "B", fullName: "KAMILA SARAI FANDUIZ MONTILLA", gender: "F", parentName: "Fanduiz Montilla / Kamila Fanduiz" },
  { id: "std-1789392118459-5-h0it", age: 5, grade: "Preprimario", section: "B", fullName: "VALERY MARIE GIRALDEZ HEREDIA", gender: "F", parentName: "Giraldez Heredia / Valery Heredia" },
  { id: "std-1789392118459-6-zr6w", age: 5, grade: "Preprimario", section: "B", fullName: "HAMLET MIGUEL HERMANN ROJAS", gender: "M", parentName: "Hermann Rojas / Hamlet Rojas" },
  { id: "std-1789392118459-7-84ph", age: 5, grade: "Preprimario", section: "B", fullName: "AMELIA MARINA HILARIO NUÑEZ", gender: "F", parentName: "Hilario Nuñez / Amelia Nuñez" },
  { id: "std-1789392118459-8-su3q", age: 5, grade: "Preprimario", section: "B", fullName: "JUAN ISAID LEDESMA PEREZ", gender: "M", parentName: "Ledesma Perez / Juan Ledesma" },
  { id: "std-1789392118459-9-88o3", age: 5, grade: "Preprimario", section: "B", fullName: "PRINCESA SIHARA MATEO ENCARNACION", gender: "F", parentName: "Mateo Encarnacion / Princesa Mateo" },
  { id: "std-1789392118459-10-unmh", age: 5, grade: "Preprimario", section: "B", fullName: "JAZLYN ZOE MORILLO ADAMES", gender: "F", parentName: "Morillo Adames / Jazlyn Morillo" },
  { id: "std-1789392118459-11-1fda", age: 5, grade: "Preprimario", section: "B", fullName: "GAEL NICOLAS MORILLO GOMEZ", gender: "M", parentName: "Morillo Gomez / Gael Morillo" },
  { id: "std-1789392118459-12-xsp3", age: 5, grade: "Preprimario", section: "B", fullName: "EITHAN ABDIEL PEREZ MATOS", gender: "M", parentName: "Perez Matos / Eithan Perez" },
  { id: "std-1789392118459-13-6cpo", age: 5, grade: "Preprimario", section: "B", fullName: "CHARLOTTE RODRIGUEZ", gender: "F", parentName: "Rodriguez Santos / Charlotte Rodriguez" },
  { id: "std-1789392118459-14-96x0", age: 5, grade: "Preprimario", section: "B", fullName: "JOSSIE ISABELLA SALAZAR ARIZA", gender: "F", parentName: "Salazar Ariza / Jossie Salazar" },
  { id: "std-1789392118459-15-33el", age: 5, grade: "Preprimario", section: "B", fullName: "LARA SANCHEZ MENENDEZ", gender: "F", parentName: "Sanchez Menendez / Lara Menendez" },
  { id: "std-1789392118459-16-642a", age: 5, grade: "Preprimario", section: "B", fullName: "KAYRHT YUDITH VALDEZ GUERRERO", gender: "F", parentName: "Valdez Guerrero / Kayrht Valdez" },
  { id: "std-1789392118459-17-xxdx", age: 5, grade: "Preprimario", section: "B", fullName: "DEREK DAMIAN VALERIO MUSSEB", gender: "M", parentName: "Valerio Musseb / Derek Valerio" },

  // Preprimario C
  { id: "std-1789392157666-0-r1me", age: 5, grade: "Preprimario", section: "C", fullName: "JULIET ALTAGRACIA ALMONTE MORONTA", gender: "F", parentName: "Almonte Moronta / Juliet Almonte" },
  { id: "std-1789392157666-1-yspb", age: 5, grade: "Preprimario", section: "C", fullName: "ZAID MIGUEL DIAZ PAULINO", gender: "M", parentName: "Diaz Paulino / Zaid Diaz" },
  { id: "std-1789392157666-2-x1z1", age: 5, grade: "Preprimario", section: "C", fullName: "MARIA ISABEL GUERRERO PINALES", gender: "F", parentName: "Guerrero Pinales / Maria Guerrero" },
  { id: "std-1789392157666-3-hn70", age: 5, grade: "Preprimario", section: "C", fullName: "DANIEL ESTEBAN MARTE VALENZUELA", gender: "M", parentName: "Marte Valenzuela / Daniel Marte" },
  { id: "std-1789392157666-4-wce0", age: 5, grade: "Preprimario", section: "C", fullName: "MILEIDY ALEXA MARTIR JIMENEZ", gender: "F", parentName: "Martir Jimenez / Mileidy Martir" },
  { id: "std-1789392157666-5-2iv9", age: 5, grade: "Preprimario", section: "C", fullName: "NOAH MATOS BATISTA", gender: "M", parentName: "Matos Batista / Noah Matos" },
  { id: "std-1789392157666-6-5ich", age: 5, grade: "Preprimario", section: "C", fullName: "MAXWELL MORILLO MOREL", gender: "M", parentName: "Morillo Morel / Maxwell Morillo" },
  { id: "std-1789392157666-7-wh2m", age: 5, grade: "Preprimario", section: "C", fullName: "MARIA VICTORIA NAUT BAEZ", gender: "F", parentName: "Naut Baez / Maria Naut" },
  { id: "std-1789392157666-8-rhb7", age: 5, grade: "Preprimario", section: "C", fullName: "EMMA ALEJANDRA ONEAL MENDEZ", gender: "F", parentName: "Oneal Mendez / Emma Oneal" },
  { id: "std-1789392157666-9-r73y", age: 5, grade: "Preprimario", section: "C", fullName: "EDERSON PEREZ ACOSTA", gender: "M", parentName: "Perez Acosta / Ederson Perez" },
  { id: "std-1789392157666-10-m3ud", age: 5, grade: "Preprimario", section: "C", fullName: "HELLEN ELISE PUJOLS TATIS", gender: "F", parentName: "Pujols Tatis / Hellen Pujols" },
  { id: "std-1789392157666-11-7td4", age: 5, grade: "Preprimario", section: "C", fullName: "LINK QUIÑONES VARGAS", gender: "M", parentName: "Quiñones Vargas / Link Quiñones" },
  { id: "std-1789392157666-12-qbzg", age: 5, grade: "Preprimario", section: "C", fullName: "SEBASTIAN ALEXANDER REYES BAEZ", gender: "M", parentName: "Reyes Baez / Sebastian Reyes" },
  { id: "std-1789392157666-13-o4af", age: 5, grade: "Preprimario", section: "C", fullName: "LIAM RODRIGUEZ BARRERA", gender: "M", parentName: "Rodriguez Barrera / Liam Rodriguez" },
  { id: "std-1789392157666-14-6xni", age: 5, grade: "Preprimario", section: "C", fullName: "ELOY FRANCISCO SANCHEZ POLANCO", gender: "M", parentName: "Sanchez Polanco / Eloy Sanchez" },
  { id: "std-1789392157666-15-hm87", age: 5, grade: "Preprimario", section: "C", fullName: "GREISY MONSERRAT SANTOS RODRIGUEZ", gender: "F", parentName: "Santos Rodriguez / Greisy Santos" }
];

export const INITIAL_STUDENTS: Student[] = RAW_STUDENTS.map(s => ({
  ...s,
  parentName: extractFamilyName(s.fullName)
}));

export function buildDefaultStudentEvaluation(student: Student): StudentEvaluationRecord {
  const indicators = getIndicatorsByGrade(student.grade);
  const p1Scores: Record<string, 'L' | 'EP' | 'I' | ''> = {};
  const p2Scores: Record<string, 'L' | 'EP' | 'I' | ''> = {};
  const p3Scores: Record<string, 'L' | 'EP' | 'I' | ''> = {};

  indicators.forEach(ind => {
    p1Scores[ind.id] = '';
    p2Scores[ind.id] = '';
    p3Scores[ind.id] = '';
  });

  return {
    studentId: student.id,
    P1: {
      scores: p1Scores,
      observations: {
        strengths: '',
        recommendations: ''
      },
      attendance: {
        diasLaborados: 76,
        presentes: 74,
        ausenciasJustificadas: 2,
        ausenciasInjustificadas: 0
      },
      isCompleted: false,
      updatedAt: new Date().toISOString()
    },
    P2: {
      scores: p2Scores,
      observations: {
        strengths: '',
        recommendations: ''
      },
      attendance: {
        diasLaborados: 58,
        presentes: 56,
        ausenciasJustificadas: 2,
        ausenciasInjustificadas: 0
      },
      isCompleted: false,
      updatedAt: new Date().toISOString()
    },
    P3: {
      scores: p3Scores,
      observations: {
        strengths: '',
        recommendations: ''
      },
      attendance: {
        diasLaborados: 62,
        presentes: 60,
        ausenciasJustificadas: 2,
        ausenciasInjustificadas: 0
      },
      isCompleted: false,
      updatedAt: new Date().toISOString()
    }
  };
}

// Generate clean initial evaluation structure with empty scores, ready for November P1 evaluation
export function generateInitialEvaluations(students: Student[]): Record<string, StudentEvaluationRecord> {
  const result: Record<string, StudentEvaluationRecord> = {};

  students.forEach((student) => {
    // Generate clean record with no mock scores
    result[student.id] = buildDefaultStudentEvaluation(student);
  });

  return result;
}
