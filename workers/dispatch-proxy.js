const ALLOWED_ORIGIN = "https://locreport.com";
const ALLOWED_WORKFLOWS = new Set(["add-event.yml", "manual-article.yml"]);
const REPOSITORY = "aparasion/locreport";
const RATE_LIMIT_WINDOW_S = 3600; // 1 hour
const RATE_LIMIT_MAX = 20;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return cors(null, 204);
    }

    if (request.method !== "POST") {
      return cors(err("Method not allowed"), 405);
    }

    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) {
      return cors(err("Forbidden"), 403);
    }

    const workerKey = request.headers.get("X-Worker-Key") || "";
    if (!env.WORKER_KEY || workerKey !== env.WORKER_KEY) {
      return cors(err("Unauthorized"), 401);
    }

    if (env.RATE_LIMIT) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      if (await isRateLimited(env.RATE_LIMIT, ip)) {
        return cors(err("Too many requests"), 429);
      }
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(err("Invalid JSON"), 400);
    }

    const { workflow, ref, inputs } = body;

    if (!ALLOWED_WORKFLOWS.has(workflow)) {
      return cors(err("Unknown workflow"), 400);
    }
    if (!ref || typeof ref !== "string") {
      return cors(err("Missing ref"), 400);
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${REPOSITORY}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${env.GITHUB_PAT}`,
          "Content-Type": "application/json",
          "User-Agent": "locreport-dispatch/1.0",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({ ref, inputs: inputs || {} })
      }
    );

    if (ghRes.status === 204) return cors(null, 204);
    if (ghRes.status === 401) return cors(err("GitHub token invalid or expired"), 502);

    const text = await ghRes.text();
    return cors(err(text || `GitHub error ${ghRes.status}`), 502);
  }
};

async function isRateLimited(kv, ip) {
  const key = `rl:${ip}`;
  const now = Date.now();
  const raw = await kv.get(key);

  if (raw) {
    const { t, n } = JSON.parse(raw);
    if (now - t < RATE_LIMIT_WINDOW_S * 1000) {
      if (n >= RATE_LIMIT_MAX) return true;
      await kv.put(key, JSON.stringify({ t, n: n + 1 }), { expirationTtl: RATE_LIMIT_WINDOW_S });
      return false;
    }
  }

  await kv.put(key, JSON.stringify({ t: now, n: 1 }), { expirationTtl: RATE_LIMIT_WINDOW_S });
  return false;
}

function err(message) {
  return JSON.stringify({ error: message });
}

function cors(body, status) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Worker-Key",
      "Access-Control-Max-Age": "86400",
      ...(body ? { "Content-Type": "application/json" } : {})
    }
  });
}
