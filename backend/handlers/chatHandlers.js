import { initSSE } from "../utils/sse.js";
import { runChatStream } from "../services/chatService.js";

export async function chatStreamHandler(req, res) {
  const { prompt, tuning } = req.body || {};
  const trimmed = (prompt || "").trim();

  initSSE(res);

  if (!trimmed) {
    res.write("data: {}\n\n");
    return res.end();
  }

  await runChatStream(trimmed, tuning, res);
}
