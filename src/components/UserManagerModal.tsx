import React, { useState } from 'react';
import { AppState, AppUser, GradeLevel, UserRole } from '../types';
import { 
  X, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  Lock, 
  Mail, 
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface UserManagerModalProps {
  state: AppState;
  currentUser: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (newUser: Omit<AppUser, 'id' | 'createdAt'>) => void;
  onUpdateUser: (updatedUser: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  state,
  currentUser,
  isOpen,
  onClose,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  if (!isOpen) return null;

  const users = state.users || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State for Create/Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('12345');
  const [formRole, setFormRole] = useState<UserRole>('docente');
  const [formGrade, setFormGrade] = useState<GradeLevel>('Preprimario');
  const [formSection, setFormSection] = useState('A');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('12345');
    setFormRole('docente');
    setFormGrade('Preprimario');
    setFormSection('A');
    setFormPhone('');
    setFormError(null);
    setIsCreating(false);
    setEditingUserId(null);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (user: AppUser) => {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password);
    setFormRole(user.role);
    setFormGrade(user.grade || 'Preprimario');
    setFormSection(user.section || 'A');
    setFormPhone(user.phone || '');
    setFormError(null);
    setIsCreating(false);
    setEditingUserId(user.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanName = formName.trim();
    const cleanPass = formPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setFormError('Por favor complete el nombre, correo y contraseña.');
      return;
    }

    // Check email uniqueness
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== editingUserId);
    if (existing) {
      setFormError(`El correo ${cleanEmail} ya está registrado para el usuario ${existing.name}.`);
      return;
    }

    if (editingUserId) {
      const existingUser = users.find(u => u.id === editingUserId);
      if (!existingUser) return;

      onUpdateUser({
        ...existingUser,
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: formRole,
        grade: formRole === 'docente' ? formGrade : undefined,
        section: formRole === 'docente' ? formSection : undefined,
        phone: formPhone.trim() || undefined
      });
      resetForm();
    } else {
      onCreateUser({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: formRole,
        grade: formRole === 'docente' ? formGrade : undefined,
        section: formRole === 'docente' ? formSection : undefined,
        phone: formPhone.trim() || undefined
      });
      resetForm();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0b1b3d] text-amber-400 rounded-2xl shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Gestión Oficial de Usuarios y Permisos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  Solo Administrador
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Crea cuentas para docentes y coordinadoras, asigna aulas y gestiona contraseñas.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800">
          
          {/* Top action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setRoleFilter('docente')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    roleFilter === 'docente' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Docentes
                </button>
                <button
                  onClick={() => setRoleFilter('coordinadora')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    roleFilter === 'coordinadora' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coordinación
                </button>
                <button
                  onClick={() => setRoleFilter('administrador')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    roleFilter === 'administrador' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {!isCreating && !editingUserId && (
              <button
                onClick={startCreate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Nuevo Usuario</span>
              </button>
            )}
          </div>

          {/* Create / Edit Form Box */}
          {(isCreating || editingUserId) && (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  {editingUserId ? 'Editar Usuario Registrado' : 'Crear Nueva Cuenta de Acceso'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Ej. Carmen Santana"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="ejemplo@colegiosantodomingo.edu.do"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Rol del Sistema *
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  >
                    <option value="docente">Docente Titular (Acceso solo a su aula)</option>
                    <option value="coordinadora">Coordinadora Pedagógica (Supervisión global)</option>
                    <option value="administrador">Administrador General (Acceso Total)</option>
                  </select>
                </div>

                {formRole === 'docente' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Grado Asignado *
                      </label>
                      <select
                        value={formGrade}
                        onChange={e => setFormGrade(e.target.value as GradeLevel)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Prekínder">Prekínder (3 años)</option>
                        <option value="Kínder">Kínder (4 años)</option>
                        <option value="Preprimario">Preprimario (5 años)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Sección Asignada *
                      </label>
                      <input
                        type="text"
                        value={formSection}
                        onChange={e => setFormSection(e.target.value.toUpperCase())}
                        placeholder="A, B, C..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="809-555-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingUserId ? 'Guardar Cambios' : 'Registrar Cuenta'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Usuario / Nombre</th>
                  <th className="px-4 py-3">Correo Electrónico</th>
                  <th className="px-4 py-3 text-center">Rol</th>
                  <th className="px-4 py-3">Aula Asignada</th>
                  <th className="px-4 py-3">Contraseña Actual</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isSelf = user.id === currentUser.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                          {user.phone && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Tel: {user.phone}
                            </span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3 text-center">
                          {user.role === 'administrador' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              Admin General
                            </span>
                          )}
                          {user.role === 'coordinadora' && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                              Coordinadora
                            </span>
                          )}
                          {user.role === 'docente' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                              Docente
                            </span>
                          )}
                        </td>

                        {/* Assigned Classroom */}
                        <td className="px-4 py-3">
                          {user.role === 'docente' && user.grade ? (
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-100 inline-block">
                              {user.grade} "{user.section}"
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Acceso Global</span>
                          )}
                        </td>

                        {/* Password display */}
                        <td className="px-4 py-3 font-mono text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {user.password}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(user)}
                              title="Editar Usuario"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Está seguro de eliminar la cuenta de ${user.name} (${user.email})?`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                title="Eliminar Usuario"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong>{users.length}</strong> usuarios con acceso al sistema
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
