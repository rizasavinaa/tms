import Role from "../models/RoleModel.js";
import RoleLog from "../models/RoleLogModel.js";
import { Op } from "sequelize";

// 🔹 Get All Roles
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Get Role by ID
export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });

        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Create Role + Log
export const createRole = async (req, res) => {
    const { name, description, createdBy } = req.body;
    try {
        const newRole = await Role.create({ name, description, createdBy });

        // Log perubahan
        await RoleLog.create({
            role_id: newRole.id,
            changes: `Role baru dibuat: ${JSON.stringify(newRole)}`,
            createdBy
        });

        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Update Role + Log
export const updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });

        const updatedData = {
            name: req.body.name || role.name,
            description: req.body.description || role.description,
            createdBy: req.body.createdBy || role.createdBy
        };

        await role.update(updatedData);

        // Log perubahan
        await RoleLog.create({
            role_id: role.id,
            changes: `Role diperbarui: ${JSON.stringify(updatedData)}`,
            createdBy: req.body.createdBy || role.createdBy
        });

        res.json({ message: "Role berhasil diperbarui", data: updatedData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Delete Role
export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });

        await role.destroy();

        // Log penghapusan
        await RoleLog.create({
            role_id: role.id,
            changes: `Role dihapus`,
            createdBy: req.body.createdBy || role.createdBy
        });

        res.json({ message: "Role berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
