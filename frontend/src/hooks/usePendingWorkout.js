import { useQuery } from "@tanstack/react-query";

import workoutCheckinsService from "../services/WorkoutCheckinsService";

export const PENDING_WORKOUT_QUERY_KEY = ["student-pending-workout"];

/**
 * Treino iniciado e não finalizado pelo aluno (hoje ou ontem), ou null.
 *
 * Consumido em dois lugares que precisam da mesma resposta: a modal de retomada
 * montada no StudentLayout e o destaque do card em "Meus treinos". A chave
 * compartilhada faz o react-query servir os dois com uma única requisição —
 * depois de finalizar o treino, a tela de check-in invalida esta chave.
 */
export function usePendingWorkout(options = {}) {
  return useQuery({
    queryKey: PENDING_WORKOUT_QUERY_KEY,
    queryFn: () => workoutCheckinsService.pending(),
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
}
