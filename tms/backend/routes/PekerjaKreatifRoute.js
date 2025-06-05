import express from "express";
import { getTalentReminders } from "../controllers/TalentReminderController.js";
const router = express.Router();

router.get("/reminderspk", getTalentReminders);
export default router;