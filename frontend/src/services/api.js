import axios from "axios";

const api = axios.create({
  baseURL: "https://mailflow-gh75.onrender.com",
  withCredentials: true,
});

export default api;