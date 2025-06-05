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
    getKaryawanDashboardStats,
    getRetentionReport
} from "../controllers/KaryawanReportController.js";
import {
    getClients,
    getClientById,
    updateClient,
    getClientLog,
    createClient,
} from "../controllers/ClientController.js";
import{
    createTalentWorkHistory,
    getTalentWorkHistoryByTalentId,
    getTalentWorkHistoryByClientId,
    getTalentWorkHistoryById,
    getTalentWorkHistoryLog,
    updateTalentContract,
    checkActiveContract,
    getContracts
} from "../controllers/TalentWorkHistoryController.js";
import upload from "../middleware/upload.js";
import {
    createTalentWorkProof,
    getAllTalentWorkProof,
    getTalentWorkProofById,
    updateTalentWorkProof,
    deleteTalentWorkProof,
    getTalentWorkProofLog,
    getTalentWorkProofByTalentId,
    checkOverlapWorkProof,
    exportReportPembayaran
} from "../controllers/TalentWorkProofController.js";


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
router.put("/portopks/:id",  upload.single("porto_file"), updateTalentPortofolioDescription);
router.delete("/portopks/:id", deleteTalentPortofolio);
router.get("/portopk-log", getTalentPortofolioLog);
router.get("/portopks/talent/:talent_id", getTalentPortofolioByTalentId);
router.get("/export-talents", exportTalents);
router.get("/clients", getClients);
router.get("/clients/:id", getClientById);
router.get("/clients-log", getClientLog);
router.put("/clients/:id", updateClient);
router.post('/clients', createClient);
router.get("/clients", getClients);
router.post('/contracts/:id', upload.single("contract_file"), createTalentWorkHistory);
router.get("/contracts/:id", getTalentWorkHistoryById);
router.get("/contracts-log", getTalentWorkHistoryLog);
router.put("/contracts/:id", upload.single("contract_file"), updateTalentContract);
router.get("/contracts/talent/:talent_id", getTalentWorkHistoryByTalentId);
router.get("/talents-clients/:client_id", getTalentWorkHistoryByClientId);
router.get("/contracts-check-active", checkActiveContract);
router.get("/contracts", getContracts);
router.get("/karyawan-homepage", getKaryawanDashboardStats);
router.get("/laporan-retensi", getRetentionReport);
router.post("/workproofs", upload.single("file"), createTalentWorkProof);
router.get("/workproofs", getAllTalentWorkProof);
router.get("/workproofs/:id", getTalentWorkProofById);
router.put("/workproofs/:id",  upload.single("file"), updateTalentWorkProof);
router.get("/workproofs-log", getTalentWorkProofLog);
router.delete("/workproofs/:id", deleteTalentWorkProof);
router.post("/workproofs/check-overlap", checkOverlapWorkProof);
router.get("/workproofs/talent/:talent_id", getTalentWorkProofByTalentId);
router.get("/report-payment-export", exportReportPembayaran);
export default router;