import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

export async function detectScam(text) {
  const response = await api.post("/detect/", { text });
  return response.data;
}

export default api;
