// WhatsApp alerts to the site owner through CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/).
// Set CALLMEBOT_PHONE (your number with country code, e.g. 94771234567) and CALLMEBOT_APIKEY in .env.local.
export const whatsappAlertsConfigured = () => !!(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY);

export async function sendWhatsAppAlert(text: string): Promise<boolean> {
  const { CALLMEBOT_PHONE, CALLMEBOT_APIKEY } = process.env;
  if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) return false;
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", `+${CALLMEBOT_PHONE.replace(/\D/g, "")}`);
  url.searchParams.set("text", text.slice(0, 1500));
  url.searchParams.set("apikey", CALLMEBOT_APIKEY);
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    // CallMeBot answers 200 with a text page; failures say so in the body.
    const body = await r.text();
    const ok = r.ok && !/error|invalid|not\s+(?:valid|allowed|activated)/i.test(body);
    if (!ok) console.error("WhatsApp alert failed", r.status, body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200));
    return ok;
  } catch (e) {
    console.error("WhatsApp alert failed", e);
    return false;
  }
}
