export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, method } = url;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (pathname === '/api/auth') {
      return handleOAuthInit(request, env);
    }

    if (pathname === '/api/auth/callback') {
      return handleOAuthCallback(request, env);
    }

    if (pathname === '/api/login') {
      return handleLogin(request, env);
    }

    if (pathname === '/api/content') {
      return handleContentApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

// Decap CMS 呼叫 /api/auth 時，直接回傳 PAT，不需要使用者手動登入 GitHub
function handleOAuthInit(request, env) {
  const token = (env.GITHUB_PAT || '').trimStart();
  const html = `<!DOCTYPE html><html><body><script>
    window.opener.postMessage(
      'authorization:github:success:{"token":"${token}","provider":"github"}',
      '*'
    );
    window.close();
  <\/script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

function handleOAuthCallback(request, env) {
  const token = (env.GITHUB_PAT || '').trimStart();
  const html = `<!DOCTYPE html><html><body><script>
    window.opener.postMessage(
      'authorization:github:success:{"token":"${token}","provider":"github"}',
      '*'
    );
    window.close();
  <\/script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleLogin(request, env) {
  const cors = corsHeaders();
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405, cors);

  let username, password;
  try {
    ({ username, password } = await request.json());
  } catch {
    return json({ error: '請求格式錯誤' }, 400, cors);
  }

  // ADMIN_USERS 是 JSON 陣列：[{"username":"...","password":"..."},...]
  let users = [];
  try {
    users = JSON.parse((env.ADMIN_USERS || '[]').trimStart());
  } catch {
    return json({ error: '伺服器帳號設定格式錯誤' }, 500, cors);
  }

  if (users.length === 0) {
    return json({ error: '伺服器尚未設定管理員帳號' }, 500, cors);
  }

  const matched = users.find(u => u.username === username && u.password === password);
  if (matched) {
    return json({
      ok: true,
      token: (env.ADMIN_PASSWORD || '').trimStart(),
      githubToken: (env.GITHUB_PAT || '').trimStart(),
    }, 200, cors);
  }

  return json({ ok: false, error: '帳號或密碼錯誤' }, 401, cors);
}

async function handleContentApi(request, env) {
  const cors = corsHeaders();

  if (request.method === 'GET') {
    if (!checkAuth(request, env)) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }
    try {
      const data = await env.CONTENT.get('site_content');
      return new Response(data ?? 'null', {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (e) {
      return json({ error: 'KV read failed' }, 500, cors);
    }
  }

  if (request.method === 'PUT') {
    if (!checkAuth(request, env)) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }
    try {
      const body = await request.text();
      JSON.parse(body);
      await env.CONTENT.put('site_content', body);
      return json({ ok: true, saved: new Date().toISOString() }, 200, cors);
    } catch (e) {
      return json({ error: e instanceof SyntaxError ? 'Invalid JSON' : 'KV write failed' }, 500, cors);
    }
  }

  return json({ error: 'Method Not Allowed' }, 405, cors);
}

function checkAuth(request, env) {
  const adminPassword = (env.ADMIN_PASSWORD || '').trimStart();
  if (!adminPassword) return false;
  return (request.headers.get('Authorization') ?? '') === 'Bearer ' + adminPassword;
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
