import { sanctumRequest } from "../sanctumRequest";

const adminPlansService = {
  async list() {
    const { data } = await sanctumRequest("get", "/admin/plans");
    return data.data;
  },

  async assign(trainerId, { planCode, endsAt = null, notes = null }) {
    const { data } = await sanctumRequest(
      "put",
      `/admin/trainers/${trainerId}/subscription`,
      {
        plan_code: planCode,
        ends_at: endsAt || null,
        notes: notes || null,
      },
    );
    return data;
  },

  async remove(trainerId) {
    const { data } = await sanctumRequest(
      "delete",
      `/admin/trainers/${trainerId}/subscription`,
    );
    return data;
  },

  async history(trainerId) {
    const { data } = await sanctumRequest(
      "get",
      `/admin/trainers/${trainerId}/subscriptions`,
    );
    return data;
  },
};

export default adminPlansService;
