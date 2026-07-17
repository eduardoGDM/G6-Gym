import { sanctumRequest } from "../sanctumRequest";

const muscleGroupsService = {
  async getAll() {
    const { data } = await sanctumRequest("get", "/trainer/muscle-groups");
    return data;
  },
};

export default muscleGroupsService;
