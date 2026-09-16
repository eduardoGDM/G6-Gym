import { useMemo } from "react";

import useAuthStore from "../store/authStore";

/**
 * Contexto das telas de montagem de treino (Workouts/Index, NewEdit, Show).
 *
 * As mesmas telas atendem o personal e o aluno autorizado a gerenciar os
 * próprios treinos; o que muda é a API usada (`scope`), as rotas de navegação
 * e o que o aluno pode alterar (apenas treinos criados por ele).
 */
export function useWorkoutScope() {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.role === "student";

  return useMemo(
    () => ({
      scope: isStudent ? "student" : "trainer",
      isStudent,
      basePath: isStudent ? "/student/manage-workouts" : "/trainer/workouts",
      canModify: (workout) =>
        !isStudent || Number(workout?.created_by) === Number(user?.id),
    }),
    [isStudent, user?.id],
  );
}
