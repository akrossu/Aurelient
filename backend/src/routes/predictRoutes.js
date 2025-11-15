import { Router } from "express";
import { predictHandler } from "../handlers/predictHandlers.js";

const router = Router();

router.post("/", predictHandler);

export default router;
