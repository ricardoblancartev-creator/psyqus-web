import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Psyqus</h1>
      <p className="text-lg mb-8 text-gray-600">
        Tu plataforma de psicología profesional
      </p>
      <div className="flex gap-4">
        <Link href="/sign-in" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Iniciar sesión
        </Link>
        <Link href="/sign-up" className="px-6 py-3 bg-green-600 text-white rounded-lg">
          Registrarse
        </Link>
      </div>
    </main>
  );
}