import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respuestas, usuario_id, empresa_id } = body;

        // 1. Calculamos el puntaje total forzando tipos numéricos para evitar errores de TS
        const puntajeTotal = Object.values(respuestas).reduce(
            (acc: number, val: any) => acc + (Number(val) || 0), 
            0
        ) as number;

        // 2. Clasificación oficial NOM-035 (Mapeo de Riesgo)
        let nivel = "Nulo";
        let color = "#22c55e"; // Verde (Default)

        if (puntajeTotal >= 50 && puntajeTotal < 75) {
            nivel = "Bajo";
            color = "#84cc16"; 
        } else if (puntajeTotal >= 75 && puntajeTotal < 99) {
            nivel = "Medio";
            color = "#eab308"; // Amarillo
        } else if (puntajeTotal >= 99 && puntajeTotal < 140) {
            nivel = "Alto";
            color = "#f97316"; // Naranja
        } else if (puntajeTotal >= 140) {
            nivel = "Muy Alto";
            color = "#ef4444"; // Rojo
        }

        // 3. Simulación de guardado (Aquí conectarías tu Supabase.from('resultados').insert(...))
        console.log(`📊 Procesado: ${usuario_id} de ${empresa_id} -> ${puntajeTotal} pts (${nivel})`);

        return NextResponse.json({ 
            success: true, 
            puntajeTotal, 
            nivel, 
            color,
            mensaje: "Evaluación procesada correctamente por el motor Psyqus." 
        });

    } catch (error) {
        console.error("Error en API Send:", error);
        return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
    }
}