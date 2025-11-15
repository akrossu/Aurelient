import app from './app.js';
import { PORT, USE_FAKE } from './src/config/settings.js';

app.listen(PORT, () => {
  console.log(`backend http://localhost:${PORT}`);
  console.log(`mode: ${USE_FAKE ? "FAKE" : "REAL"}`);
});
