import QRCode from "npm:qrcode@1.5.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_VALUE_LENGTH = 300;
const DEFAULT_SIZE = 168;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

    const body = await req.json().catch(() => null);
    const value = body && typeof body === "object" ? (body as Record<string, unknown>).value : undefined;
    const size = body && typeof body === "object" ? (body as Record<string, unknown>).size : undefined;

    if (typeof value !== "string" || value.length === 0 || value.length > MAX_VALUE_LENGTH) {
      return json({ error: "A value between 1 and 300 characters is required." }, 400);
    }

    const width = typeof size === "number" && size >= 64 && size <= 512 ? Math.round(size) : DEFAULT_SIZE;
    const svg = await QRCode.toString(value, {
      type: "svg",
      width,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0b0b0d", light: "#ffffff" },
    });

    return new Response(svg, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "image/svg+xml" },
    });
  } catch (error) {
    console.error("qr-code failed", error);
    return json({ error: "The QR code could not be created." }, 500);
  }
});
