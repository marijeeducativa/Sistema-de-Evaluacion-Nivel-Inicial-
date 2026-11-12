import React, { useState, useMemo } from 'react';
import { AppState, GradeLevel, Student } from '../types';
import { 
  Search, 
  GraduationCap, 
  FileText, 
  ArrowRight, 
  UserPlus, 
  ArrowRightLeft,
  Pencil,
  X,
  Save,
  Sparkles,
  Users
} from 'lucide-react';
import { extractFamilyName, getStudentFamilyName } from '../utils/familyName';

interface StudentListViewProps {
  state: AppState;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenMoveStudent?: (studentId: string) => void;
  onUpdateStudent?: (student: Student) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  state,
  onSelectStudent,
  onOpenAddStudent,
  onOpenMoveStudent,
  onUpdateStudent
}) => {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editFamilyName, setEditFamilyName] = useState('');
  const [editGrade, setEditGrade] = useState<GradeLevel>('Prekínder');
  const [editSection, setEditSection] = useState('A');
  const [editAge, setEditAge] = useState<number>(4);
  const [editGender, setEditGender] = useState<'M' | 'F'>('M');

  const filteredStudents = useMemo(() => {
    return state.students.filter(st => {
      if (selectedGrade !== 'all' && st.grade !== selectedGrade) return false;
      if (selectedSection !== 'all' && st.section !== selectedSection) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const family = getStudentFamilyName(st).toLowerCase();
        return st.fullName.toLowerCase().includes(q) || family.includes(q);
      }
      return true;
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.students, selectedGrade, selectedSection, search]);

  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFullName(student.fullName);
    setEditFamilyName(getStudentFamilyName(student));
    setEditGrade(student.grade);
    setEditSection(student.section);
    setEditAge(student.age);
    setEditGender(student.gender || 'M');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onUpdateStudent) return;
    if (!editFullName.trim()) {
      alert('Por favor ingrese el nombre del estudiante.');
      return;
    }

    const finalFamily = editFamilyName.trim() || extractFamilyName(editFullName.trim());

    const updated: Student = {
      ...editingStudent,
      fullName: editFullName.trim(),
      parentName: finalFamily,
      grade: editGrade,
      section: editSection,
      age: editAge,
      gender: editGender
    };

    onUpdateStudent(updated);
    setEditingStudent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Listado General de Estudiantes
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredStudents.length} de {state.students.length} estudiantes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Padrón escolar de {state.schoolInfo.name} · {state.schoolInfo.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por estudiante o familia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
          >
            <option value="all">Todos los Grados</option>
            <option value="Prekínder">Prekínder</option>
            <option value="Kínder">Kínder</option>
            <option value="Preprimario">Preprimario</option>
          </select>

          {/* Section filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
          >
            <option value="all">Todas las Secciones</option>
            <option value="A">Sección A</option>
            <option value="B">Sección B</option>
            <option value="C">Sección C</option>
          </select>

          {onOpenMoveStudent && (
            <button
              onClick={() => onOpenMoveStudent('')}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Trasladar estudiantes de sección o curso"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trasladar</span>
            </button>
          )}

          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscribir</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
            <tr>
              <th className="py-3 px-4 w-10 text-center">#</th>
              <th className="py-3 px-4">Estudiante</th>
              <th className="py-3 px-3">Grado y Sección</th>
              <th className="py-3 px-3 text-center">Edad</th>
              <th className="py-3 px-3 text-center">Sexo</th>
              <th className="py-3 px-4">Familia</th>
              <th className="py-3 px-4 text-center">Estatus {state.currentPeriod}</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((st, i) => {
              const evalRec = state.evaluations[st.id]?.[state.currentPeriod];
              const isFilled = evalRec && Object.values(evalRec.scores).some(v => v !== '');

              return (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{i + 1}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{st.fullName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {st.grade} "{st.section}"
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{st.age} Años</td>
                  <td className="py-2.5 px-3 text-center font-medium">{st.gender || '-'}</td>
                  <td className="py-2.5 px-4 text-slate-700 font-medium truncate max-w-xs">
                    {getStudentFamilyName(st)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {isFilled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Evaluado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                        Sin evaluar
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* Botón de Edición */}
                    <button
                      onClick={() => handleStartEdit(st)}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      title={`Editar datos de ${st.fullName}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      <span>Editar</span>
                    </button>

                    {onOpenMoveStudent && (
                      <button
                        onClick={() => onOpenMoveStudent(st.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Mover a otra sección o curso"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mover</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectStudent(st)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Evaluar estudiante en matriz"
                    >
                      <span>Evaluar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición de Estudiante */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Editar Estudiante
                  </h2>
                  <p className="text-xs text-slate-500">
                    Actualice los datos personales y familiares del estudiante.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs text-slate-800">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo (Apellidos y Nombres)
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setEditFullName(newName);
                  }}
                  placeholder="Ej. ANA CECILIA JACOBO PEÑA"
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              {/* Family Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Familia (Apellidos)
                  </label>
                  {editFullName.trim() && (
                    <button
                      type="button"
                      onClick={() => setEditFamilyName(extractFamilyName(editFullName.trim()))}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sugerir: {extractFamilyName(editFullName.trim())}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={editFamilyName}
                  onChange={(e) => setEditFamilyName(e.target.value)}
                  placeholder="Ej. Familia Jacobo Peña"
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Formato recomendado: "Familia" seguido de los dos apellidos (ej. Familia Jacobo Peña) para evitar errores con nombres individuales de padres.
                </p>
              </div>

              {/* Grade, Section, Age, Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grado</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as GradeLevel)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                  >
                    <option value="Prekínder">Prekínder (3 años)</option>
                    <option value="Kínder">Kínder (4 años)</option>
                    <option value="Preprimario">Preprimario (5 años)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sección</label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                  >
                    <option value="A">Sección A</option>
                    <option value="B">Sección B</option>
                    <option value="C">Sección C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Edad en Años</label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={editAge}
                    onChange={(e) => setEditAge(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as 'M' | 'F')}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium focus:border-amber-600 focus:outline-hidden"
                  >
                    <option value="M">Masculino (M)</option>
                    <option value="F">Femenino (F)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
