"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Question = {
  id: number;
  text: string;
  category: string;
};

const scaleNom = [
  { label: "Siempre", value: 4 },
  { label: "Casi siempre", value: 3 },
  { label: "Algunas veces", value: 2 },
  { label: "Casi nunca", value: 1 },
  { label: "Nunca", value: 0 },
];

const scaleYesNo = [
  { label: "Sí", value: 1 },
  { label: "No", value: 0 },
];

const questionnaireOne: Question[] = [
  {
    id: 1,
    text: "¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo, un acontecimiento traumático severo como accidente grave, asalto, actos violentos, secuestro, amenazas o cualquier otro que ponga en riesgo su vida, salud o la de otras personas?",
    category: "I. Acontecimiento traumático severo",
  },
  {
    id: 2,
    text: "¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provoquen malestares?",
    category: "II. Recuerdos persistentes",
  },
  {
    id: 3,
    text: "¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?",
    category: "II. Recuerdos persistentes",
  },
  {
    id: 4,
    text: "¿Se ha esforzado por evitar sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?",
    category: "III. Evitación",
  },
  {
    id: 5,
    text: "¿Se ha esforzado por evitar actividades, lugares o personas que motivan recuerdos del acontecimiento?",
    category: "III. Evitación",
  },
  {
    id: 6,
    text: "¿Ha tenido dificultad para recordar alguna parte importante del evento?",
    category: "III. Evitación",
  },
  {
    id: 7,
    text: "¿Ha disminuido su interés en sus actividades cotidianas?",
    category: "III. Evitación",
  },
  {
    id: 8,
    text: "¿Se ha sentido alejado o distante de los demás?",
    category: "III. Evitación",
  },
  {
    id: 9,
    text: "¿Ha notado que tiene dificultad para expresar sus sentimientos?",
    category: "III. Evitación",
  },
  {
    id: 10,
    text: "¿Ha tenido la impresión de que su vida se va a acortar, que va a morir antes que otras personas o que tiene un futuro limitado?",
    category: "III. Evitación",
  },
  {
    id: 11,
    text: "¿Ha tenido dificultades para dormir?",
    category: "IV. Afectación",
  },
  {
    id: 12,
    text: "¿Ha estado particularmente irritable o le han dado arranques de coraje?",
    category: "IV. Afectación",
  },
  {
    id: 13,
    text: "¿Ha tenido dificultad para concentrarse?",
    category: "IV. Afectación",
  },
  {
    id: 14,
    text: "¿Ha estado nervioso o constantemente en alerta?",
    category: "IV. Afectación",
  },
  {
    id: 15,
    text: "¿Se ha sobresaltado fácilmente por cualquier cosa?",
    category: "IV. Afectación",
  },
];

