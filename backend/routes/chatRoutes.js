import { Router } from "express";
import { chatStreamHandler } from "../handlers/chatHandlers.js";

const router = Router();

router.post("/", chatStreamHandler);

export default router;
