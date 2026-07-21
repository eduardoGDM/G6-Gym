import { sanctumRequest } from "../sanctumRequest";

const trainerDashboardService = {
  async summary() {
    const { data } = await sanctumRequest("get", "/trainer/dashboard/summary");
    return data;
  },

  async recentWorkoutCheckins() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/dashboard/recent-workout-checkins",
    );
    return data;
  },

  async recentDailyCheckins() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/dashboard/recent-daily-checkins",
    );
    return data;
  },

  async pendingDailyCheckins() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/dashboard/pending-daily-checkins",
    );
    return data;
  },
};

export default trainerDashboardService;
