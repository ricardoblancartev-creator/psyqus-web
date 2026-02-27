const enviarEncuesta = async () => {

let total = 0

Object.values(respuestas).forEach((valor:any)=>{
total += Number(valor)
})

let nivel = "Bajo"

if(total > 10) nivel = "Moderado"
if(total > 18) nivel = "Alto"

const { error } = await supabase
.from('respuestas')
.insert({

total: total,

nivel: nivel

})

if(error){

alert("Error")

}else{

alert("Encuesta enviada")

}
}