import { auth } from "@clerk/nextjs/server";
export async function GET() { 
  let authResult;
  try {
    // CAMBIO AQUÍ: Agrega 'await' antes de auth()
    const { userId } = await auth(); 
    
    authResult = { success: true, userId: userId || null };
  } catch (authError) {
    authResult = { success: false, error: "Error en auth" };
  }
  
  // ... resto del código
}