import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogOut, 
  User, 
  CheckCircle2, 
  Edit2, 
  Check, 
  Cloud, 
  HardDrive, 
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetProgress?: () => void;
  onManualSync?: () => Promise<any>;
  onForcePush?: () => Promise<any>;
  onForcePull?: () => Promise<any>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
  onResetProgress,
  onManualSync,
  onForcePush,
  onForcePull,
}) => {
  const { user, signOut, loadCloudData, lastCloudError } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  
  // Cloud Inspection state
  const [cloudProfile, setCloudProfile] = useState<{
    exists: boolean;
    xp: number;
    streak: number;
    lessons: number;
  } | null>(null);
  const [isQueryingCloud, setIsQueryingCloud] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeAction, setActiveAction] = useState<'sync' | 'push' | 'pull' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEs = profile.supportLanguage === 'es';
  const isGoogle = !!user;

  // Query Firestore whenever the modal opens for live inspection
  useEffect(() => {
    if (!isOpen || !user) return;

    let cancelled = false;
    async function inspectCloud() {
      setIsQueryingCloud(true);
      try {
        const res = await loadCloudData(user!.uid);
        if (cancelled) return;
        if (res.profile) {
          setCloudProfile({
            exists: res.docExists,
            xp: res.profile.totalXp ?? 0,
            streak: res.profile.streakDays ?? 0,
            lessons: res.profile.completedLessonIds?.length ?? 0,
          });
        } else {
          setCloudProfile({
            exists: res.docExists,
            xp: 0,
            streak: 0,
            lessons: 0,
          });
        }
      } catch (err: any) {
        console.warn('Modal cloud inspection error:', err);
      } finally {
        if (!cancelled) setIsQueryingCloud(false);
      }
    }

    inspectCloud();

    return () => {
      cancelled = true;
    };
  }, [isOpen, user, loadCloudData]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keep editedName in sync with profile.name when opening
  useEffect(() => {
    if (isOpen) {
      setEditedName(profile.name);
      setIsEditingName(false);
      setFeedbackMsg(null);
    }
  }, [isOpen, profile.name]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editedName.trim();
    if (trimmed) {
      onUpdateProfile({ name: trimmed });
    }
    setIsEditingName(false);
  };

  // 1. Bi-directional Intelligent Sync (Union & Save to both)
  const handleFullSync = async () => {
    if (!onManualSync || isSyncing) return;
    setIsSyncing(true);
    setActiveAction('sync');
    setFeedbackMsg(null);
    try {
      const res = await onManualSync();
      const finalXp = res?.xp ?? profile.totalXp;
      setCloudProfile({
        exists: true,
        xp: finalXp,
        streak: res?.streak ?? profile.streakDays,
        lessons: res?.lessons ?? profile.completedLessonIds.length,
      });
      setFeedbackMsg({
        text: isEs 
          ? `✓ Sincronizado con éxito: ${finalXp} XP guardados en la nube y en este dispositivo.` 
          : `✓ Synkat: ${finalXp} XP sparade i molnet och på denna enhet.`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: isEs 
          ? `Error al sincronizar: ${err?.message || 'Fallo de conexión'}` 
          : `Kunde inte synka: ${err?.message || 'Anslutningsfel'}`,
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
      setActiveAction(null);
    }
  };

  // 2. Force Push Local Device to Cloud
  const handlePushToCloud = async () => {
    if (!onForcePush || isSyncing) return;
    setIsSyncing(true);
    setActiveAction('push');
    setFeedbackMsg(null);
    try {
      const res = await onForcePush();
      if (res?.success) {
        setCloudProfile({
          exists: true,
          xp: profile.totalXp,
          streak: profile.streakDays,
          lessons: profile.completedLessonIds.length,
        });
        setFeedbackMsg({
          text: isEs 
            ? `✓ ¡Progreso subido a la nube! (${profile.totalXp} XP guardados en Firestore)` 
            : `✓ Uppladdat till molnet! (${profile.totalXp} XP i Firestore)`,
          type: 'success',
        });
      } else {
        throw new Error(res?.error || 'No se pudo guardar');
      }
    } catch (err: any) {
      setFeedbackMsg({
        text: isEs ? `Error al subir a la nube: ${err?.message}` : `Kunde inte ladda upp: ${err?.message}`,
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
      setActiveAction(null);
    }
  };

  // 3. Force Pull from Cloud to This Device
  const handlePullFromCloud = async () => {
    if (!onForcePull || isSyncing) return;
    setIsSyncing(true);
    setActiveAction('pull');
    setFeedbackMsg(null);
    try {
      const res = await onForcePull();
      if (res?.success) {
        const pulledXp = res?.profile?.totalXp ?? (cloudProfile?.xp ?? 0);
        setFeedbackMsg({
          text: isEs 
            ? `✓ ¡Datos descargados de la nube! Este dispositivo tiene ahora ${pulledXp} XP.` 
            : `✓ Nedladdat från molnet! Denna enhet har nu ${pulledXp} XP.`,
          type: 'success',
        });
      } else {
        throw new Error(res?.error || 'No se pudo descargar');
      }
    } catch (err: any) {
      setFeedbackMsg({
        text: isEs ? `Error al descargar de la nube: ${err?.message}` : `Kunde inte ladda ner: ${err?.message}`,
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
      setActiveAction(null);
    }
  };

  const handleSignOut = async () => {
    onClose();
    if (user) {
      await signOut();
    }
    onLogout();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card matching Chispa Español */}
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 z-10 my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {isEs ? 'Tu Cuenta y Sincronización' : 'Ditt Konto och Synkning'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                {isEs ? 'Perfil activo, sincronización móvil y ordenador' : 'Aktiv profil, synkning mobil och dator'}
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
        <div className="my-4 p-4 rounded-2xl bg-purple-50/40 border border-purple-100/80 flex items-center justify-between gap-3">
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
                      <span>{isEs ? 'Google Conectado' : 'Google Anslutet'}</span>
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
                {user?.email ? (
                  <span className="font-semibold text-slate-700">{user.email}</span>
                ) : (
                  <span>{isEs ? 'Navegador local' : 'Lokal webbläsare'}</span>
                )}
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

        {/* Live Cloud vs Device Inspection Panel */}
        {isGoogle && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <span>{isEs ? 'Estado en tiempo real' : 'Realtidsstatus'}</span>
              <span className="text-purple-600 lowercase font-medium">Firestore Database</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              {/* This Device */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isEs ? 'En este dispositivo' : 'På denna enhet'}
                </span>
                <span className="text-base font-black text-indigo-700 mt-0.5 block">
                  {profile.totalXp} XP
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  {isEs 
                    ? `${profile.completedLessonIds.length} lecciones • ${profile.streakDays}d racha` 
                    : `${profile.completedLessonIds.length} lektioner`}
                </span>
              </div>

              {/* Cloud Firestore */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isEs ? 'En la nube (Firestore)' : 'I molnet'}
                </span>
                {isQueryingCloud ? (
                  <span className="text-xs text-slate-400 italic mt-2 block animate-pulse">
                    {isEs ? 'Consultando...' : 'Laddar...'}
                  </span>
                ) : (
                  <>
                    <span className="text-base font-black text-emerald-600 mt-0.5 block">
                      {cloudProfile?.xp ?? 0} XP
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      {cloudProfile?.exists
                        ? (isEs 
                            ? `${cloudProfile.lessons} lecciones • ${cloudProfile.streak}d racha` 
                            : `${cloudProfile.lessons} lektioner`)
                        : (isEs ? 'Sin datos guardados' : 'Ingen data')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Diagnostic helper alert */}
            {cloudProfile && !isQueryingCloud && (
              <div className="text-[11px] leading-relaxed pt-1">
                {profile.totalXp > (cloudProfile.xp || 0) && (
                  <p className="text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/80 flex items-start gap-1.5 font-medium">
                    <span className="shrink-0 text-base leading-none">💡</span>
                    <span>
                      {isEs 
                        ? `Este dispositivo tiene más puntos (${profile.totalXp} XP) que la nube (${cloudProfile.xp} XP). Pulsa "Subir a la nube" o "Sincronizar ahora" para guardarlos en tu cuenta.`
                        : `Denna enhet har mer poäng (${profile.totalXp} XP) än molnet (${cloudProfile.xp} XP). Klicka på "Ladda upp till molnet" för att spara.`}
                    </span>
                  </p>
                )}
                {cloudProfile.xp > profile.totalXp && (
                  <p className="text-indigo-800 bg-indigo-50/80 p-2 rounded-xl border border-indigo-200/80 flex items-start gap-1.5 font-medium">
                    <span className="shrink-0 text-base leading-none">📲</span>
                    <span>
                      {isEs 
                        ? `Tu cuenta en la nube tiene ${cloudProfile.xp} XP acumulados. Pulsa "Descargar de la nube" para reflejarlos en este móvil.`
                        : `Ditt molnkonto har ${cloudProfile.xp} XP. Klicka på "Ladda ner från molnet" för att visa dem här.`}
                    </span>
                  </p>
                )}
                {cloudProfile.xp === profile.totalXp && cloudProfile.xp > 0 && (
                  <p className="text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/80 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {isEs 
                        ? `✓ Perfectamente sincronizado: ${profile.totalXp} XP coinciden exactamente en la nube y en este dispositivo.` 
                        : `✓ Fullt synkad: ${profile.totalXp} XP matchar i molnet och på enheten.`}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Any Firestore error notice */}
            {lastCloudError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">
                    {lastCloudError.includes('offline')
                      ? (isEs ? 'Conectando con la base de datos:' : 'Ansluter till molnet:')
                      : (isEs ? 'Aviso de conexión con la nube:' : 'Anslutningsvarning:')}
                  </span>
                  <span className="text-[10px] opacity-90 block mt-0.5">
                    {lastCloudError.includes('offline')
                      ? (isEs 
                          ? 'El navegador está estableciendo conexión con Firestore. Pulsa "⬆️ Subir a la nube" o "Sincronizar ahora" para guardar tus 15 XP.' 
                          : 'Webbläsaren ansluter till Firestore. Klicka på "Ladda upp" för att spara.')
                      : lastCloudError}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className={`mb-4 p-3 rounded-2xl text-xs font-bold transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs'
              : 'bg-rose-100 text-rose-900 border border-rose-200'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isGoogle && (
            <>
              {/* 1. Main Bi-directional Intelligent Sync */}
              <button
                type="button"
                onClick={handleFullSync}
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing && activeAction === 'sync' ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing && activeAction === 'sync'
                    ? (isEs ? 'Sincronizando con Firestore...' : 'Synkar med Firestore...')
                    : (isEs ? 'Sincronizar ahora (Nube ⇄ Dispositivo)' : 'Synka nu (Moln ⇄ Enhet)')}
                </span>
              </button>

              {/* 2. Side-by-side Push & Pull buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Force Upload Button */}
                <button
                  type="button"
                  onClick={handlePushToCloud}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                  title="Sube los puntos y lecciones de este dispositivo directamente a la nube"
                >
                  <UploadCloud className={`w-3.5 h-3.5 text-indigo-700 ${isSyncing && activeAction === 'push' ? 'animate-bounce' : ''}`} />
                  <span>{isEs ? '⬆️ Subir a la nube' : '⬆️ Ladda upp'}</span>
                </button>

                {/* Force Download Button */}
                <button
                  type="button"
                  onClick={handlePullFromCloud}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                  title="Descarga los datos de la cuenta en la nube a este dispositivo"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing && activeAction === 'pull' ? 'animate-bounce' : ''}`} />
                  <span>{isEs ? '⬇️ Descargar de la nube' : '⬇️ Ladda ner'}</span>
                </button>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-3 px-4 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-800 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4 text-purple-700" />
              <span>{isEs ? 'Cerrar sesión y volver a la pantalla de acceso' : 'Logga ut och återgå till startskärmen'}</span>
            </button>
          </div>

          {onResetProgress && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(isEs ? '¿Quieres reiniciar todo el progreso a cero y comenzar desde el Paso 1 de la Unidad 1?' : 'Vill du återställa alla framsteg till noll och börja från Steg 1?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEs ? 'Reiniciar progreso a cero (empezar desde el paso 1)' : 'Återställ alla framsteg till noll'}</span>
            </button>
          )}
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-emerald-800/80 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isGoogle 
                ? (isEs ? 'Sincronización multi-dispositivo activa con Google Cloud Firestore' : 'Realtidssynkning med Google Cloud Firestore')
                : (isEs ? 'Progreso guardado de forma segura en este navegador' : 'Framsteg sparade lokalt i webbläsaren')}
            </span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

