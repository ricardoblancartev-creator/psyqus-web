'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {

const [promedio,setPromedio]=useState("Cargando...")
const [nivel,setNivel]=useState("")
const [frase,setFrase]=useState("")

useEffect(()=>{

cargarDatos()
fraseAleatoria()

},[])



const cargarDatos=async()=>{

const {data,error}=await supabase
.from('respuestas')
.select('*')

if(error){

setPromedio("Error")
return

}

if(!data || data.length===0){

setPromedio("Sin datos")
return

}

let total=0
let cantidad=0

data.forEach(r=>{

total+=r.estres
total+=r.carga
total+=r.liderazgo
total+=r.ambiente

cantidad+=4

})


const promedioTotal=total/cantidad


if(promedioTotal<=2){

setNivel("🟢 Estrés Bajo")

}
else if(promedioTotal<=3.5){

setNivel("🟡 Estrés Medio")

}
else{

setNivel("🔴 Estrés Alto")

}

setPromedio(promedioTotal.toFixed(2))

}




const fraseAleatoria=()=>{

const frases=[

"Tu bienestar importa",

"Trabajar sano es trabajar mejor",

"Pequeños cambios crean grandes mejoras",

"La salud mental también es productividad",

"Un buen ambiente crea grandes resultados",

"Respirar también es trabajar",

"El descanso es parte del éxito"

]

const random=Math.floor(Math.random()*frases.length)

setFrase(frases[random])

}



return(


<div className="min-h-screen bg-slate-100 p-10">


<div className="max-w-5xl mx-auto">


<h1 className="text-4xl font-bold text-blue-900 mb-2">

PSYQUS

</h1>

<p className="mb-10 text-gray-600">

Plataforma NOM-035 Inteligente

</p>



<div className="grid md:grid-cols-2 gap-6">



<div className="bg-white p-8 rounded-xl shadow">


<h2 className="text-2xl mb-5">

Encuesta semanal

</h2>


<Link href="/dashboard/encuesta">


<button className="bg-blue-600 text-white px-8 py-4 rounded-lg w-full text-lg">

Contestar encuesta semanal

</button>


</Link>


</div>





<div className="bg-white p-8 rounded-xl shadow">


<h2 className="text-2xl mb-5">

Estrésómetro Psyqus

</h2>


<div className="text-3xl mb-3">

{nivel}

</div>


<p className="text-lg">

Promedio:

{promedio}

</p>


</div>






<div className="bg-white p-8 rounded-xl shadow">


<h2 className="text-2xl mb-5">

Frase motivacional

</h2>


<p className="text-xl italic">

{frase}

</p>


</div>






<div className="bg-white p-8 rounded-xl shadow">


<h2 className="text-2xl mb-5">

Consejos saludables

</h2>


<ul className="space-y-2 text-lg">


<li>

✔ Toma pausas activas

</li>


<li>

✔ Respira profundo 2 minutos

</li>


<li>

✔ Organiza tareas importantes primero

</li>


<li>

✔ Habla con tu equipo

</li>


<li>

✔ Evita sobrecarga laboral

</li>


</ul>


</div>




</div>



</div>



</div>



)

}