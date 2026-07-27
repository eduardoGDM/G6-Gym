import { sanctumRequest } from "../sanctumRequest";

const exerciseHistoryService = {
  // excludeCheckinId: id do check-in em edição, removido do histórico para que o
  // registro atual (já gravado pelo autosave) nunca apareça nem ocupe uma das
  // vagas das execuções anteriores.
  async history(exerciseId, { excludeCheckinId } = {}) {
    const { data } = await sanctumRequest(
      "get",
      `/student/exercises/${exerciseId}/history`,
      {},
      { params: { exclude_checkin_id: excludeCheckinId || undefined } },
    );
    return data;
  },
};

export default exerciseHistoryService;
