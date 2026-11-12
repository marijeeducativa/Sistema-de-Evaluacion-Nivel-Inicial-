import React, { useState } from 'react';
import { AppUser } from '../types';
import { 
  X, 
  User, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Eye, 
  EyeOff,
  School,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  currentUser: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePassword: (userId: string, newPassword: string) => Promise<boolean> | boolean;
  onLogout: () => void;
  schoolName: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdatePassword,
  onLogout,
  schoolName
}) => {
  if (!isOpen) return null;

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setFeedback({ type: 'error', message: 'Por favor complete todos los campos de contraseña.' });
      return;
    }

    if (currentPasswordInput !== currentUser.password) {
      setFeedback({ type: 'error', message: 'La contraseña actual no coincide con la registrada.' });
      return;
    }

    if (newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'La confirmación no coincide con la nueva contraseña.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdatePassword(currentUser.id, newPassword);
      setFeedback({ 
        type: 'success', 
        message: '¡Contraseña actualizada exitosamente! Puede usarla a partir de su próximo inicio de sesión.' 
      });
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'No se pudo actualizar la contraseña. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrador':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Administrador General</span>;
      case 'coordinadora':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Coordinadora Pedagógica</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Docente Titular</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0b1b3d] text-white flex items-center justify-center font-bold text-sm shadow-md">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Mi Perfil de Usuario
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.email}
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {/* User details card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Nombre Completo:</span>
              <strong className="text-slate-900 text-sm">{currentUser.name}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Rol Asignado:</span>
              <div>{getRoleBadge(currentUser.role)}</div>
            </div>

            {currentUser.role === 'docente' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Aula / Sección Asignada:</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {currentUser.grade} Sección "{currentUser.section}"
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Centro Educativo:</span>
              <span className="font-semibold text-slate-800">{schoolName}</span>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Cambiar Contraseña
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Opcional / Voluntario
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Esta opción es totalmente voluntaria. Puedes conservar tu contraseña actual o crear una nueva para mayor comodidad personal.
            </p>

            {feedback && (
              <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPasswordInput}
                    onChange={e => setCurrentPasswordInput(e.target.value)}
                    placeholder="Ingrese su contraseña actual"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guardar Nueva Contraseña</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer with Logout */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
};
