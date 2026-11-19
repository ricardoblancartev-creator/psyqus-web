import { notFound } from "next/navigation";
import ResultadosNom035 from "../ResultadosNom035";
import { obtenerEmpresaNom035 } from "@/lib/nom035-empresas";

/*
  Resultados NOM-035 de una sola empresa:
  /nom035-resultados/pocs y /nom035-resultados/3p.
  El layout padre ya exige rol admin o psicologo.
*/
export default async function ResultadosEmpresaPage({
  params,
}: {
  params: Promise<{ empresa: string }>;
}) {
  const { empresa: id } = await params;
  const empresa = obtenerEmpresaNom035(id);

  if (!empresa) {
    notFound();
  }

  return <ResultadosNom035 empresa={empresa} />;
}
