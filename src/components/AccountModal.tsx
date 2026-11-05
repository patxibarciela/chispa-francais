import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  User, 
  CheckCircle2, 
  Edit2, 
  Check, 
  Cloud, 
  HardDrive, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
}) => {
  const { user, signOut } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);

  if (!isOpen) return null;

  const isEs = profile.supportLanguage === 'es';
  const isGoogle = !!user;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editedName.trim();
    if (trimmed) {
      onUpdateProfile({ name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleSignOut = async () => {
    onClose();
    if (user) {
      await signOut();
    }
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card matching Chispa Español */}
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {isEs ? 'Tu Cuenta' : 'Ditt Konto'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                {isEs ? 'Perfil activo, sincronización y cambio de usuario' : 'Aktiv profil, synkning och användarbyte'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5 my-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-2 py-1 text-sm font-bold text-slate-900 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-36"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-base truncate">
                    {profile.name}
                  </span>
                  {isGoogle ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                      <Cloud className="w-3 h-3 text-emerald-600" />
                      <span>{isEs ? 'Cuenta Google' : 'Google-konto'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80 shadow-2xs">
                      <HardDrive className="w-3 h-3 text-amber-600" />
                      <span>{isEs ? 'Perfil Local' : 'Lokal profil'}</span>
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 font-medium truncate mt-1">
                {profile.totalXp} XP • {isEs ? `Racha ${profile.streakDays} días` : `${profile.streakDays} dagars svit`} • {user?.email || (isEs ? 'Este dispositivo' : 'Denna enhet')}
              </p>
            </div>
          </div>

          {!isEditingName && (
            <button
              type="button"
              onClick={() => {
                setEditedName(profile.name);
                setIsEditingName(true);
              }}
              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-100/50 rounded-xl transition-colors cursor-pointer shrink-0"
              title={isEs ? 'Editar nombre' : 'Ändra namn'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Logout Action Button matching Chispa screenshot */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3.5 px-4 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-800 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4 text-purple-700" />
            <span>{isEs ? 'Cerrar sesión y volver a la pantalla de acceso' : 'Logga ut och återgå till startskärmen'}</span>
          </button>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-emerald-800/80 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isGoogle 
                ? (isEs ? 'Progreso sincronizado en la nube con Firestore Enterprise' : 'Framsteg synkade i molnet med Firestore')
                : (isEs ? 'Progreso guardado de forma segura en este navegador' : 'Framsteg sparade lokalt i webbläsaren')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
