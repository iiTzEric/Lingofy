import axios from "axios";

const apiHost = typeof window === "undefined" ? "localhost" : window.location.hostname;

export const axiosInstance = axios.create({
    baseURL: `http://${apiHost}:3000/api`,
    withCredentials: true // send cookies with request
})