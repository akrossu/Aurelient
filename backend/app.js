import express from "express";
import cors from "cors";

import predictRoutes from "./routes/predictRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/predict", predictRoutes);
app.use("/api/chat-stream", chatRoutes);

export default app;
