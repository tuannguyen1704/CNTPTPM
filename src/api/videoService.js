import apiClient from "./apiClient";

// lấy danh sách video type
export const getVideoTypes = async () => {
  try {
    const response = await apiClient.get("/sidebar");
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// lấy danh sách video
export const getVideos = async () => {
  try {
    const listVideos = await apiClient.get("/videos/list-video");
    return listVideos.data;
  } catch (error) {
    throw error;
  }
};
