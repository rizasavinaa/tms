import express from "express";
import { getTalentCategory,
    getTalentCategoryById,
    updateTalentCategory,
    getTalentCategoryLog,
    createTalentCategory
 } from "../controllers/TalentCategoryController.js";

import { createTalentPortofolio } from "../controllers/PortofolioController.js";
import upload from "../middleware/upload.js";



const router = express.Router();

router.get('/posisipks', getTalentCategory);
router.get('/posisipks/:id', getTalentCategoryById);
router.put('/posisipks/:id', updateTalentCategory);
router.get("/posisipk-log", getTalentCategoryLog);
router.post('/posisipks', createTalentCategory);
router.post("/portopks", upload.single("file"), createTalentPortofolio);

export default router;