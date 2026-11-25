import axios from "axios"

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
})

export const getErrorMessage = (err) =>
    err.response?.data?.message || "Something went wrong. Please try again."
