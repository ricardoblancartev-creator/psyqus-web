'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Resultados() {
  const [datosGrafica, setDatosGrafica] = useState<any[]>([])
  const [puntajeTotal, setPuntajeTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const reportRef = useRef(null)

  useEffect(() => {
    const obtenerYProcesar = async () => {
      try {
        const { data, error } = await supabase.from('respuestas').select('p1')
        if (error) throw error
        if (data && data.length > 0) {
          let sumaPuntos = 0;
          const conteo = data.reduce((acc: any, curr: any) => {
            const respuesta = curr.p1 || 'Sin respuesta'
            acc[respuesta] = (acc[respuesta] || 0) + 1
            if(respuesta === 'SIEMPRE') sumaPuntos += 4;
            if(respuesta === 'CASI SIEMPRE') sumaPuntos += 2;
            return acc
          }, {})
          setDatosGrafica(Object.keys(conteo).map(key => ({ name: key, cantidad: conteo[key] })))
          setPuntajeTotal(sumaPuntos)
        }
      } catch (err) { console.error(err) } finally { setCargando(false) }
    }
    obtenerYProcesar()
  }, [])

  const descargarPDF = async () => {
const element = reportRef.current;

if (!element) return;

const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,
  width: 800,
});

    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Reporte_Oficial_Psyqus.pdf`);
  };

  const analisis = puntajeTotal > 10 
    ? { nivel: 'ALTO', color: 'text-red-700', bg: 'bg-red-50', rec: 'Revisión inmediata de cargas de trabajo y jornadas laborales.' }
    : { nivel: 'ESTABLE', color: 'text-green-700', bg: 'bg-green-50', rec: 'El entorno organizacional se mantiene bajo control preventivo.' };

  if (cargando) return <div className="p-8">Generando dictamen...</div>

  return (
    <div className="p-6 bg-slate-200 min-h-screen flex flex-col items-center font-sans">
      <button 
        onClick={descargarPDF}
        className="mb-8 bg-blue-700 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition-all"
      >
        📥 DESCARGAR REPORTE CERTIFICADO (PDF)
      </button>

      <div ref={reportRef} className="bg-white p-12 w-[800px] min-h-[1050px] shadow-2xl flex flex-col border-t-[12px] border-blue-900">
        <div className="flex justify-between items-start mb-10 border-b-2 pb-6">
          <div>
            <h1 className="text-4xl font-black text-blue-900 tracking-tighter">PSYQUS</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Guía de Referencia III | NOM-035-STPS-2018</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 mb-1">DICTAMEN FINAL</p>
            <p className={`text-3xl font-black ${analisis.color}`}>{analisis.nivel}</p>
          </div>
        </div>

        <div className="flex-grow">
          {/* AQUÍ AGREGAMOS LA PREGUNTA EXPLÍCITA */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 mb-2">
              Dimensión: Carga de Trabajo
            </h2>
            <p className="text-gray-600 italic text-sm ml-5">
              Reactivo evaluado: "¿Mi trabajo me exige mucho esfuerzo difícil de olvidar?"
            </p>
          </div>
          
          <div className="h-[350px] w-full mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: 'bold'}} />
                <YAxis />
                <Bar dataKey="cantidad" fill="#1e3a8a" radius={[6, 6, 0, 0]} barSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-8 rounded-3xl border-2 mb-10 ${analisis.bg} border-current`}>
            <h3 className="font-black text-[10px] uppercase mb-3 tracking-widest">Interpretación Técnica:</h3>
            <p className="text-lg leading-relaxed text-gray-800 font-medium italic">
              "{analisis.rec}"
            </p>
          </div>
        </div>

        <div className="mt-auto pt-10 border-t-2 border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">EP</div>
            <div>
              <p className="text-lg font-black text-gray-900">Mtra. Esperanza Prieto</p>
              <p className="text-blue-700 font-bold text-xs uppercase">Cédula Profesional: XXXXXXXX</p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase">Consultora Certificada en Salud Laboral</p>
            </div>
          </div>
          <div className="text-right opacity-30 text-[8px] font-mono">
            CERTIFICADO: {Math.random().toString(36).substr(2, 9).toUpperCase()}<br/>
            SISTEMA PSYQUS V1.0
          </div>
        </div>
      </div>
    </div>
  )
}
