import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

let securitySessionPromise = null;

export async function initializeApiProtection() {
  if (!securitySessionPromise) {
    securitySessionPromise = api.get("/csrf/").catch((error) => {
      securitySessionPromise = null;
      throw error;
    });
  }

  await securitySessionPromise;
}

export async function detectScam(text) {
  await initializeApiProtection();
  const response = await api.post("/detect/", { text });
  return response.data;
}

async function postProtected(path, payload) {
  await initializeApiProtection();
  const response = await api.post(path, payload);
  return response.data;
}

export async function scanMessage(text) {
  return postProtected("/message-scan/", { text });
}

export async function scanCall(payload) {
  return postProtected("/call-scan/", payload);
}

export async function scanUrl(payload) {
  return postProtected("/url-scan/", payload);
}

export async function scanEcommerce(payload) {
  return postProtected("/ecommerce-scan/", payload);
}

export async function getPlatformOverview() {
  const response = await api.get("/platform-overview/");
  return response.data;
}

export function extractApiError(requestError) {
  return (
    requestError.response?.data?.detail ||
    requestError.response?.data?.non_field_errors?.[0] ||
    requestError.response?.data?.text?.[0] ||
    requestError.response?.data?.url?.[0] ||
    "SecureX could not reach the detection API. Check that Django is running."
  );
}

export default api;
