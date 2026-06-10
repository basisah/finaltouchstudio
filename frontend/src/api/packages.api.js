import { get, post, put, del } from "./client";

export const getPackages = () => get("/packages");
export const getPackage = (id) => get(`/packages/${id}`);
export const createPackage = (data) => post("/packages", data);
export const updatePackage = (id, data) => put(`/packages/${id}`, data);
export const deletePackage = (id) => del(`/packages/${id}`);
export const getItems = () => get("/items");
