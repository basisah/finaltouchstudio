import { post, put, del } from "../client";
import { compressImage } from "../../utils/imageCompressor";

/** Create new item */
export const createItem = (data) => post("/items", data);

/** Update existing item */
export const updateItem = (id, data) => put(`/items/${id}`, data);

/** Delete item */
export const deleteItem = (id) => del(`/items/${id}`);

/** Upload item display photo */
export const uploadItemImage = async (file) => {
  const compressedFile = await compressImage(file);
  const token = localStorage.getItem("admin_token");
  const fd = new FormData();
  fd.append("image", compressedFile);
  
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.path; // returns server path to image
};
