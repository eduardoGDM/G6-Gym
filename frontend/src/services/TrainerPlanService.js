import { sanctumRequest } from "../sanctumRequest";

const trainerPlanService = {
  async get() {
    const { data } = await sanctumRequest("get", "/trainer/plan");
    return data;
  },

  async listPlans() {
    const { data } = await sanctumRequest("get", "/trainer/plans");
    return data;
  },
};

export default trainerPlanService;
