import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializamos Supabase dentro de la API para asegurar conexión del lado del servidor
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respuestas, usuario_id, empresa_id } = body;

        // 1. Cálculo de puntaje
        const puntajeTotal = Object.values(respuestas).reduce(
            (acc: number, val: any) => acc + (Number(val) || 0), 
            0
        ) as number;

        // 2. Clasificación NOM-035
        let nivel = "Nulo";
        let color = "#22c55e";

        if (puntajeTotal >= 50 && puntajeTotal < 75) { nivel = "Bajo"; color = "#84cc16"; }
        else if (puntajeTotal >= 75 && puntajeTotal < 99) { nivel = "Medio"; color = "#eab308"; }
        else if (puntajeTotal >= 99 && puntajeTotal < 140) { nivel = "Alto"; color = "#f97316"; }
        else if (puntajeTotal >= 140) { nivel = "Muy Alto"; color = "#ef4444"; }

        // 3. GUARDADO REAL EN SUPABASE
        // Mapeamos los campos de 'respuestas' a las columnas de tu tabla
        const { error } = await supabase
            .from('resultados_encuesta') // Asegúrate que tu tabla se llame así
            .insert([{
                atencion: respuestas.atencion || 0,
                resiliencia: respuestas.resiliencia || 0,
                empatia: respuestas.empatia || 0,
                liderazgo: respuestas.liderazgo || 0,
                enfoque: respuestas.enfoque || 0,
                balance: respuestas.balance || 0,
                puntaje_total: puntajeTotal,
                nivel_riesgo: nivel,
                color_alerta: color,
                empresa_id: empresa_id || 'default'
            }]);

        if (error) throw error;

        return NextResponse.json({ 
            success: true, 
            puntajeTotal, 
            nivel, 
            color,
            mensaje: "Protocolo NOM-035 ejecutado y guardado con éxito." 
        });

    } catch (error: any) {
        console.error("Error en Motor Psyqus:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}