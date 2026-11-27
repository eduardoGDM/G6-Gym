import { sanctumRequest } from "../sanctumRequest";

const exerciseHistoryService = {
  // excludeCheckinId: id do check-in em edição, removido do histórico para que o
  // registro atual (já gravado pelo autosave) nunca apareça nem ocupe uma das
  // vagas das execuções anteriores.
  // page/perPage: o modo log da ExerciseHistoryModal pagina as sessões. Omitidos,
  // o backend devolve as 2 execuções mais recentes — o que a dica "Última vez"
  // na série precisa.
  async history(exerciseId, { excludeCheckinId, page, perPage } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/student/exercises/${exerciseId}/history`,
      {},
      {
        params: {
          exclude_checkin_id: excludeCheckinId || undefined,
          page: page || undefined,
          per_page: perPage || undefined,
        },
      },
    );
    return data;
  },
};

export default exerciseHistoryService;
