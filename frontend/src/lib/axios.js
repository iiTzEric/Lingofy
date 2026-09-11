import axios from "axios";

const apiHost = typeof window === "undefined" ? "localhost" : window.location.hostname;
const apiBaseUrl = import.meta.env.VITE_API_URL ||
    (typeof window === "undefined" ? "/api" : `${window.location.protocol}//${apiHost}:3000/api`);

export const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true // send cookies with request
})