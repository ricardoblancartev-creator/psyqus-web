"use client";

import { useEffect, useState } from "react";

import { useSession, useUser } from "@clerk/nextjs";

import { motion, AnimatePresence } from "framer-motion";

import {
  CheckCircle2,
} from "lucide-react";

import { createClerkSupabaseClient } from "@/lib/supabase-clerk";

type Question = {
  id: number;
  text: string;
  category: string;
};

const scale = [
  { label: "Siempre", value: 4 },
  { label: "Casi siempre", value: 3 },
  { label: "A veces", value: 2 },
  { label: "Casi nunca", value: 1 },
  { label: "Nunca", value: 0 },
];

const questions: Question[] = [

  {
    id: 1,
    text: "La cantidad de trabajo que realizo suele rebasar el tiempo disponible.",
    category: "Carga",
  },

  {
    id: 2,
    text: "Termino mi jornada con agotamiento físico o mental.",
    category: "Carga",
  },

  {
    id: 3,
    text: "En mi trabajo hay momentos de presión tan alta que me cuesta concentrarme.",
    category: "Carga",
  },

  {
    id: 4,
    text: "Mi trabajo me permite organizar mis tareas con claridad.",
    category: "Control",
  },

  {
    id: 5,
    text: "Tengo claridad sobre lo que se espera de mí en mi puesto.",
    category: "Control",
  },

  {
    id: 6,
    text: "Puedo tomar algunas decisiones sobre cómo realizar mi trabajo.",
    category: "Control",
  },

  {
    id: 7,
    text: "Mi jefe inmediato escucha mis opiniones o propuestas.",
    category: "Liderazgo",
  },

  {
    id: 8,
    text: "Recibo retroalimentación clara y útil sobre mi desempeño.",
    category: "Liderazgo",
  },

  {
    id: 9,
    text: "Cuando surge un problema, mi líder lo maneja con respeto.",
    category: "Liderazgo",
  },

  {
    id: 10,
    text: "Siento que mi esfuerzo pasa desapercibido.",
    category: "Reconocimiento",
  },

  {
    id: 11,
    text: "En mi trabajo rara vez se reconoce lo que hago bien.",
    category: "Reconocimiento",
  },

  {
    id: 12,
    text: "Mis horarios o carga laboral interfieren con mi vida personal.",
    category: "Jornada",
  },

  {
    id: 13,
    text: "Me cuesta desconectarme del trabajo incluso fuera del horario laboral.",
    category: "Jornada",
  },

  {
    id: 14,
    text: "El ambiente entre compañeros suele sentirse tenso o desgastante.",
    category: "Ambiente",
  },

  {
    id: 15,
    text: "En mi equipo se puede hablar con respeto incluso cuando hay desacuerdo.",
    category: "Ambiente",
  },

  {
    id: 16,
    text: "He sentido aislamiento, indiferencia o exclusión dentro del trabajo.",
    category: "Ambiente",
  },

  {
    id: 17,
    text: "He recibido trato humillante, burlas o descalificación en el trabajo.",
    category: "Violencia",
  },

  {
    id: 18,
    text: "Me preocupa ser castigado o señalado si expreso malestar laboral.",
    category: "Violencia",
  },

  {
    id: 19,
    text: "He presenciado formas de maltrato o agresión dentro del entorno laboral.",
    category: "Violencia",
  },

  {
    id: 20,
    text: "Siento que mi trabajo es psicológicamente sostenible.",
    category: "Ambiente",
  },

];

export default function EncuestaPage() {

  const { user } = useUser();
  const { session } = useSession();

  const [started, setStarted] = useState(false);

const [nombre, setNombre] = useState("");
const [apellido, setApellido] = useState("");
const [email, setEmail] = useState("");

const [area, setArea] = useState("");
const [puesto, setPuesto] = useState("");

const [perfilCargando, setPerfilCargando] = useState(true);

const [step, setStep] = useState(0);
const [answers, setAnswers] = useState<Record<number, number>>({});
const [submitted, setSubmitted] = useState(false);

useEffect(() => {
  async function cargarEmpleado() {
    if (!user || !session) return;

    const supabase = createClerkSupabaseClient(async () => {
      return session.getToken();
    });

    const { data, error } = await supabase
      .from("empleados")
      .select("nombre, apellido, email, area, puesto")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error cargando empleado:", error);
      setPerfilCargando(false);
      return;
    }

    if (data) {
      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setEmail(data.email || "");
      setArea(data.area || "");
      setPuesto(data.puesto || "");
    }

    setPerfilCargando(false);
  }

  cargarEmpleado();
}, [user, session]);


  const currentQuestion = questions[step];

  const progress =
    ((step + 1) / questions.length) * 100;
    const handleAnswer = (value: number) => {
  const updated = {
    ...answers,
    [currentQuestion.id]: value,
  };

  setAnswers(updated);

  if (step < questions.length - 1) {
    setStep(step + 1);
  } else {
    saveEvaluation(updated);
  }
};


