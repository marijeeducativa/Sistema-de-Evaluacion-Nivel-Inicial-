import React from 'react';
import { AppState, Teacher, GradeLevel } from '../types';
import { X, MessageCircle, ArrowRight, QrCode, UserCheck } from 'lucide-react';

interface TeacherAccessModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onSelectTeacherSection: (grade: GradeLevel, section: string) => void;
}

export const TeacherAccessModal: React.FC<TeacherAccessModalProps> = ({
  state,
  isOpen,
  onClose,
  onSelectTeacherSection
}) => {
  if (!isOpen) return null;

  const getWhatsAppMessage = (teacher: Teacher) => {
    const text = `Estimada ${teacher.name}, acceda aquí al registro de evaluación de ${teacher.grade} Sección "${teacher.section}" (Período ${state.currentPeriod}) en el Centro Educativo ${state.schoolInfo.name}: ${window.location.origin}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Acceso Rápido para Docentes Titulares
              </h2>
              <p className="text-xs text-slate-500">
                Comparte el acceso directo por WhatsApp o entra al aula de cada maestra.
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
        <div className="p-6 overflow-y-auto space-y-3.5 text-xs text-slate-800 flex-grow">
          {state.teachers.map((teacher) => {
            const studentCount = state.students.filter(
              s => s.grade === teacher.grade && s.section === teacher.section
            ).length;

            return (
              <div
                key={teacher.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {teacher.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {teacher.grade} "{teacher.section}"
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {studentCount} infantes matriculados en esta sección
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getWhatsAppMessage(teacher)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                    title="Enviar enlace directo por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      onSelectTeacherSection(teacher.grade, teacher.section);
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Entrar al Aula</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