const questionnaireTwo: Question[] = [
  { id: 1, text: "Mi trabajo me exige hacer mucho esfuerzo físico", category: "Condiciones de trabajo" },
  { id: 2, text: "Me preocupa sufrir un accidente en mi trabajo", category: "Condiciones de trabajo" },
  { id: 3, text: "Considero que las actividades que realizo son peligrosas", category: "Condiciones de trabajo" },
  { id: 4, text: "Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno", category: "Carga de trabajo" },
  { id: 5, text: "Por la cantidad de trabajo que tengo debo trabajar sin parar", category: "Carga de trabajo" },
  { id: 6, text: "Considero que es necesario mantener un ritmo de trabajo acelerado", category: "Carga de trabajo" },
  { id: 7, text: "Mi trabajo exige que esté muy concentrado", category: "Carga de trabajo" },
  { id: 8, text: "Mi trabajo requiere que memorice mucha información", category: "Carga de trabajo" },
  { id: 9, text: "Mi trabajo exige que atienda varios asuntos al mismo tiempo", category: "Carga de trabajo" },
  { id: 10, text: "En mi trabajo soy responsable de cosas de mucho valor", category: "Responsabilidades" },
  { id: 11, text: "Respondo ante mi jefe por los resultados de toda mi área de trabajo", category: "Responsabilidades" },
  { id: 12, text: "En mi trabajo me dan órdenes contradictorias", category: "Responsabilidades" },
  { id: 13, text: "Considero que en mi trabajo me piden hacer cosas que no son necesarias", category: "Responsabilidades" },
  { id: 14, text: "Trabajo horas extras más de tres veces a la semana", category: "Jornada de trabajo" },
  { id: 15, text: "Mi trabajo me exige laborar en días de descanso, festivos o fines de semana", category: "Jornada de trabajo" },
  { id: 16, text: "Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales", category: "Interferencia trabajo-familia" },
  { id: 17, text: "Pienso en las actividades familiares o personales cuando estoy en mi trabajo", category: "Interferencia trabajo-familia" },
  { id: 18, text: "Mi trabajo permite que desarrolle nuevas habilidades", category: "Control sobre el trabajo" },
  { id: 19, text: "En mi trabajo puedo aspirar a un mejor puesto", category: "Control sobre el trabajo" },
  { id: 20, text: "Durante mi jornada de trabajo puedo tomar pausas cuando las necesito", category: "Control sobre el trabajo" },
  { id: 21, text: "Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo", category: "Control sobre el trabajo" },
  { id: 22, text: "Puedo cambiar el orden de las actividades que realizo en mi trabajo", category: "Control sobre el trabajo" },
  { id: 23, text: "Me informan con claridad cuáles son mis funciones", category: "Capacitación e información" },
  { id: 24, text: "Me explican claramente los resultados que debo obtener en mi trabajo", category: "Capacitación e información" },
  { id: 25, text: "Me informan con quién puedo resolver problemas o asuntos de trabajo", category: "Capacitación e información" },
  { id: 26, text: "Me permiten asistir a capacitaciones relacionadas con mi trabajo", category: "Capacitación e información" },
  { id: 27, text: "Recibo capacitación útil para hacer mi trabajo", category: "Capacitación e información" },
  { id: 28, text: "Mi jefe tiene en cuenta mis puntos de vista y opiniones", category: "Relaciones y liderazgo" },
  { id: 29, text: "Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo", category: "Relaciones y liderazgo" },
  { id: 30, text: "Puedo confiar en mis compañeros de trabajo", category: "Relaciones y liderazgo" },
  { id: 31, text: "Cuando tenemos que realizar trabajo de equipo los compañeros colaboran", category: "Relaciones y liderazgo" },
  { id: 32, text: "Mis compañeros de trabajo me ayudan cuando tengo dificultades", category: "Relaciones y liderazgo" },
  { id: 33, text: "En mi trabajo puedo expresarme libremente sin interrupciones", category: "Violencia laboral" },
  { id: 34, text: "Recibo críticas constantes a mi persona y/o trabajo", category: "Violencia laboral" },
  { id: 35, text: "Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones", category: "Violencia laboral" },
  { id: 36, text: "Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones", category: "Violencia laboral" },
  { id: 37, text: "Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador", category: "Violencia laboral" },
  { id: 38, text: "Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores", category: "Violencia laboral" },
  { id: 39, text: "Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo", category: "Violencia laboral" },
  { id: 40, text: "He presenciado actos de violencia en mi centro de trabajo", category: "Violencia laboral" },
  { id: 41, text: "Atiendo clientes o usuarios muy enojados", category: "Atención a clientes" },
  { id: 42, text: "Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas", category: "Atención a clientes" },
  { id: 43, text: "Para hacer mi trabajo debo demostrar sentimientos distintos a los míos", category: "Atención a clientes" },
  { id: 44, text: "Comunican tarde los asuntos de trabajo", category: "Supervisión" },
  { id: 45, text: "Dificultan el logro de los resultados del trabajo", category: "Supervisión" },
  { id: 46, text: "Ignoran las sugerencias para mejorar su trabajo", category: "Supervisión" },
];

