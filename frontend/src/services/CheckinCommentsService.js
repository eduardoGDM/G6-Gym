import { sanctumRequest } from "../sanctumRequest";

/**
 * Comentários do personal nos check-ins (diário e de treino). Só o personal
 * escreve/edita/remove; o aluno apenas lê (os comentários vêm embutidos no
 * próprio check-in).
 */
const checkinCommentsService = {
  async addToDailyCheckin(checkinId, body) {
    const { data } = await sanctumRequest(
      "post",
      `/trainer/daily-checkins/${checkinId}/comments`,
      { body },
    );
    return data.data;
  },

  async addToWorkoutCheckin(checkinId, body) {
    const { data } = await sanctumRequest(
      "post",
      `/trainer/checkins/${checkinId}/comments`,
      { body },
    );
    return data.data;
  },

  async update(commentId, body) {
    const { data } = await sanctumRequest(
      "patch",
      `/trainer/checkin-comments/${commentId}`,
      { body },
    );
    return data.data;
  },

  async remove(commentId) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/checkin-comments/${commentId}`,
    );
    return data;
  },
};

export default checkinCommentsService;
