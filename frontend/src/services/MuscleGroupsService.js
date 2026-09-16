import { sanctumRequest } from "../sanctumRequest";

const muscleGroupsService = {
  async getAll(scope = "trainer") {
    const { data } = await sanctumRequest("get", `/${scope}/muscle-groups`);
    return data;
  },
};

export default muscleGroupsService;
