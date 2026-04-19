import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { encode as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

// Proxy to fetch a remote PDF (bypasses browser CORS) and return as base64.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 LovableReader/1.0" },
    });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > 30 * 1024 * 1024) throw new Error("File too large (max 30MB)");
    const base64 = base64Encode(buf);
    const contentType = res.headers.get("content-type") || "application/pdf";
    return new Response(JSON.stringify({ data: base64, contentType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
