"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase" // Asegúrate de tener este archivo configurado
import RadarNom035 from "../../components/charts/RadarNom035"
import DepartmentRisk from "../../components/charts/DepartmentRisk"
import MapaDeCalor from "../../components/charts/MapaDeCalor"
import RadarBienestar from "../../components/charts/RadarBienestar"
import { Brain, ShieldAlert, Users, MessageCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [depto, setDepto] = useState("General")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvaluados: 0,
    promedioGeneral: 0,
    radarScores: [0, 0, 0, 0, 0, 0] // Scores para el radar
  })

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true)
      
      // 1. Consultamos la tabla resultados_encuesta
      let query = supabase.from('resultados_encuesta').select('*')
      
      // Si el depto no es General, filtramos (necesitas la columna 'departamento' en Supabase)
      if (depto !== "General") {
        query = query.eq('departamento', depto)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error de Supabase:", error)
      } else if (data && data.length > 0) {
        const total = data.length
        
        // 2. Calculamos promedios basados en TUS columnas de la imagen
        const m1 = data.reduce((acc, curr) => acc + (curr.modulo_1_score || 0), 0) / total
        const m2 = data.reduce((acc, curr) => acc + (curr.modulo_2_score || 0), 0) / total
        const m3 = data.reduce((acc, curr) => acc + (curr.modulo_3_score || 0), 0) / total
        
        // Promedio general (escala 0-10 para el KPI)
        const promedioG = (m1 + m2 + m3) / 3

        setStats({
          totalEvaluados: total,
          promedioGeneral: Math.round(promedioG * 10), // Convertimos a porcentaje (7.2 -> 72%)
          radarScores: [m1, m2, m3, 5, 5, 5] // Rellenamos con 5 los módulos que falten
        })
      }
      setLoading(false)
    }

    fetchRealData()
  }, [depto]) // Se dispara cada vez que cambias de departamento

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Psyqus Intelligence</h1>
          <p className="text-slate-400 text-sm">Datos reales desde Supabase</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {["General", "Ventas", "Operaciones", "RH"].map((d) => (
            <button
              key={d}
              onClick={() => setDepto(d)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                depto === d 
                ? "bg-cyan-500 text-slate-950 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <Users className="text-cyan-400 mb-2"/>
          <p className="text-sm text-slate-400">Evaluaciones ({depto})</p>
          <h2 className="text-2xl font-bold">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : stats.totalEvaluados}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <Brain className="text-purple-400 mb-2"/>
          <p className="text-sm text-slate-400">Índice Bienestar</p>
          <h2 className="text-2xl font-bold">
            {loading ? "..." : `${stats.promedioGeneral}%`}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-red-400">
          <ShieldAlert className="mb-2"/>
          <p className="text-sm text-slate-400">Alertas Activas</p>
          <h2 className="text-2xl font-bold">3</h2>
        </div>

        <Link href="/buzon" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-all group">
          <MessageCircle className="text-green-400 mb-2 group-hover:scale-110 transition-transform"/>
          <p className="text-sm text-slate-400">Buzón de Paz</p>
          <h2 className="text-2xl font-bold">Ver Inbox</h2>
        </Link>
      </div>

      {/* GRIDS DE GRÁFICOS */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4 text-cyan-400 font-semibold text-center">Radar NOM-035</h2>
          <RadarNom035 />
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4 text-cyan-400 font-semibold text-center">Riesgo por Departamento</h2>
          <DepartmentRisk selectedDepto={depto} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4 text-cyan-400 font-semibold text-center">Bienestar por Módulos</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">Cargando datos...</div>
          ) : (
            <RadarBienestar scores={stats.radarScores} />
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg mb-4 text-cyan-400 font-semibold text-center">Mapa de Calor</h2>
          <MapaDeCalor />
        </div>
      </div>
    </div>
  )
}
