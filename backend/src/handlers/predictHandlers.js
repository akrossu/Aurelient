import { USE_FAKE } from "../config/settings.js";
import {
  runFakePrediction,
  runRealPrediction,
} from "../services/predictService.js";

export async function predictHandler(req, res) {
  const { prompt } = req.body || {};
  const trimmed = (prompt || "").trim();

  const result = USE_FAKE
    ? await runFakePrediction(trimmed)
    : await runRealPrediction(trimmed);

  res.json(result);
}
