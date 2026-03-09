export async function predictStock(company) {

  const token = localStorage.getItem("token");
  console.log("Token sent in predictStock:", token);

  // Use relative API path for production (EC2 + Nginx)
  const API_URL = process.env.REACT_APP_API_URL || "";

  const response = await fetch(`${API_URL}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ company }),
  });

  if (response.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }

  return response.json();
}