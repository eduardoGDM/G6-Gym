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

  async weeklyEvolution() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/dashboard/weekly-evolution",
    );
    return data;
  },

  async activeStudents() {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/dashboard/active-students",
    );
    return data;
  },
};

export default trainerDashboardService;
