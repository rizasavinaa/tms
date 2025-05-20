import express from "express";
import {Login, logOut, Me, checkPrivilege} from "../controllers/Auth.js";
import { checkEmailAvailability } from "../controllers/UserController.js";

const router = express.Router();

router.get('/me', Me);
router.post('/login', Login);
router.delete('/logout', logOut);
router.get("/checkprivilege/:privilege_id", checkPrivilege);
router.post("/check-email", checkEmailAvailability);

export default router;