async function saveEvaluation(finalAnswers: Record<number, number>) {
  if (!session) return;

  const total = Object.values(finalAnswers).reduce(
    (acc, item) => acc + item,
    0
  );

  const payload = {
    user_id: user?.id ?? null,
    nombre,
    apellido,
    email,
    area,
    puesto,
    respuestas: finalAnswers,
    puntaje_total: total,
  };

  const supabase = createClerkSupabaseClient(async () => {
    return session.getToken();
  });

  const { error } = await supabase
    .from("resultados_encuestas")
    .insert([payload]);


if (error) {
  console.error(
    "Error completo Supabase:",
    JSON.stringify(error, null, 2)
  );

  console.log("Payload enviado:", payload);

  alert(
    `Error guardando evaluación: ${
      error.message || "Revisa consola"
    }`
  );

  return;
}



  alert("Evaluación guardada");
  window.location.href = "/dashboard";
}

  if (!started) {

    return (

      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">

        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">

          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Psyqus Assessment
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Clima Organizacional en tu trabajo
          </h1>

          <p className="mt-5 text-slate-400 leading-relaxed">
            Antes de comenzar necesitamos identificar
            el área y puesto del colaborador.
          </p>

          <p className="mt-2 text-cyan-300 text-sm"> 
            Evaluación de percepción del ambiente laboral.
          </p>

<div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-5">
  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
    Colaborador
  </p>

  {perfilCargando ? (
    <p className="mt-3 text-slate-400">
      Cargando datos del colaborador...
    </p>
  ) : (
    <>
      <p className="mt-3 text-xl font-black text-white">
        {nombre} {apellido}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {email}
      </p>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            Área
          </p>

          <p className="mt-1 font-semibold text-slate-200">
            {area || "Sin área registrada"}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            Puesto
          </p>

          <p className="mt-1 font-semibold text-slate-200">
            {puesto || "Sin puesto registrado"}
          </p>
        </div>
      </div>
    </>
  )}
</div>

<button
  disabled={perfilCargando || !nombre || !apellido || !area || !puesto}
  onClick={() => setStarted(true)}
  className="mt-8 w-full rounded-2xl bg-cyan-400 px-6 py-5 text-lg font-bold text-slate-950 disabled:opacity-50"
>
  {perfilCargando ? "Cargando perfil..." : "Comenzar evaluación"}
</button>


        </div>

      </main>

    );

  }

  if (submitted) {

    return (

      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">

        <div className="rounded-[2rem] border border-cyan-500/20 bg-slate-950/70 p-10 text-center">

          <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-300" />

          <h1 className="mt-6 text-5xl font-black">
            Evaluación completada
          </h1>

          <p className="mt-4 text-slate-400">
            Tus respuestas fueron registradas correctamente.
          </p>
          <button
  onClick={() =>
    window.location.href = "/dashboard"
  }
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
                Pregunta {step + 1} de {questions.length}
              </p>

              <p className="mt-2 text-cyan-300 font-semibold">
                {currentQuestion.category}
              </p>

            </div>

            <div className="w-52 h-2 rounded-full bg-slate-800 overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          <AnimatePresence mode="wait">

            <motion.div
              key={currentQuestion.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
            >

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">

                <h2 className="text-3xl font-black leading-tight">
                  {currentQuestion.text}
                </h2>

              </div>

              <div className="grid gap-4 mt-8">

                {scale.map((option) => (

                  <button
                    key={option.label}
                    onClick={() =>
                      handleAnswer(option.value)
                    }
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
