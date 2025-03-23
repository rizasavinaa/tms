import express from "express";
import {
    getUsers, 
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    verifyResetToken,
    updatePassUser
} from "../controllers/UserController.js";

import { 
    getRoles, 
    getRoleById, 
    createRole, 
    updateRole, 
    deleteRole 
} from "../controllers/RoleController.js";


const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get("/roles", getRoles);
router.get("/roles/:id", getRoleById);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", updatePassUser);

export default router;