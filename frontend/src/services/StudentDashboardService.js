import { sanctumRequest } from "../sanctumRequest";

const studentDashboardService = {
  async summary() {
    const { data } = await sanctumRequest("get", "/student/dashboard/summary");
    return data;
  },

  async recentWorkouts() {
    const { data } = await sanctumRequest(
      "get",
      "/student/dashboard/recent-workouts",
    );
    return data;
  },

  async evolution() {
    const { data } = await sanctumRequest("get", "/student/dashboard/evolution");
    return data;
  },
};

export default studentDashboardService;
