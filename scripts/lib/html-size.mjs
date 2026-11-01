import { gzipSync } from "node:zlib";

/** Distinguish JavaScript string length from bytes and a reproducible gzip estimate. */
export function measureHtmlSize(html) {
  if (typeof html !== "string") throw new TypeError("HTML must be a string");
  const utf8 = Buffer.from(html, "utf8");
  return {
    utf16CodeUnits: html.length,
    utf8Bytes: utf8.byteLength,
    gzipBytes: gzipSync(utf8).byteLength,
  };
}
