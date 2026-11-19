/*
  Empresas evaluadas con NOM-035.

  La tabla nom035_evaluaciones no tiene columna de empresa.
  Mientras no exista, la empresa se deduce del user_id:
  - Los registros de 3P se capturaron manualmente con
    user_id "3p_<nombre>" (no son usuarios de Clerk).
  - Todo lo demás (user_id de Clerk "user_...") es de la
    Cooperativa POC's, evaluada en agosto de 2026.

  Para agregar otra empresa capturada a mano: darle un
  prefijo propio de user_id y registrarla aquí.
*/

export type EmpresaNom035 = {
  id: string;
  nombre: string;
  descripcion: string;
  prefijoUserId?: string;
};

export const EMPRESAS_NOM035: EmpresaNom035[] = [
  {
    id: "pocs",
    nombre: "Cooperativa POC's",
    descripcion: "Cuestionarios I y II · agosto 2026",
  },
  {
    id: "3p",
    nombre: "3P",
    descripcion: "Cuestionario I · noviembre 2026",
    prefijoUserId: "3p_",
  },
];

export const EMPRESA_NOM035_POR_DEFECTO = "pocs";

export function obtenerEmpresaNom035(id?: string | null) {
  return EMPRESAS_NOM035.find(
    (empresa) => empresa.id === String(id || "").toLowerCase()
  );
}

export function empresaDeEvaluacion(userId?: string | null) {
  const valor = String(userId || "");

  const empresa = EMPRESAS_NOM035.find(
    (e) => e.prefijoUserId && valor.startsWith(e.prefijoUserId)
  );

  return empresa?.id || EMPRESA_NOM035_POR_DEFECTO;
}
