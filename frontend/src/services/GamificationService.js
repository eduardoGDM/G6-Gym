import { sanctumRequest } from "../sanctumRequest";

const gamificationService = {
  async summary() {
    const { data } = await sanctumRequest(
      "get",
      "/student/gamification/summary",
    );
    return data;
  },
};

export default gamificationService;
