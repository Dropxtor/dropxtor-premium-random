const ONE_BY_ONE_PNG_BASE64 =
  // A tiny 1x1 transparent PNG
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+Z1mUAAAAASUVORK5CYII=";

export function placeholderPngBuffer(): Buffer {
  return Buffer.from(ONE_BY_ONE_PNG_BASE64, "base64");
}
