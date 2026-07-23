import { sanctumRequest } from "../sanctumRequest";

const physicalAssessmentsService = {
  async list(studentId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/physical-assessments`,
    );
    return data.data;
  },

  async create(studentId, payload) {
    const { data } = await sanctumRequest(
      "post",
      `/trainer/students/${studentId}/physical-assessments`,
      payload,
    );
    return data;
  },

  async update(studentId, assessmentId, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/trainer/students/${studentId}/physical-assessments/${assessmentId}`,
      payload,
    );
    return data;
  },

  async remove(studentId, assessmentId) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/students/${studentId}/physical-assessments/${assessmentId}`,
    );
    return data;
  },
};

export default physicalAssessmentsService;
