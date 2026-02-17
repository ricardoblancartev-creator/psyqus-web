'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG } from 'qrcode.react' // Importamos el generador

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [qrValor, setQrValor] = useState('') // Aquí guardaremos el ID para el QR

  const guardarActivo = async (e: any) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('activos') 
      .insert([{ nombre, descripcion }])
      .select()

    if (error) {
        alert("Error: " + error.message)
    } else {
        // Guardamos el ID que nos dio Supabase para generar el QR
        setQrValor(data[0].id) 
        alert("¡Registro exitoso!")
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Oficina Psyqus: Generador QR</h1>
      
      <form onSubmit={guardarActivo} className="bg-white p-6 rounded-lg shadow-md w-full mb-8">
        <input 
          placeholder="Nombre del activo..."
          className="block w-full border p-2 mb-4 text-black rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <textarea 
          placeholder="Descripción o manual..."
          className="block w-full border p-2 mb-4 text-black rounded"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button className="bg-blue-600 text-white font-bold py-2 w-full rounded hover:bg-blue-700">
          CREAR QR
        </button>
      </form>

      {/* AQUÍ APARECERÁ EL QR CUANDO SE GENERE EL ID */}
      {qrValor && (
        <div className="bg-white p-6 rounded-lg shadow-xl text-center flex flex-col items-center border-2 border-blue-500">
          <h2 className="text-xl font-bold mb-4 text-black">¡QR LISTO PARA LA MÁQUINA!</h2>
          <QRCodeSVG value={`https://psyqus.com/scan/${qrValor}`} size={200} />
          <p className="mt-4 text-sm text-gray-500 font-mono">ID: {qrValor}</p>
          <button 
            onClick={() => window.print()} 
            className="mt-4 text-blue-600 underline"
          >
            Imprimir o Guardar
          </button>
        </div>
      )}
    </div>
  )
}
