import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { CheckCircle2, Clock3, FileSpreadsheet, RefreshCw, UploadCloud, AlertTriangle, Pencil, Trash2 } from 'lucide-react';

type Kind = 'users' | 'assignments';
type Summary = { total?: number; exitosas?: number; errores?: number; detallesErrores?: unknown[] };
type Result = { success?: boolean; message?: string; summary?: Summary };
type RecordItem = { hash: string; name: string; size: number; completedAt: string; summary?: Summary };
type State = { users?: RecordItem; assignments?: RecordItem; history: Array<RecordItem & { kind: Kind }> };
const KEY = 'school-imports-v3';
const URL: Record<Kind, string> = { users: '/import/users-all', assignments: '/import/asignacion-all' };
const NAME: Record<Kind, string> = { users: 'Usuarios', assignments: 'Asignaciones' };
const readState = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const parsed = JSON.parse(raw); return { users: parsed.users, assignments: parsed.assignments, history: Array.isArray(parsed.history) ? parsed.history : [] }; }
    // Recover the earlier version's locally stored successes.
    const old = JSON.parse(localStorage.getItem('school-imports-v2') || '{}');
    return { users: old.users, assignments: old.assignments, history: [] };
  } catch { return { history: [] }; }
};
async function hashFile(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, '0')).join('');
}
const InteractiveSequentialImport: React.FC = () => {
  const [state, setState] = useState<State>(readState);
  const [files, setFiles] = useState<Partial<Record<Kind, File>>>({});
  const [editing, setEditing] = useState<Kind | null>(null);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const locked = useRef(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);
  const completed = Number(!!state.users) + Number(!!state.assignments);

  const choose = (kind: Kind, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.(xls|xlsx)$/i.test(file.name)) { setError('Solo se permiten archivos .xls o .xlsx'); return; }
    setFiles(p => ({ ...p, [kind]: file }));
    setError(''); setMessage('');
  };
  const upload = async (kind: Kind) => {
    if (locked.current || busy) return;
    if (kind === 'assignments' && !state.users) { setError('Primero importa usuarios.'); return; }
    const file = files[kind];
    if (!file) { setError(`Selecciona un archivo de ${NAME[kind].toLowerCase()}.`); return; }
    locked.current = true;
    setError(''); setMessage('');
    try {
      const hash = await hashFile(file);
      if (state.history.some(h => h.kind === kind && h.hash === hash) || state[kind]?.hash === hash) {
        setError('Este archivo ya fue importado en este navegador. Selecciona un archivo con cambios reales.'); return;
      }
      const replacing = !!state[kind];
      const confirm = await Swal.fire({
        title: replacing ? `Volver a importar ${NAME[kind].toLowerCase()}` : `Importar ${NAME[kind].toLowerCase()}`,
        text: replacing
          ? 'El archivo nuevo se enviará al mismo endpoint. El resultado sobre los registros existentes depende del controlador Laravel. No se modificará el historial anterior.'
          : `¿Enviar ${file.name} al servidor?`,
        icon: replacing ? 'warning' : 'question', showCancelButton: true,
        confirmButtonText: replacing ? 'Confirmar reimportación' : 'Importar', cancelButtonText: 'Cancelar'
      });
      if (!confirm.isConfirmed) return;
      abort.current = new AbortController();
      setBusy(kind); setProgress(0);
      const form = new FormData(); form.append('file', file);
      const response = await api.post<Result>(URL[kind], form, {
        signal: abort.current.signal,
        onUploadProgress: e => { if (e.total) setProgress(Math.round(100 * e.loaded / e.total)); }
      });
      const data = response.data;
      if (data.success === false && !data.message?.toLowerCase().includes('correctamente')) throw new Error(data.message || 'Importación fallida');
      const item: RecordItem = { hash, name: file.name, size: file.size, completedAt: new Date().toISOString(), summary: data.summary };
      setState(prev => ({ ...prev, [kind]: item, history: [...prev.history, { ...item, kind }] }));
      setFiles(prev => ({ ...prev, [kind]: undefined }));
      setEditing(null);
      setMessage(`${NAME[kind]}: importación confirmada por el servidor.`);
    } catch (e: any) {
      setError(e?.code === 'ERR_CANCELED'
        ? 'Solicitud cancelada. El servidor podría haberla procesado; verifica antes de reintentar.'
        : (e?.response?.data?.message || e?.message || 'Error de conexión. Verifica en el servidor antes de reintentar.'));
    } finally { locked.current = false; setBusy(null); abort.current = null; setProgress(0); }
  };
  const clearLocal = async () => {
    const result = await Swal.fire({ title: '¿Borrar historial local?', text: 'Solo se borran los estados de este navegador; NO los registros de Laravel. Podrías volver a enviar archivos ya importados.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Borrar registro local', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) {
      localStorage.removeItem('school-imports-v2');
      setState({ history: [] }); setFiles({}); setEditing(null);
      setMessage('Se eliminó únicamente el registro de este navegador.');
    }
  };
  return <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex items-start justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-900">Centro de importaciones</h2><p className="mt-1 text-sm text-slate-500">Primero usuarios, luego asignaciones. Historial guardado automáticamente en este navegador.</p></div><FileSpreadsheet className="text-blue-600" size={30}/></div>
    <div className="mb-5 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">Progreso del proceso</span><span>{completed}/2 completados</span></div>
    <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{width:`${completed*50}%`}}/></div>
    {error && <div role="alert" className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={18}/>{error}</div>}
    {message && <div role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}
    {(['users','assignments'] as Kind[]).map(kind => {
      const item = state[kind]; const disabled = kind === 'assignments' && !state.users;
      const showPicker = !item || editing === kind;
      return <section key={kind} className="mb-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-lg bg-slate-100 p-2"><FileSpreadsheet className="text-slate-600"/></div><div><h3 className="font-semibold text-slate-900">{kind === 'users' ? '1. Usuarios' : '2. Asignaciones'}</h3><p className="text-xs text-slate-500">{disabled ? 'Bloqueado hasta completar usuarios' : item ? 'Importado en este navegador' : 'Pendiente de importación'}</p></div></div>{item ? <CheckCircle2 className="text-green-600"/> : <Clock3 className="text-amber-500"/>}</div>
        {item && <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-slate-700"><div className="font-medium break-all">{item.name}</div><div className="mt-1 text-xs">{new Date(item.completedAt).toLocaleString()} · {item.summary?.exitosas ?? '—'} registros exitosos · {item.summary?.errores ?? '—'} errores</div></div>}
        {!disabled && showPicker && <div className="mt-4"><label className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-5 text-center hover:border-blue-400"><UploadCloud className="mx-auto mb-2 text-blue-600"/><span className="text-sm text-slate-600">{files[kind]?.name || 'Seleccionar archivo Excel (.xls, .xlsx)'}</span><input type="file" accept=".xls,.xlsx" disabled={!!busy} onChange={e=>choose(kind,e)} className="sr-only"/></label><button type="button" disabled={!files[kind] || !!busy} onClick={()=>upload(kind)} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{busy === kind ? `Enviando ${progress}%` : item ? 'Importar archivo modificado' : `Importar ${NAME[kind].toLowerCase()}`}</button>{item && <button type="button" disabled={!!busy} onClick={()=>{setEditing(null);setFiles(p=>({...p,[kind]:undefined}));}} className="ml-3 text-sm text-slate-500">Cancelar edición</button>}</div>}
        {item && !showPicker && <button type="button" disabled={!!busy} onClick={()=>setEditing(kind)} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Pencil size={15}/> Subir versión modificada</button>}
      </section>;
    })}
    {busy && <button onClick={()=>abort.current?.abort()} className="mb-4 text-sm text-red-600">Cancelar solicitud</button>}
    <div className="mt-5 border-t pt-4"><h3 className="mb-2 text-sm font-semibold">Historial de este navegador</h3>{state.history.length ? <div className="max-h-44 space-y-2 overflow-y-auto">{[...state.history].reverse().map((h,i)=><div key={`${h.hash}-${i}`} className="flex justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs"><span className="break-all">{NAME[h.kind]} · {h.name}</span><span className="shrink-0 text-slate-500">{new Date(h.completedAt).toLocaleDateString()}</span></div>)}</div> : <p className="text-xs text-slate-500">No hay historial de versiones en este navegador.</p>}
    <button type="button" disabled={!!busy} onClick={clearLocal} className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-red-600"><Trash2 size={14}/> Restablecer registro local</button></div>
    <p className="mt-4 text-xs text-amber-700">El historial local no verifica el estado real del servidor. Si se borra el almacenamiento, se usa otro dispositivo o una solicitud queda sin respuesta, comprueba los datos antes de reintentar.</p>
  </div>;
};
export default InteractiveSequentialImport;
