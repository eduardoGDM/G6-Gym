import { sanctumRequest } from "../sanctumRequest";

const studentAnamnesisService = {
  async get(studentId) {
    const { data } = await sanctumRequest(
      "get",
      `/trainer/students/${studentId}/anamnesis`,
    );
    return data;
  },

  async update(studentId, payload) {
    const { data } = await sanctumRequest(
      "put",
      `/trainer/students/${studentId}/anamnesis`,
      payload,
    );
    return data;
  },

  async addPhoto(studentId, file) {
    const formData = new FormData();
    formData.append("photo", file);

    const { data } = await sanctumRequest(
      "post",
      `/trainer/students/${studentId}/anamnesis/photos`,
      formData,
    );
    return data;
  },

  async removePhoto(studentId, photoId) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/students/${studentId}/anamnesis/photos/${photoId}`,
    );
    return data;
  },

  async addVideo(studentId, file) {
    const formData = new FormData();
    formData.append("video", file);

    const { data } = await sanctumRequest(
      "post",
      `/trainer/students/${studentId}/anamnesis/videos`,
      formData,
    );
    return data;
  },

  async removeVideo(studentId, videoId) {
    const { data } = await sanctumRequest(
      "delete",
      `/trainer/students/${studentId}/anamnesis/videos/${videoId}`,
    );
    return data;
  },
};

export default studentAnamnesisService;
