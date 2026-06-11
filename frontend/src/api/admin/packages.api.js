import { post, put, del } from "../client";

/** Create package bundle */
export const createPackage = (data) => post("/packages", data);

/** Update package details & contents */
export const updatePackage = (id, data) => put(`/packages/${id}`, data);

/** Delete package bundle */
export const deletePackage = (id) => del(`/packages/${id}`);
