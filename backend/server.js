import dotenv from "dotenv"
dotenv.config()

import app from './app.js';
import { PORT, USE_FAKE } from './src/config/settings.js';

app.listen(PORT, () => {
  console.log(`backend http://localhost:${PORT}`);
  console.log(`model: ${process.env.LMSTUDIO_MODEL}`)
  console.log(`mode: ${USE_FAKE ? "FAKE" : "REAL"}`);
});