export default function EncuestaPage() {
  const { user } = useUser();

  const [started, setStarted] = useState(false);
  const [area, setArea] = useState("");
  const [puesto, setPuesto] = useState("");
  const [step, setStep] = useState(0);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<"I" | "II">("I");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questionnaireOptions = {
    I: "Cuestionario I - Acontecimiento traumático severo",
    II: "Cuestionario II - Factores de riesgo psicosocial",
  };

  const currentQuestionnaireName =
    questionnaireOptions[selectedQuestionnaire];

  const currentQuestions =
    selectedQuestionnaire === "I" ? questionnaireOne : questionnaireTwo;

  const currentScale =
    selectedQuestionnaire === "I" ? scaleYesNo : scaleNom;

  const currentQuestion = currentQuestions[step];

  const progress = ((step + 1) / currentQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const updated = {
      ...answers,
      [currentQuestion.id]: value,
    };

    setAnswers(updated);

    if (step < currentQuestions.length - 1) {
      setStep(step + 1);
    } else {
      saveEvaluation(updated);
    }
  };

  async function saveEvaluation(finalAnswers: Record<number, number>) {
    const total = Object.values(finalAnswers).reduce(
      (acc, item) => acc + item,
      0
    );

    const payload = {
      user_id: user?.id ?? null,
      area,
      puesto,
      tipo_cuestionario: selectedQuestionnaire,
      nombre_cuestionario: currentQuestionnaireName,
      respuestas: finalAnswers,
      puntaje_total: total,
    };

    const { error } = await supabase
      .from("nom035_evaluaciones")
      .insert([payload]);

    if (error) {
      console.error("Error completo Supabase:", JSON.stringify(error, null, 2));
      console.log("Payload enviado:", payload);

      alert(
        `Error guardando evaluación: ${error.message || "Revisa consola"}`
      );

      return;
    }

    setSubmitted(true);
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Psyqus Assessment
          </p>

          <h1 className="mt-4 text-5xl font-black">
            NOM-035 Oficial
          </h1>

          <p className="mt-5 text-slate-400 leading-relaxed">
            Antes de comenzar necesitamos identificar el área y puesto del
            colaborador.
          </p>

          <p className="mt-2 text-cyan-300 text-sm">
            Cuestionarios I y II para la identificación de factores de riesgo
            psicosocial.
          </p>

          <div className="mt-8">
            <label className="block mb-3 text-sm text-slate-400">
              Tipo de cuestionario
            </label>

            <select
              value={selectedQuestionnaire}
              onChange={(e) => {
                setSelectedQuestionnaire(e.target.value as "I" | "II");
                setStep(0);
                setAnswers({});
              }}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none"
            >
              <option value="I">
                Cuestionario I - Acontecimiento traumático severo
              </option>
              <option value="II">
                Cuestionario II - Factores de riesgo psicosocial
              </option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-8">
            <div>
              <label className="block mb-3 text-sm text-slate-400">
                Área
              </label>

              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ejemplo: Ventas"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white"
              />
            </div>

            <div>
              <label className="block mb-3 text-sm text-slate-400">
                Puesto
              </label>

              <input
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
                placeholder="Ejemplo: Supervisor"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white"
              />
            </div>
          </div>

          <button
            disabled={!area || !puesto}
            onClick={() => setStarted(true)}
            className="mt-8 w-full rounded-2xl bg-cyan-400 px-6 py-5 text-lg font-bold text-slate-950 disabled:opacity-50"
          >
            Comenzar evaluación
          </button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="rounded-[2rem] border border-cyan-500/20 bg-slate-950/70 p-10 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-300" />

          <h1 className="mt-6 text-5xl font-black">
            Evaluación completada
          </h1>

          <p className="mt-4 text-slate-400">
            Tus respuestas fueron registradas correctamente.
          </p>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-300 transition"
          >
            Volver al dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <section className="max-w-4xl mx-auto">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-sm text-slate-400">
                Pregunta {step + 1} de {currentQuestions.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {currentQuestionnaireName}
              </p>

              <p className="mt-2 text-cyan-300 font-semibold">
                {currentQuestion.category}
              </p>
            </div>

            <div className="w-52 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedQuestionnaire}-${currentQuestion.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <h2 className="text-3xl font-black leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="grid gap-4 mt-8">
                {currentScale.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-5 text-left hover:border-cyan-400 transition"
                  >
                    <span className="text-lg font-semibold">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
