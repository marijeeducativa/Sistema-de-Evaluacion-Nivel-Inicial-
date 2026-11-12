import { AppUser } from '../types';

export const INITIAL_USERS: AppUser[] = [
  // 1. Administrador General
  {
    id: 'user_admin_01',
    email: 'vivaldez@gmail.com',
    password: 'viva67@8482',
    name: 'Víctor Valdez',
    role: 'administrador',
    phone: '809-555-0100',
    createdAt: '2026-09-01T08:00:00.000Z'
  },

  // 2. Coordinadora Pedagógica
  {
    id: 'user_coord_01',
    email: 'marijeguerrerot@gmail.com',
    password: 'khalil123',
    name: 'Marije Guerrero',
    role: 'coordinadora',
    phone: '809-555-0102',
    createdAt: '2026-09-01T08:00:00.000Z'
  },

  // 3. Docentes Titulares (Contraseña inicial: 12345)
  {
    id: 'user_doc_01',
    email: 'lmoreno@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Lissette Moreno',
    role: 'docente',
    teacherId: 't_1789260629591',
    grade: 'Prekínder',
    section: 'A',
    phone: '809-555-1001',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_02',
    email: 'asantos@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Argentina Santos',
    role: 'docente',
    teacherId: 't_1789260757139',
    grade: 'Prekínder',
    section: 'B',
    phone: '809-555-1002',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_03',
    email: 'rmartinez@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Rosa Martínez',
    role: 'docente',
    teacherId: 't_1789260789747',
    grade: 'Kínder',
    section: 'A',
    phone: '809-555-1003',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_04',
    email: 'aescoto@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Anabelle Escoto',
    role: 'docente',
    teacherId: 't_1789260823974',
    grade: 'Kínder',
    section: 'B',
    phone: '809-555-1004',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_05',
    email: 'ialmonte@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Ilonki Almonte',
    role: 'docente',
    teacherId: 't_1789260861076',
    grade: 'Kínder',
    section: 'C',
    phone: '809-555-1005',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_06',
    email: 'mdelacruz@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'María Ysabel de la Cruz',
    role: 'docente',
    teacherId: 't_1789260910506',
    grade: 'Preprimario',
    section: 'A',
    phone: '809-555-1006',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_07',
    email: 'gsavinon@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Gladys Saviñón',
    role: 'docente',
    teacherId: 't_1789260944791',
    grade: 'Preprimario',
    section: 'B',
    phone: '809-555-1007',
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'user_doc_08',
    email: 'erosario@colegiosantodomingo.edu.do',
    password: '12345',
    name: 'Escarlyn Rosario',
    role: 'docente',
    teacherId: 't_1789260973001',
    grade: 'Preprimario',
    section: 'C',
    phone: '809-555-1008',
    createdAt: '2026-09-01T08:00:00.000Z'
  }
];
