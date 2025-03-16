import express from "express";
import {Login, logOut, Me, checkPrivilege} from "../controllers/Auth.js";

const router = express.Router();

router.get('/me', Me);
router.post('/login', Login);
router.delete('/logout', logOut);
router.get("/checkprivilege/:privilege_id", checkPrivilege);

export default router;