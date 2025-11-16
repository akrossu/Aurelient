import { runChatStream } from "../services/chatService.js";

export async function chatStreamHandler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { history, tuning } = req.body;

  if (!history || !Array.isArray(history)) {
    res.write(`data: ${JSON.stringify({ error: "No history provided" })}\n\n`);
    return res.end();
  }

  try {
    await runChatStream(history, tuning, res);
  } catch (err) {
    console.error("chatStreamHandler error:", err);
    res.write(
      `data: ${JSON.stringify({
        choices: [{ delta: { content: "[LLM ERROR: backend exception]" } }],
      })}\n\n`
    );
    res.end();
  }
}