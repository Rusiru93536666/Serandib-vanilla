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
