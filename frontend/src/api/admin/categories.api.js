import { post, put, del } from "../client";
import { compressImage } from "../../utils/imageCompressor";

/** Create new event category */
export const createCategory = (data) => post("/categories", data);

/** Update existing category */
export const updateCategory = (id, data) => put(`/categories/${id}`, data);

/** Delete category */
export const deleteCategory = (id) => del(`/categories/${id}`);

/** Upload category cover image */
export const uploadCategoryImage = async (file) => {
  const compressedFile = await compressImage(file);
  const token = localStorage.getItem("admin_token");
  const fd = new FormData();
  fd.append("image", compressedFile);
  
  const res = await fetch("/api/categories/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.url;
};
