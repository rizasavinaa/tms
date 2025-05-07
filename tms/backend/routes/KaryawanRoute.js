import express from "express";
import {
    getTalentCategory,
    getTalentCategoryById,
    updateTalentCategory,
    getTalentCategoryLog,
    createTalentCategory
} from "../controllers/TalentCategoryController.js";
import { createTalentPortofolio,
    getTalentPortofolio,
    getTalentPortofolioById,
    updateTalentPortofolioDescription,
    deleteTalentPortofolio,
    getTalentPortofolioLog
 } from "../controllers/PortofolioController.js";
import {
    getTalents,
    getTalentById,
} from "../controllers/TalentController.js";
import upload from "../middleware/upload.js";



const router = express.Router();

router.get('/posisipks', getTalentCategory);
router.get('/posisipks/:id', getTalentCategoryById);
router.put('/posisipks/:id', updateTalentCategory);
router.get("/posisipk-log", getTalentCategoryLog);
router.post('/posisipks', createTalentCategory);
router.post("/portopks", upload.single("file"), createTalentPortofolio);
router.get('/talents', getTalents);
router.get('/talents/:id', getTalentById);
router.get("/portopks", getTalentPortofolio);
router.get("/portopks/:id", getTalentPortofolioById);
router.put("/portopks/:id", updateTalentPortofolioDescription);
router.delete("/portopks/:id", deleteTalentPortofolio);
router.get("/portopk-log", getTalentPortofolioLog);


export default router;