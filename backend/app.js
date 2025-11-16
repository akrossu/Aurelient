import express from "express";
import cors from "cors";

import predictRoutes from "./src/routes/predictRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const app = express();

let corsOptions = {};
if (process.env.NODE_ENV === "development") {
  corsOptions = { origin: "http://localhost:5173" }; // Vite dev server
} else {
  corsOptions = { origin: "*" }; // Allow all origins in preview/production or set your domain
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/predict", predictRoutes);
app.use("/api/chat-stream", chatRoutes);

export default app;