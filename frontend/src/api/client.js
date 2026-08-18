const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Response was not JSON
    }

    throw new Error(errorMessage);
  }

  // Some endpoints may return an empty response
  if (response.status === 204) {
    return null;
  }

  return response.json();
}


// GET
export async function get(endpoint) {
  return request(endpoint, {
    method: "GET",
  });
}


// POST
export async function post(endpoint, body = {}) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}


// PUT
export async function put(endpoint, body = {}) {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}


// PATCH
export async function patch(endpoint, body = {}) {
  return request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}


// DELETE
export async function remove(endpoint) {
  return request(endpoint, {
    method: "DELETE",
  });
}