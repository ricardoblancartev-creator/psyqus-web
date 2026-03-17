"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function modelobpss() {

 const [active,setActive] = useState<string|null>(null);

 const data:any = {

  bio:{
   title:"Biológico",
   text:"Cuerpo, energía, sueño y nutrición."
  },

  psico:{
   title:"Psicológico",
   text:"Pensamientos, emociones y resiliencia."
  },

  social:{
   title:"Social",
   text:"Relaciones, apoyo y cultura laboral."
  },

  espiritual:{
   title:"Espiritual",
   text:"Sentido de vida, valores y propósito."
  }

 };

 return(

  <div className="flex flex-col items-center gap-10 mt-20">

   <h2 className="text-2xl text-cyan-500">
    Modelo Bio-Psico-Social-Espiritual
   </h2>

   <div className="relative w-80 h-80">

    <motion.div
     whileHover={{scale:1.2}}
     onClick={()=>setActive("bio")}
     className="absolute left-0 top-32 w-16 h-16 bg-green-500 rounded-full cursor-pointer"
    />

    <motion.div
     whileHover={{scale:1.2}}
     onClick={()=>setActive("psico")}
     className="absolute left-32 bottom-0 w-16 h-16 bg-purple-500 rounded-full cursor-pointer"
    />

    <motion.div
     whileHover={{scale:1.2}}
     onClick={()=>setActive("social")}
     className="absolute right-0 top-32 w-16 h-16 bg-blue-500 rounded-full cursor-pointer"
    />

    <motion.div
     whileHover={{scale:1.2}}
     onClick={()=>setActive("espiritual")}
     className="absolute left-32 top-0 w-16 h-16 bg-yellow-400 rounded-full cursor-pointer"
    />

   </div>

   {active && (

    <motion.div
     initial={{opacity:0}}
     animate={{opacity:1}}
     className="bg-slate-900 p-6 rounded-xl border border-cyan-500 max-w-md"
    >

     <h3 className="text-xl text-cyan-400">
      {data[active].title}
     </h3>

     <p className="text-slate-300 mt-3">
      {data[active].text}
     </p>

    </motion.div>

   )}

  </div>

 );
}