/**
 * Futbolist Worker (Cloudflare) — six jobs, one deployment:
 *
 *  1) POST  { email }                  → adds the person to your Kit form
 *  2) GET   ?session_id=cs_...         → returns the buyer's FIRST name for the
 *                                         confirmation page (looked up from Stripe)
 *  3) POST  /apply  { application }    → validates and forwards to Google Sheets
 *                                         via Apps Script webhook
 *  4) POST  /youth  { registration }   → validates and forwards to a separate
 *                                         Youth Academy Google Sheet
 *  5) GET   /youth/count               → returns how many "Founding 20" promo
 *                                         spots have been claimed, for the live
 *                                         counter on the Youth Academy page
 *  6) POST  /youth/checkout { training_type, email, reference }
 *                                       → creates a fresh Stripe Checkout Session
 *                                         (with any promo discount applied
 *                                         automatically, server-side) and returns
 *                                         its URL for the browser to redirect to.
 *                                         Static Payment Links can't auto-apply a
 *                                         coupon — only a real Checkout Session can.
 *
 * All keys stay here server-side, never in the public pages.
 *
 * Set in Cloudflare → your Worker → Settings → Variables and Secrets:
 *   KIT_API_KEY        (Secret)   — Kit → Settings → Advanced → "API Key"
 *   KIT_FORM_ID        (Variable) — numeric Kit form ID
 *   STRIPE_SECRET_KEY  (Secret)   — a Stripe RESTRICTED key scoped to
 *                                   "Checkout Sessions: Read + Write".
 *                                   Use the TEST key while testing, LIVE before launch.
 *   APPLY_SHEET_URL    (Secret)   — Google Apps Script web app URL (from APPLY-SETUP.md)
 *   YOUTH_SHEET_URL    (Secret)   — Google Apps Script web app URL (from youth-sheet.gs)
 *   ALLOWED_ORIGIN     (Variable, optional) — your site origin; defaults to "*"
 */

// Youth Academy training options → Stripe Price + (optional) Promotion Code.
// Add a `promotionCode` once you've created a coupon/code for an option; leave
// it out (or the whole entry unset) for options that have no discount yet.
const YOUTH_CHECKOUT_CONFIG = {
  "Founding Membership — $100 first month": {
    price: "price_1U2dqGCiAiGibtqgSYyWIg8R",
    mode: "subscription",
    promotionCode: "promo_1U2elQCiAiGibtqgsUabYCUR",
  },
  "Founding 4-Session Pack — $190": {
    price: "price_1U2dr8CiAiGibtqg4FP84xdU",
    mode: "payment",
    promotionCode: "promo_1U2elQCiAiGibtqgsUabYCUR", // FOUNDINGMEMBER — 50% off, so $380 → $190
  },
  // "Small Group — $50/player": { price: "price_...", mode: "payment" },
  // "1:1 — $95/session":        { price: "price_...", mode: "payment" },
};

// Required fields for an application submission
const APPLY_REQUIRED = ["name", "email", "location", "position", "level",
                        "last_club", "free_agent", "relocate", "film_link", "why"];

