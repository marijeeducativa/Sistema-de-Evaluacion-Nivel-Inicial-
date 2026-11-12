import React, { useState } from 'react';
import { AppState, Student, GradeLevel } from '../types';
import { buildDefaultStudentEvaluation } from '../data/initialData';
import { 
  UserPlus, 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  User,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { extractFamilyName, getStudentFamilyName } from '../utils/familyName';

interface StudentManagerProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onOpenMoveStudent?: (studentId: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  state,
  isOpen,
  onClose,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenMoveStudent
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(
    state.selectedGrade === 'Prekínder' ? 3 : state.selectedGrade === 'Kínder' ? 4 : 5
  );
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [parentName, setParentName] = useState('');

  const currentSectionStudents = state.students
    .filter(s => s.grade === state.selectedGrade && s.section === state.selectedSection)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingStudent(null);
    setFullName('');
    setAge(state.selectedGrade === 'Prekínder' ? 3 : state.selectedGrade === 'Kínder' ? 4 : 5);
    setGender('M');
    setParentName('');
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    setIsAdding(false);
    setFullName(student.fullName);
    setAge(student.age);
    setGender(student.gender || 'M');
    setParentName(getStudentFamilyName(student));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Por favor ingrese el nombre completo del estudiante.');
      return;
    }

    const finalFamilyName = parentName.trim() || extractFamilyName(fullName.trim());

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        fullName: fullName.trim(),
        age,
        gender,
        parentName: finalFamilyName
      };
      onUpdateStudent(updated);
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fullName: fullName.trim(),
        age,
        grade: state.selectedGrade,
        section: state.selectedSection,
        gender,
        parentName: finalFamilyName,
        createdAt: new Date().toISOString(),
        schoolCode: state.schoolInfo.code,
        schoolName: state.schoolInfo.name
      };
      onAddStudent(newStudent);
      setIsAdding(false);
    }

    setFullName('');
    setParentName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-800 text-white rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestión de Matrícula · {state.selectedGrade} (Sección {state.selectedSection})
              </h2>
              <p className="text-xs text-slate-500">
                {currentSectionStudents.length} estudiantes inscritos en esta aula.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 flex-grow">
          
          {/* Add / Edit Form */}
          {(isAdding || editingStudent) ? (
            <form onSubmit={handleSave} className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3">
              <h3 className="font-bold text-slate-900 text-xs">
                {editingStudent ? 'Editar Datos del Estudiante' : 'Inscribir Nuevo Estudiante'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo (Apellidos y Nombres)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. POLANCO DE LOS SANTOS, CARLA MARIE"
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium focus:border-teal-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Edad en Años</label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium focus:border-teal-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium focus:border-teal-700 focus:outline-hidden"
                  >
                    <option value="M">Masculino (M)</option>
                    <option value="F">Femenino (F)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Familia (Apellidos)</label>
                    {fullName.trim() && (
                      <button
                        type="button"
                        onClick={() => setParentName(extractFamilyName(fullName.trim()))}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Sugerir: {extractFamilyName(fullName.trim())}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Ej. Familia Jacobo Peña"
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium focus:border-teal-700 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Coloque "Familia" seguido de los dos apellidos (ej. Familia Jacobo Peña) para evitar errores con nombres individuales de padres.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingStudent(null);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingStudent ? 'Actualizar' : 'Guardar Estudiante'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Listado oficial de estudiantes matriculados:</span>
              <button
                onClick={handleStartAdd}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscribir Estudiante</span>
              </button>
            </div>
          )}

          {/* Student List Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Estudiante</th>
                  <th className="py-2.5 px-2 text-center">Edad</th>
                  <th className="py-2.5 px-2 text-center">Sexo</th>
                  <th className="py-2.5 px-3">Familia</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentSectionStudents.map((st, i) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 font-medium">{i + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-2 px-2 text-center">{st.age} Años</td>
                    <td className="py-2 px-2 text-center">{st.gender || '-'}</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{getStudentFamilyName(st)}</td>
                    <td className="py-2 px-3 text-right space-x-2">
                      {onOpenMoveStudent && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenMoveStudent(st.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold p-1 hover:bg-indigo-50 rounded"
                          title="Mover a otra sección o curso (conservando evaluaciones)"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(st)}
                        className="text-teal-700 hover:text-teal-900 font-semibold"
                        title="Editar datos"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${st.fullName}? Se borrarán también sus evaluaciones asociadas.`)) {
                            onDeleteStudent(st.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 font-semibold"
                        title="Eliminar estudiante"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
