import { useMemo } from "react";

import useAuthStore from "../store/authStore";

/**
 * Contexto das telas de montagem de treino (Workouts/Index, NewEdit, Show).
 *
 * As mesmas telas atendem o personal e o aluno autorizado a gerenciar os
 * próprios treinos; o que muda é a API usada (`scope`) e as rotas de navegação.
 *
 * Não há mais distinção por autor: a autogestão é completa, então o aluno
 * altera também os treinos montados pelo personal. O recorte de acesso é só o
 * perfil — a API do aluno nunca devolve treino de outro aluno.
 */
export function useWorkoutScope() {
  const isStudent = useAuthStore((state) => state.user?.role) === "student";

  return useMemo(
    () => ({
      scope: isStudent ? "student" : "trainer",
      isStudent,
      basePath: isStudent ? "/student/manage-workouts" : "/trainer/workouts",
    }),
    [isStudent],
  );
}
