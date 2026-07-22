import { sanctumRequest } from "../sanctumRequest";

const exerciseHistoryService = {
  async history(exerciseId) {
    const { data } = await sanctumRequest(
      "get",
      `/student/exercises/${exerciseId}/history`,
    );
    return data;
  },
};

export default exerciseHistoryService;
