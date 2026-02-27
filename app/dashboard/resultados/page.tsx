'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Resultado {
  id: string
  centro_id: string | null
  respuesta: Record<string, string | number> | null
  created_at: string
  centros_trabajo?: { name: string }
}

export default function Resultados() {
  const [centers, setCenters] = useState<{ id: string; name: string }[]>([])
  const [results, setResults] = useState<Resultado[]>([])
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null)
  const [psychologistName, setPsychologistName] = useState('Nombre de la Psicóloga')
  const [psychologistCedula, setPsychologistCedula] = useState('Cédula Profesional XXXX')
  const [loading, setLoading] = useState(true)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: centersData } = await supabase.from('centros_trabajo').select('id, name')
    setCenters(centersData || [])

    const { data: resultsData } = await supabase
      .from('respuestas_encuesta')
      .select('*, centros_trabajo(name)')
      .order('created_at', { ascending: false })

    setResults(resultsData || [])
    setLoading(false)
  }

  const filteredResults = selectedCenterId
    ? results.filter((r) => r.centro_id === selectedCenterId)
    : results

  const calculateDomainScores = (responses: Resultado[]) => {
    if (!responses.length) return []

    const domains: Record<string, number[]> = {
      ambiente: [],
      carga: [],
      control: [],
      jornada: [],
      interferencia: [],
      liderazgo: [],
      relaciones: [],
      violencia: [],
      entorno: [],
    }

    responses.forEach((r) => {
      const res = r.respuesta || {}
      // Ajusta estas claves a tu JSON real (ej: "pregunta_1": "3")
      if (res.ambiente_trabajo) domains.ambiente.push(Number(res.ambiente_trabajo))
      if (res.carga_de_trabajo) domains.carga.push(Number(res.carga_de_trabajo))
      if (res.falta_de_control) domains.control.push(Number(res.falta_de_control))
      // ← agrega aquí más if para tus dominios NOM-035 reales
    })

    return Object.entries(domains).map(([domain, scores]) => {
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const avgFixed = Number(avg.toFixed(2))
      let nivel = 'Sin riesgo'
      if (avg >= 1 && avg < 2) nivel = 'Bajo'
      else if (avg >= 2 && avg < 3) nivel = 'Medio'
      else if (avg >= 3 && avg < 4) nivel = 'Alto'
      else if (avg >= 4) nivel = 'Muy alto'

      return { domain, avg: avgFixed, nivel }
    })
  }

  const domainData = calculateDomainScores(filteredResults)
  const totalScore = domainData.reduce((sum, d) => sum + d.avg, 0) / (domainData.length || 1)

  async function downloadPDF() {
    if (!reportRef.current) return
    const canvas = await html2canvas(reportRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.setFontSize(18)
    pdf.text('Informe de Riesgos Psicosociales - NOM-035', 10, 15)
    pdf.setFontSize(12)
    pdf.text(
      `Centro: ${selectedCenterId ? centers.find((c) => c.id === selectedCenterId)?.name || 'Desconocido' : 'Todos'}`,
      10,
      25
    )
    pdf.text(`Emitido por: ${psychologistName} - Cédula: ${psychologistCedula}`, 10, 35)
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 10, 45)

    pdf.addImage(imgData, 'PNG', 10, 55, imgWidth, imgHeight)

    pdf.setFontSize(10)
    pdf.text(
      'Informe preliminar generado automáticamente. No sustituye evaluación profesional certificada.',
      10,
      pdf.internal.pageSize.height - 20
    )

    pdf.save('Informe_NOM035_Psyqus.pdf')
  }

  if (loading) return <div className="p-8 text-center text-gray-600">Cargando resultados...</div>

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Resultados NOM-035 - Psyqus</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <label className="block text-gray-700 font-bold mb-2">Seleccionar Centro de Trabajo:</label>
        <select
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCenterId || ''}
          onChange={(e) => setSelectedCenterId(e.target.value || null)}
        >
          <option value="">Todos los centros</option>
          {centers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (ID: {c.id})
            </option>
          ))}
        </select>
      </div>

      <div ref={reportRef} className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Análisis de Factores de Riesgo Psicosocial
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium">
            Puntaje Global Promedio: {totalScore.toFixed(2)}
          </h3>
          <p className="text-gray-600">
            Nivel general: {domainData.some((d) => d.avg >= 3) ? 'Requiere intervención' : 'Bajo riesgo'}
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={domainData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="domain" />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg" fill="#3b82f6" name="Promedio" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dominio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domainData.map((d, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {d.domain.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.avg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.nivel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-medium mb-4">Datos del Profesional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre de la Psicóloga"
            value={psychologistName}
            onChange={(e) => setPsychologistName(e.target.value)}
          />
          <input
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cédula Profesional"
            value={psychologistCedula}
            onChange={(e) => setPsychologistCedula(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow transition"
      >
        Descargar Informe PDF / Certificado
      </button>
    </div>
  )
}