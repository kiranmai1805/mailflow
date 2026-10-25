import axios from "axios";

const API_URL = "https://mailflow-gh75.onrender.com";


export const getContacts = async () => {
  const response = await axios.get(`${API_URL}/contacts/`);
  return response.data;
};

export const previewContacts = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/contacts/preview`,
    formData
  );

  return response.data;
};

export const importContacts = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/contacts/import`,
    formData
  );

  return response.data;
};