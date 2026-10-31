/** Only the browser log for the exact, deliberately requested 404 document is
 * expected. A missing asset, unrelated console error or different request is not. */
export function expectedDocument404Log(log, responses, expectedPath) {
  if (log.type !== "log" || log.source !== "network" || !log.requestId || !log.url) return false;
  try {
    if (new URL(log.url).pathname !== expectedPath) return false;
    return responses.some((response) => response.requestId === log.requestId && response.status === 404 &&
      response.type === "Document" && new URL(response.url).pathname === expectedPath);
  } catch { return false; }
}
