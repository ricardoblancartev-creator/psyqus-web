import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.firstName || "Usuario"}</p>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
      <Link href="/api/auth/sign-out" style={{ color: "red" }}>
        Cerrar sesión
      </Link>
      <hr />
      <h2>Secciones:</h2>
      <ul>
        <li><Link href="/encuesta">Evaluación NOM-035</Link></li>
        <li><Link href="/ia">Asistente IA</Link></li>
        <li><Link href="/psicoeducacion">Psicoeducación</Link></li>
        <li><Link href="/buzon">Buzón de Paz</Link></li>
      </ul>
    </div>
  );
}