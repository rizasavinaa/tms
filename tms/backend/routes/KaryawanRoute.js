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
    getTalentPortofolioLog,
    getTalentPortofolioByTalentId
 } from "../controllers/PortofolioController.js";
import {
    getTalents,
    getTalentById,
    updateTalent,
    getTalentLog,
    createTalent,
    getActiveTalentsByClient
} from "../controllers/TalentController.js";
import {
    exportTalents,
} from "../controllers/KaryawanReportController.js";
import {
    getClients,
    getClientById,
    updateClient,
    getClientLog,
    createClient,
} from "../controllers/ClientController.js";
import upload from "../middleware/upload.js";



const router = express.Router();

router.get('/posisipks', getTalentCategory);
router.get('/posisipks/:id', getTalentCategoryById);
router.put('/posisipks/:id', updateTalentCategory);
router.get("/posisipk-log", getTalentCategoryLog);
router.post('/posisipks', createTalentCategory);
router.post("/portopks", upload.single("file"), createTalentPortofolio);
router.get("/talents", getTalents);
router.get("/talents/:id", getTalentById);
router.get("/talents-log", getTalentLog);
router.put("/talents/:id", updateTalent);
router.post('/talents', createTalent);
router.get("/portopks", getTalentPortofolio);
router.get("/portopks/:id", getTalentPortofolioById);
router.put("/portopks/:id", updateTalentPortofolioDescription);
router.delete("/portopks/:id", deleteTalentPortofolio);
router.get("/portopk-log", getTalentPortofolioLog);
router.get("/portopks/talent/:talent_id", getTalentPortofolioByTalentId);
router.get("/export-talents", exportTalents);
router.get("/clients", getClients);
router.get("/clients/:id", getClientById);
router.get("/clients-log", getClientLog);
router.put("/clients/:id", updateClient);
router.post('/clients', createClient);
router.get("/talents-clients/:id", getActiveTalentsByClient);

export default router;