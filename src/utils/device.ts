export function getDeviceName(userAgent: string) {
  if (/mobile/i.test(userAgent)) return "Mobile device";
  if (/tablet/i.test(userAgent)) return "Tablet";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/mac/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown device";
}
