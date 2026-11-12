import React, { useState } from 'react';
import { AppUser } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  School, 
  AlertCircle,
  KeyRound,
  GraduationCap
} from 'lucide-react';

interface LoginScreenProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  schoolName: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLogin,
  schoolName
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Por favor ingrese su correo electrónico institucional y su contraseña.');
      return;
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
    );

    if (matchedUser) {
      onLogin(matchedUser);
    } else {
      setError('Credenciales incorrectas. Verifique su correo y contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07132b] via-[#0b1b3d] to-[#122650] flex flex-col justify-between text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Ministerial Institutional Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-sm">
            RD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Ministerio de Educación de la República Dominicana
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                MINERD
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              SENI · Sistema de Evaluación del Nivel Inicial (Segundo Ciclo)
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <School className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">{schoolName || 'Centro Educativo Santo Domingo'}</span>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/80">
          
          {/* Card Header with SENI branding */}
          <div className="flex items-start justify-between pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0b1b3d]">
                  SENI
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  MINERD
                </span>
              </div>
              <h2 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide leading-tight mb-2">
                Sistema de Evaluación del Nivel Inicial
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold mb-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Acceso Privado y Seguro por Aula
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingrese con sus credenciales institucionales.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0b1b3d] text-white flex items-center justify-center shadow-md shrink-0">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error de Acceso: </span>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico / Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@colegiosantodomingo.edu.do"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-400">
                  Sensible a mayúsculas
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0b1b3d] hover:bg-[#142852] active:bg-[#07132b] text-white font-bold text-sm shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Ingresar al Registro de Evaluación
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Privacidad y confidencialidad: </span>
              Cada docente accede de forma individual y privada a los datos de su propia sección. Si olvidó su contraseña, consulte con la administración del centro.
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Base de Datos Segura</span>
              </div>
              <span className="font-semibold text-slate-600">Períodos Oficiales: P1, P2 y P3</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 px-4 sm:px-8 py-3 text-center text-xs text-slate-400">
        © 2026 Ministerio de Educación de la República Dominicana (MINERD) · Sistema Oficial de Evaluación de Nivel Inicial
      </footer>
    </div>
  );
};
