import { sanctumRequest } from "../sanctumRequest";

const achievementsService = {
  // Conquistas obtidas em um check-in (recordes pessoais, etc.). Consultado
  // depois que o check-in já foi salvo, para exibir a tela de celebração.
  async forCheckin(checkinId) {
    const { data } = await sanctumRequest(
      "get",
      `/student/checkins/${checkinId}/achievements`,
    );
    return data.data;
  },
};

export default achievementsService;
