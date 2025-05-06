import express from "express";
import upload from "../middleware/upload.js";
import { createTalentPortofolio } from "../controllers/PortofolioController.js";

const router = express.Router();

// router.post("/portopks", upload.single("file"), createTalentPortofolio);
export default router;