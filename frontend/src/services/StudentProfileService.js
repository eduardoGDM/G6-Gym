import { sanctumRequest } from "../sanctumRequest";

const studentProfileService = {
  async get() {
    const { data } = await sanctumRequest("get", "/student/profile");
    return data;
  },

  async getPhysicalAssessments() {
    const { data } = await sanctumRequest("get", "/student/physical-assessments");
    return data.data;
  },
};

export default studentProfileService;
