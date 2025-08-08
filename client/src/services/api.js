export async function predictStock(company) {
  const token = localStorage.getItem('token');
  console.log("Token sent in predictStock:", token);

  const response = await fetch('http://localhost:5001/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ company }),
  });

  if (response.status === 401) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
    return null;
  }

  return response.json();
}