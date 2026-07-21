import { sanctumRequest } from "../sanctumRequest";

const adminDashboardService = {
  async summary() {
    const { data } = await sanctumRequest("get", "/admin/dashboard/summary");
    return data;
  },
};

export default adminDashboardService;
