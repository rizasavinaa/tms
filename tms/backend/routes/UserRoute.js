import express from "express";
import User from "../models/UserModel.js";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    verifyResetToken,
    updatePassUser,
    resetPassword
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
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/user-reset-password/:id', resetPassword);

router.get("/roles", getRoles);
router.get("/roles/:id", getRoleById);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", updatePassUser);

router.get('/user-summary', async (req, res) => {
    try {
        const activeCount = await User.count({ where: { status: 1 } });
        const unactiveCount = await User.count({ where: { status: 0 } });

        res.json([
            { name: 'Active', value: activeCount },
            { name: 'Unactive', value: unactiveCount }
        ]);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data summary', error: error.message });
    }
});

export default router;