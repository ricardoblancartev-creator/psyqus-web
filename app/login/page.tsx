'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [message,setMessage] = useState('')

  const router = useRouter()


  const acceder = async (e:React.FormEvent)=>{

    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password

    })

    if(error){

      setMessage("Error: "+error.message)

    }

    else{

      router.push('/dashboard')

    }

  }



  return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-10 rounded-xl shadow-lg w-96">

<h1 className="text-2xl font-bold mb-5">

PSYQUS

</h1>


<form onSubmit={acceder}>

<input

type="email"

placeholder="Correo"

className="border p-3 w-full mb-3"

onChange={(e)=>setEmail(e.target.value)}

/>


<input

type="password"

placeholder="Contraseña"

className="border p-3 w-full mb-3"

onChange={(e)=>setPassword(e.target.value)}

/>


<button

className="bg-black text-white p-3 w-full"

>

Entrar

</button>


</form>


<p>

{message}

</p>



</div>

</div>

)

}