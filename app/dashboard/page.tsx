import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Bienvenido {user?.firstName}
      </h1>

      <p className="mt-4 text-gray-500">
        Este es tu dashboard de Psyqus 🧠
      </p>
    </div>
  );
}