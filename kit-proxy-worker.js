/**
 * Futbolist Worker (Cloudflare) — three jobs, one deployment:
 *
 *  1) POST  { email }                  → adds the person to your Kit form
 *  2) GET   ?session_id=cs_...         → returns the buyer's FIRST name for the
 *                                         confirmation page (looked up from Stripe)
 *  3) POST  /apply  { application }    → validates and forwards to Google Sheets
 *                                         via Apps Script webhook
 *
 * All keys stay here server-side, never in the public pages.
 *
 * Set in Cloudflare → your Worker → Settings → Variables and Secrets:
 *   KIT_API_KEY        (Secret)   — Kit → Settings → Advanced → "API Key"
 *   KIT_FORM_ID        (Variable) — numeric Kit form ID
 *   STRIPE_SECRET_KEY  (Secret)   — a Stripe RESTRICTED key scoped to
 *                                   "Checkout Sessions: Read" only.
 *                                   Use the TEST key while testing, LIVE before launch.
 *   APPLY_SHEET_URL    (Secret)   — Google Apps Script web app URL (from APPLY-SETUP.md)
 *   ALLOWED_ORIGIN     (Variable, optional) — your site origin; defaults to "*"
 */

// Required fields for an application submission
const APPLY_REQUIRED = ["name", "email", "location", "position", "level",
                        "last_club", "free_agent", "relocate", "film_link", "why"];

export default {
  async fetch(request, env) {
    // Support comma-separated list of allowed origins, e.g.
    // "https://www.thefutbolist.com,http://localhost:8080"
    const requestOrigin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "*").split(",").map(s => s.trim());
    const originOk = allowed.includes("*") || allowed.includes(requestOrigin);
    const cors = {
      "Access-Control-Allow-Origin": originOk ? requestOrigin : allowed[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // ── 3) POST /apply: validate and forward to Google Sheets ──
    if (url.pathname === "/apply" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json({ error: "Invalid request body" }, 400, cors);
      }

      // Validate required fields
      for (const field of APPLY_REQUIRED) {
        if (!body[field] || !String(body[field]).trim()) {
          return json({ error: `Missing required field: ${field}` }, 400, cors);
        }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return json({ error: "Invalid email" }, 400, cors);
      }

      if (!env.APPLY_SHEET_URL) {
        // No sheet configured yet — accept gracefully so the form works in staging
        console.log("APPLY_SHEET_URL not set — application not stored:", body.email);
        return json({ ok: true, note: "sheet_not_configured" }, 200, cors);
      }

      try {
        const sheetRes = await fetch(env.APPLY_SHEET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, source: body.source || "apply-form" }),
          redirect: "follow",
        });
        if (!sheetRes.ok) {
          const detail = await sheetRes.text().catch(() => "");
          console.log("Sheet error", sheetRes.status, detail);
          return json({ error: "Could not save application" }, 502, cors);
        }
        return json({ ok: true }, 200, cors);
      } catch (err) {
        console.error("Apply sheet fetch error:", err);
        return json({ error: "Internal error" }, 500, cors);
      }
    }

    // ── 1) GET: Stripe session → first name (for the confirmation page) ──
    if (request.method === "GET") {
      const sessionId = new URL(request.url).searchParams.get("session_id") || "";
      // Always 200 with { name } so the page can gracefully fall back.
      if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !env.STRIPE_SECRET_KEY) {
        return json({ name: null }, 200, cors);
      }
      try {
        const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
        });
        if (!r.ok) return json({ name: null }, 200, cors);
        const s = await r.json();
        const full = (s.customer_details && s.customer_details.name) || "";
        const first = full.trim().split(/\s+/)[0] || null;
        return json({ name: first }, 200, cors);
      } catch (_) {
        return json({ name: null }, 200, cors);
      }
    }

    // ── 2) POST: add email to Kit ──
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    let email = "";
    try {
      const body = await request.json();
      email = String(body.email || "").trim();
    } catch (_) {
      return json({ error: "Invalid request body" }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid email" }, 400, cors);
    }
    if (!env.KIT_API_KEY || !env.KIT_FORM_ID) {
      return json({ error: "Server not configured" }, 500, cors);
    }

    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${env.KIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: env.KIT_API_KEY, email }),
      }
    );

    if (res.ok) return json({ ok: true }, 200, cors);
    const detail = await res.text().catch(() => "");
    console.log("kit error", res.status, detail);
    return json({ error: "Could not subscribe right now" }, 502, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
