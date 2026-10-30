import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag, ImageIcon, Send, UserRound, AlertTriangle } from "lucide-react";
import api from "../services/api";
import { getProfile, User } from "../services/auth";

interface Opcion { id: number; texto: string }
interface Pregunta { id: number; enunciado: string | null; imagen: string | null; opciones: Opcion[] }
interface Examen { id: number; titulo: string; preguntas: Pregunta[] }
interface Resultado { mensaje: string; respuestas_correctas: number; total_preguntas: number; puntaje: number }
interface ExamContext { alumno_id: number; examen_id: number; duracion_minutos: number }

const ExamenView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = (() => {
    try { return (location.state || JSON.parse(localStorage.getItem("ultimo_examen") || "{}")) as Partial<ExamContext>; }
    catch { return {} as Partial<ExamContext>; }
  })();
  const { alumno_id, examen_id, duracion_minutos } = context;
  const prefix = `examen_${alumno_id ?? "x"}_${examen_id ?? "x"}`;
  const deadlineKey = `${prefix}_deadline`;
  const answersKey = `${prefix}_answers`;
  const submittedKey = `${prefix}_submitted`;
  const [examen, setExamen] = useState<Examen | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const submittingRef = useRef(false);
  const answersRef = useRef<Record<number, number>>({});
  const examRef = useRef<Examen | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!alumno_id || !examen_id || !duracion_minutos || duracion_minutos <= 0) {
      Swal.fire("Error", "No se encontró información válida del examen", "error").then(() => navigate("/dashboard"));
      setLoading(false);
      return;
    }
    localStorage.setItem("ultimo_examen", JSON.stringify({ alumno_id, examen_id, duracion_minutos }));
    try {
      const stored = JSON.parse(localStorage.getItem(answersKey) || "{}");
      if (stored && typeof stored === "object") { answersRef.current = stored; setRespuestas(stored); }
    } catch { /* ignorar datos locales corruptos */ }
    const savedDeadline = Number(localStorage.getItem(deadlineKey));
    const deadline = savedDeadline > 0 ? savedDeadline : Date.now() + duracion_minutos * 60_000;
    if (!savedDeadline) localStorage.setItem(deadlineKey, String(deadline));
    setTiempoRestante(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    if (localStorage.getItem(submittedKey) === "true") {
      finishedRef.current = true;
      setFinalizado(true);
    }
    let active = true;
    const load = async () => {
      try {
        const [examResponse, profileResponse] = await Promise.all([
          api.get(`/evaluacion/${examen_id}`),
          Promise.resolve().then(() => getProfile()).catch(() => null),
        ]);
        if (!active) return;
        const loaded = examResponse.data.examen as Examen;
        if (!loaded || !Array.isArray(loaded.preguntas)) throw new Error("Formato de examen inválido");
        examRef.current = loaded;
        setExamen(loaded);
        // Compatible con getProfile() que retorna User o { user: User }.
        const profile = (profileResponse as any)?.user ?? (profileResponse as any)?.data?.user ?? (profileResponse as any)?.data ?? profileResponse;
        if (profile?.name) setUser(profile as User);
      } catch (error) {
        console.error(error);
        if (active) Swal.fire("Error", "No se pudo cargar el examen.", "error").then(() => navigate("/dashboard"));
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [alumno_id, examen_id, duracion_minutos, answersKey, deadlineKey, submittedKey, navigate]);

  const finalizar = useCallback(async (auto = false) => {
    const currentExam = examRef.current;
    if (!currentExam || finishedRef.current || submittingRef.current || !alumno_id || !examen_id) return;
    if (!auto) {
      const confirmation = await Swal.fire({
        title: "¿Finalizar examen?",
        text: "Después de enviar no podrás cambiar tus respuestas.",
        icon: "question", showCancelButton: true,
        confirmButtonText: "Sí, enviar", cancelButtonText: "Seguir respondiendo",
        confirmButtonColor: "#2563eb",
      });
      if (!confirmation.isConfirmed || submittingRef.current || finishedRef.current) return;
    }
    submittingRef.current = true;
    setEnviando(true);
    try {
      const payload = currentExam.preguntas.map(p => ({ pregunta_id: p.id, opcion_id: answersRef.current[p.id] ?? -1 }));
      const res = await api.post("/respuestas/subir", { alumno_id, examen_id, respuestas: payload });
      finishedRef.current = true;
      setFinalizado(true);
      setResultado(res.data);
      localStorage.setItem(submittedKey, "true");
      localStorage.removeItem(deadlineKey);
      localStorage.removeItem(answersKey);
      await Swal.fire({ title: auto ? "Tiempo terminado" : "Examen enviado", text: "Tus respuestas fueron recibidas.", icon: "success", confirmButtonText: "Volver al inicio" });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      Swal.fire("No se pudo enviar", "Comprueba tu conexión. Si el tiempo terminó, vuelve a intentar enviar sin modificar las respuestas.", "error");
    } finally { submittingRef.current = false; setEnviando(false); }
  }, [alumno_id, examen_id, deadlineKey, answersKey, submittedKey, navigate]);

  useEffect(() => {
    if (!examen || finalizado) return;
    const tick = () => {
      const deadline = Number(localStorage.getItem(deadlineKey));
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTiempoRestante(seconds);
      if (seconds === 0) void finalizar(true);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [examen, finalizado, deadlineKey, finalizar]);

  const selectAnswer = (questionId: number, optionId: number) => {
    if (finishedRef.current || submittingRef.current || tiempoRestante <= 0) return;
    const next = { ...answersRef.current, [questionId]: optionId };
    answersRef.current = next;
    setRespuestas(next);
    localStorage.setItem(answersKey, JSON.stringify(next));
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50"><div className="text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-4 text-slate-600">Preparando tu examen...</p></div></div>;
  if (!examen) return <div className="p-10 text-center text-red-600">No se pudo cargar el examen.</div>;

  const total = examen.preguntas.length;
  const pregunta = examen.preguntas[currentIndex];
  const respondidas = examen.preguntas.filter(p => respuestas[p.id] !== undefined).length;
  const minutes = Math.floor(tiempoRestante / 60);
  const seconds = tiempoRestante % 60;
  const timerDanger = tiempoRestante <= 60;
  const percent = total ? Math.round((respondidas / total) * 100) : 0;

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Evaluación en curso</p><h1 className="truncate text-lg font-bold sm:text-xl">{examen.titulo}</h1></div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 sm:flex"><UserRound size={17} className="text-blue-600"/><span className="max-w-100 truncate text-sm font-semibold text-blue-600">{user?.name || `Alumno #${alumno_id}`}</span></div>
          <div role="timer" aria-live="off" className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold tabular-nums ${timerDanger ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}><Clock3 size={20}/><span className="text-xl">{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}</span></div>
        </div>
      </div>
    </header>
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        {finalizado ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto mb-3 text-green-600" size={48}/><h2 className="text-2xl font-bold">Examen finalizado</h2>{resultado && <p className="mt-3 text-slate-600">{resultado.mensaje} · {resultado.respuestas_correctas}/{resultado.total_preguntas} correctas · {resultado.puntaje}%</p>}<button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white" onClick={() => navigate("/dashboard")}>Volver al inicio</button></div>
        : pregunta ? <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-7"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Pregunta {currentIndex + 1} de {total}</span><span className="text-xs text-slate-500">{respuestas[pregunta.id] !== undefined ? "Respondida" : "Sin responder"}</span></div></div>
          <div className="space-y-6 p-5 sm:p-7">
            <h2 className="whitespace-pre-wrap text-xl font-semibold leading-relaxed sm:text-2xl">{pregunta.enunciado || "Observa la imagen y selecciona la respuesta correcta."}</h2>
            {pregunta.imagen && <button type="button" onClick={() => setImageOpen(true)} className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left" aria-label="Ampliar imagen de la pregunta"><img src={pregunta.imagen} alt={`Imagen de la pregunta ${currentIndex + 1}`} className="mx-auto max-h-[440px] w-full object-contain"/><span className="flex items-center justify-center gap-2 border-t bg-white py-2 text-sm font-medium text-blue-600"><ImageIcon size={16}/> Pulsa para ampliar</span></button>}
            <div className="space-y-3" role="radiogroup" aria-label={`Opciones de la pregunta ${currentIndex + 1}`}>
              {pregunta.opciones.map((op, i) => {const checked = respuestas[pregunta.id] === op.id;return <label key={op.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${checked ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}><input type="radio" name={`pregunta-${pregunta.id}`} value={op.id} checked={checked} onChange={() => selectAnswer(pregunta.id, op.id)} disabled={enviando || tiempoRestante <= 0} className="h-4 w-4 accent-blue-600"/><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${checked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{String.fromCharCode(65 + i)}</span><span className="flex-1 whitespace-pre-wrap text-sm font-medium sm:text-base">{op.texto}</span>{checked && <CheckCircle2 className="shrink-0 text-blue-600" size={20}/>}</label>})}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:px-7"><button onClick={() => setCurrentIndex(i => Math.max(0,i-1))} disabled={currentIndex===0 || enviando} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold disabled:opacity-40"><ArrowLeft size={17}/> Anterior</button>{currentIndex < total - 1 ? <button onClick={() => setCurrentIndex(i => Math.min(total-1,i+1))} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Siguiente <ArrowRight size={17}/></button> : <button onClick={() => void finalizar(false)} disabled={enviando} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><Send size={17}/>{enviando ? "Enviando..." : "Finalizar examen"}</button>}</div>
        </article> : <div className="rounded-2xl bg-white p-6">Este examen no contiene preguntas.</div>}
        {!finalizado && <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 shrink-0" size={18}/>Tus respuestas se guardan en este navegador. Al terminar el tiempo se enviarán automáticamente.</div>}
      </section>
      <aside className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">Tu progreso</span><span className="text-slate-500">{respondidas} de {total} respondidas</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{width:`${percent}%`}}/></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><Flag size={19} className="text-blue-600"/><h3 className="font-bold">Navegar preguntas</h3></div>
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">{examen.preguntas.map((p,i) => <button key={p.id} onClick={() => {setCurrentIndex(i);setImageOpen(false);}} aria-label={`Ir a pregunta ${i+1}${respuestas[p.id] !== undefined ? ", respondida" : ""}`} aria-current={currentIndex===i ? "step" : undefined} className={`aspect-square min-w-0 rounded-lg border text-sm font-bold transition-colors ${currentIndex===i ? "border-blue-700 ring-2 ring-blue-200" : "border-slate-200"} ${respuestas[p.id] !== undefined ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{i+1}</button>)}</div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-600"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-blue-600"/>Respondida</span><span className="flex items-center gap-2"><i className="h-3 w-3 rounded border bg-slate-50"/>Pendiente</span></div>
          {!finalizado && <button onClick={() => void finalizar(false)} disabled={enviando || !total} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"><Send size={17}/>{enviando ? "Enviando..." : "Finalizar examen"}</button>}
        </div>
      </aside>
    </main>
    {imageOpen && pregunta?.imagen && <div role="dialog" aria-modal="true" aria-label="Imagen ampliada" className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"><button autoFocus onClick={() => setImageOpen(false)} className="self-end rounded-lg bg-white px-4 py-2 font-semibold text-slate-900">Cerrar ✕</button><img src={pregunta.imagen} alt={`Imagen ampliada de la pregunta ${currentIndex+1}`} className="min-h-0 flex-1 object-contain"/></div>}
  </div>;
};

export default ExamenView;
