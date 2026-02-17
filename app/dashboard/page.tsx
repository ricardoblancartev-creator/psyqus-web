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

  const guardarActivo = async (e: any) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('activos')
      .insert([{ nombre, descripcion }])
      .select()

    if (error) {
      alert("Error: " + error.message)
    } else {
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
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <textarea 
          placeholder="Descripción" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <button type="submit">Guardar y Generar QR</button>
      </form>

      {qrValor && (
        <div style={{ marginTop: '20px' }}>
          <h3>Código QR Generado:</h3>
          <QRCodeSVG value={qrValor} size={256} />
          <p>ID: {qrValor}</p>
        </div>
      )}
    </div>
  )
}