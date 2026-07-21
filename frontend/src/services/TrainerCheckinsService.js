import { sanctumRequest } from "../sanctumRequest";

const trainerCheckinsService = {
  async search({
    page = 1,
    perPage = 10,
    studentProfileId = "",
    date = "",
  } = {}) {
    const { data } = await sanctumRequest(
      "get",
      "/trainer/checkins",
      {},
      {
        params: {
          page,
          per_page: perPage,
          student_profile_id: studentProfileId || undefined,
          date: date || undefined,
        },
      },
    );
    return data;
  },

  async getStudents() {
    const { data } = await sanctumRequest("get", "/trainer/checkins/students");
    return data;
  },

  async getById(id) {
    const { data } = await sanctumRequest("get", `/trainer/checkins/${id}`);
    return data.data;
  },
};

export default trainerCheckinsService;
