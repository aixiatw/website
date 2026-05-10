export default async function handler(event) {
  const path = event.path || event.url || '';
  console.log('Identity gateway called:', path, event.httpMethod);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      path,
      method: event.httpMethod,
      headers: Object.keys(event.headers || {}),
      msg: 'Identity gateway is running'
    })
  };
}