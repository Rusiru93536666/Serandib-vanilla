// Images must be files from our upload route or secure HTTPS URLs without credentials.
export const safeMediaUrl = (value: string) => {
  if (/^\/uploads\/[a-f0-9-]+\.(?:jpe?g|png|webp)$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};

// Extracts the 11-character video ID from a YouTube watch, share, embed or shorts URL; "" if it is not one.
export const youtubeId = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    const host = url.hostname.replace(/^(www|m)\./, "");
    const id = host === "youtu.be" ? url.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com" ? url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? ""
      : "";
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
};