// Required fields for a youth academy registration
const YOUTH_REQUIRED = ["parent_name", "phone", "email",
                        "player_name", "age", "training_type", "availability"];

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

    // ── 4) POST /youth: validate and forward to Youth Academy Google Sheet ──
    if (url.pathname === "/youth" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json({ error: "Invalid request body" }, 400, cors);
      }

      // Validate required fields
      for (const field of YOUTH_REQUIRED) {
        if (!body[field] || !String(body[field]).trim()) {
          return json({ error: `Missing required field: ${field}` }, 400, cors);
        }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return json({ error: "Invalid email" }, 400, cors);
      }

      if (!env.YOUTH_SHEET_URL) {
        console.log("YOUTH_SHEET_URL not set — registration not stored:", body.email);
        return json({ ok: true, note: "sheet_not_configured" }, 200, cors);
      }

      try {
        const sheetRes = await fetch(env.YOUTH_SHEET_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, source: body.source || "youth-form" }),
          redirect: "follow",
        });
        if (!sheetRes.ok) {
          const detail = await sheetRes.text().catch(() => "");
          console.log("Youth sheet error", sheetRes.status, detail);
          return json({ error: "Could not save registration" }, 502, cors);
        }
        return json({ ok: true }, 200, cors);
      } catch (err) {
        console.error("Youth sheet fetch error:", err);
        return json({ error: "Internal error" }, 500, cors);
      }
    }

    // ── 5) GET /youth/count: Founding 20 promo spots remaining ──
    if (url.pathname === "/youth/count" && request.method === "GET") {
      const FOUNDING_LIMIT = 20;

      if (!env.YOUTH_SHEET_URL) {
        return json({ claimed: 0, remaining: FOUNDING_LIMIT, note: "sheet_not_configured" }, 200, cors);
      }

      try {
        const countUrl = `${env.YOUTH_SHEET_URL}?action=count&promo=founding20`;
        const sheetRes = await fetch(countUrl, { method: "GET", redirect: "follow" });
        if (!sheetRes.ok) {
          const detail = await sheetRes.text().catch(() => "");
          console.log("Youth count sheet error", sheetRes.status, detail);
          return json({ claimed: 0, remaining: FOUNDING_LIMIT, note: "count_unavailable" }, 200, cors);
        }
        const data = await sheetRes.json().catch(() => ({}));
        const claimed = Math.max(0, Number(data.count) || 0);
        const remaining = Math.max(0, FOUNDING_LIMIT - claimed);
        return json({ claimed, remaining }, 200, cors);
      } catch (err) {
        console.error("Youth count fetch error:", err);
        return json({ claimed: 0, remaining: FOUNDING_LIMIT, note: "count_unavailable" }, 200, cors);
      }
    }

    // ── 6) POST /youth/checkout: create a live Stripe Checkout Session ──
    // Static Payment Links can't have a coupon auto-applied — only a real
    // Checkout Session (created per-signup, right here) can. This is why the
    // form calls this endpoint instead of jumping straight to a fixed URL.
    if (url.pathname === "/youth/checkout" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json({ error: "Invalid request body" }, 400, cors);
      }

      const trainingType = String(body.training_type || "");
      const email = String(body.email || "").trim();
      const reference = String(body.reference || "").slice(0, 200);

      const config = YOUTH_CHECKOUT_CONFIG[trainingType];
      if (!config || !config.price) {
        return json({ error: "not_configured" }, 200, cors);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Invalid email" }, 400, cors);
      }
      if (!env.STRIPE_SECRET_KEY) {
        console.log("STRIPE_SECRET_KEY not set — cannot create checkout session");
        return json({ error: "not_configured" }, 200, cors);
      }

      // Redirect back to whichever origin actually made the request (falls
      // back to the primary domain), so this also works from localhost.
      const siteOrigin = originOk && requestOrigin ? requestOrigin : "https://www.thefutbolist.com";

      const params = new URLSearchParams();
      params.set("mode", config.mode);
      params.set("line_items[0][price]", config.price);
      params.set("line_items[0][quantity]", "1");
      params.set("success_url", `${siteOrigin}/youth/confirmation.html?session_id={CHECKOUT_SESSION_ID}`);
      params.set("cancel_url", `${siteOrigin}/youth/`);
      params.set("customer_email", email);
      if (reference) params.set("client_reference_id", reference);
      if (config.promotionCode) params.set("discounts[0][promotion_code]", config.promotionCode);

      try {
        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });
        const session = await stripeRes.json().catch(() => ({}));
        if (!stripeRes.ok) {
          console.log("Stripe checkout session error", stripeRes.status, session.error?.message);
          return json({ error: "Could not start checkout" }, 502, cors);
        }
        return json({ url: session.url }, 200, cors);
      } catch (err) {
        console.error("Stripe checkout session fetch error:", err);
        return json({ error: "Internal error" }, 500, cors);
      }
    }

    // ── 1) GET: Stripe session → buyer name + payment summary (for confirmation pages) ──
    if (request.method === "GET") {
      const sessionId = new URL(request.url).searchParams.get("session_id") || "";
      // Always 200 with a safe shape so the page can gracefully fall back.
      const empty = { name: null, amount_total: null, currency: null, mode: null, client_reference_id: null };
      if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !env.STRIPE_SECRET_KEY) {
        return json(empty, 200, cors);
      }
      try {
        const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
        });
        if (!r.ok) return json(empty, 200, cors);
        const s = await r.json();
        const full = (s.customer_details && s.customer_details.name) || "";
        const first = full.trim().split(/\s+/)[0] || null;
        return json({
          name: first,
          amount_total: typeof s.amount_total === "number" ? s.amount_total : null,
          currency: s.currency || null,
          mode: s.mode || null, // "payment" (one-time) or "subscription"
          client_reference_id: s.client_reference_id || null,
        }, 200, cors);
      } catch (_) {
        return json(empty, 200, cors);
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
