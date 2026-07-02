import api from "../api/axios";

const workoutsService = {
  async getMyWorkouts() {
    const { data } = await api.get("/student/my-workouts");
    return data;
  },

  async getWorkout(id) {
    const { data } = await api.get(`/student/workout/${id}`);
    return data;
  },
};

export default workoutsService;
