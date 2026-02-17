'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG } from 'qrcode.react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [qrValor, setQrValor] = useState('')

  const guardarActivo = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('activos')
      .insert([{ nombre, descripcion }])
      .select()

    if (error) {
      alert("Error: " + error.message)
    } else if (data && data[0]) {
      setQrValor(data[0].id)
      alert("¡Registro exitoso!")
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Registro de Activos - NOM-035</h1>
      <form onSubmit={guardarActivo}>
        <input 
          placeholder="Nombre del activo" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', maxWidth: '300px' }}
        />
        <textarea 
          placeholder="Descripción" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', maxWidth: '300px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Guardar y Generar QR
        </button>
      </form>

      {qrValor && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', display: 'inline-block' }}>
          <h3>Código QR Generado:</h3>
          <QRCodeSVG value={qrValor} size={256} />
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>ID: {qrValor}</p>
        </div>
      )}
    </div>
  )
}