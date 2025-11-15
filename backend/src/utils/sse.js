export function initSSE(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

export function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
