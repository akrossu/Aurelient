import express from "express";
import cors from "cors";

import predictRoutes from "./src/routes/predictRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/src/api/predict", predictRoutes);
app.use("/src/api/chat-stream", chatRoutes);

export default app;
