const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const makeHeaders = (role: string, userName: string, withBody = false) => ({
  ...(withBody && { "Content-Type": "application/json" }),
  role,
  username: userName,
});

export const api = {
  getDocuments: async () => {
    const res = await fetch(`${BASE_URL}/api/documents`);
    return res.json();
  },

  getDocument: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/documents/${id}`);
    return res.json();
  },

  createDocument: async (data: object, role: string, userName: string) => {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      method: "POST",
      headers: makeHeaders(role, userName, true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  addVersion: async (
    id: string,
    data: object,
    role: string,
    userName: string,
  ) => {
    const res = await fetch(`${BASE_URL}/api/documents/${id}/versions`, {
      method: "POST",
      headers: makeHeaders(role, userName, true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  finalizeDocument: async (
    id: string,
    data: object,
    role: string,
    userName: string,
  ) => {
    const res = await fetch(`${BASE_URL}/api/${id}/finalize`, {
      method: "PATCH",
      headers: makeHeaders(role, userName, true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  downloadDocument: async (id: string, role: string, userName: string) => {
    const res = await fetch(`${BASE_URL}/api/${id}/download`, {
      headers: makeHeaders(role, userName),
    });
    return res.json();
  },
};
