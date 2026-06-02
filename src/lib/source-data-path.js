export function getSourceDataFilename(sourceUrl) {
  return `${encodeSourceUrl(sourceUrl).replace(/[/+=]/g, "_")}.json`;
}

function encodeSourceUrl(sourceUrl) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(sourceUrl, "utf-8").toString("base64");
  }

  const bytes = new TextEncoder().encode(sourceUrl);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
