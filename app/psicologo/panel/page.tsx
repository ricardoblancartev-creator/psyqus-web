"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import { AlertCircle, User, Clock, Loader2, RefreshCcw, ShieldCheck } from "lucide-react"

// 1. Definimos la estructura de los datos (esto quita los errores de 'never')
interface CasoChat {
  id: string;
  created_at: string;
  empleado_nombre: string | null;
  resumen_ia: string | null;
  solicita_rh: boolean;
  departamento: string | null;
}

export default function PanelPsicologoReal() {
  // 2. Le decimos a useState que usará un array de CasoChat
  const [casos, setCasos] = useState<CasoChat[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const isAuth = sessionStorage.getItem("psicologo_auth")
    if (!isAuth) {
      router.push("/psicologo")
      return
    }
    fetchCasos()
  }, [router])

  const fetchCasos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setCasos(data as CasoChat[]) // Forzamos el tipo para asegurar compatibilidad
    }
    setLoading(false)
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-cyan-400 w-5 h-5" />
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Acceso Profesional</span>
            </div>
            <h1 className="text-3xl font-bold">Panel de Supervisión</h1>
          </div>
          <button onClick={fetchCasos} className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-400">
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400 w-10 h-10" /></div>
        ) : (
          <div className="grid gap-4">
            {casos.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No hay conversaciones registradas aún.</p>
            ) : (
              casos.map((caso) => (
                <div 
                  key={caso.id} 
                  className={`p-6 rounded-2xl border transition-all ${
                    caso.solicita_rh 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : 'border-slate-800 bg-slate-900/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="text-slate-400 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{caso.empleado_nombre || "Anónimo"}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-mono">{caso.departamento || "Sin Área"}</p>
                      </div>
                    </div>
                    {caso.solicita_rh && (
                      <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold border border-red-500/30">
                        <AlertCircle className="w-3 h-3" /> ATENCIÓN PRIORITARIA RH
                      </div>
                    )}
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Resumen de la IA:</p>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{caso.resumen_ia || "Conversación sin resumen disponible."}"
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-[10px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(caso.created_at).toLocaleString()}
                    </div>
                    <button className="text-cyan-400 font-bold hover:underline">REVISAR TRANSCRIPCIÓN →</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
