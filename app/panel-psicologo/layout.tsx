import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PanelPsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.privateMetadata?.role;

  const isProfessional =
    role === "admin" || role === "psicologo";

  if (!isProfessional) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
