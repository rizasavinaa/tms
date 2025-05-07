import Role from "../models/RoleModel.js";
import RoleLog from "../models/RoleLogModel.js";
import RolePrivilege from "../models/RolePrivilegeModel.js";
import PrivilegeLog from "../models/PrivilegeLogModel.js";
import Privilege from "../models/PrivilegeModel.js";
import sequelize from "../config/Database.js";
import { Op } from "sequelize";
import requestIp from "request-ip";
import User from "../models/UserModel.js";

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

    const createRoleTransaction = await sequelize.transaction();
    try {
        const createdBy = req.session.userId;
        if (!createdBy) {
            return res.status(401).json({ message: "Unauthorized: No user session" });
        }

        const roleData = { ...req.body, createdBy };
        const newRole = await Role.create(roleData, { transaction: createRoleTransaction });

        await RoleLog.create({
            role_id: newRole.id,
            changes: JSON.stringify({
                action: "Role Created",
                fields: Object.keys(req.body),
                values: req.body,
            }),
            createdBy,
            ip: requestIp.getClientIp(req)
        }, { transaction: createRoleTransaction });

        await createRoleTransaction.commit();
        res.status(201).json({ message: "Role & Log created", role: newRole });
    } catch (error) {
        await createRoleTransaction.rollback();
        console.error("Create Role Error:", error); // Tambahkan ini
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Update Role + Log
export const updateRole = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });
        const createdBy = req.session.userId;
        const updatedFields = {};
        const oldValues = {};

        Object.keys(req.body).forEach((key) => {
            if (role[key] !== req.body[key]) {
                oldValues[key] = role[key];           // nilai sebelum diupdate
                updatedFields[key] = req.body[key];   // nilai sesudah diupdate
            }
        });

        await role.update(updatedFields, { transaction });

        if (Object.keys(updatedFields).length > 0) {
            await RoleLog.create(
                {
                    role_id: role.id,
                    changes: JSON.stringify({
                        action: "Role Updated",
                        fields: Object.keys(updatedFields),
                        oldValues,           // ✅ nilai lama
                        newValues: updatedFields, // ✅ nilai baru
                    }),
                    createdBy,
                    ip: requestIp.getClientIp(req),
                },
                { transaction }
            );
        }

        await transaction.commit();

        res.json({ message: "Role berhasil diperbarui", data: updatedFields });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRoleLog = async (req, res) => {
    try {
        const { role_id } = req.query;

        if (!role_id) {
            return res.status(400).json({ message: "role_id is required" });
        }

        const logs = await RoleLog.findAll({
            where: { role_id },
            include: {
                model: User,
                attributes: ["fullname"], // atau field lain yang kamu butuh
            },
            order: [["createdAt", "DESC"]],
        });

        const formattedLogs = logs.map((log) => ({
            created_at: log.createdAt,
            user: log.user ? log.user.fullname : "Unknown",
            ip: log.ip,
            changes: log.changes,
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error("Error fetching user logs:", error.message, error.stack);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getRolePrivilege = async (req, res) => {
    try {
        const { role_id } = req.query;

        if (!role_id) {
            return res.status(400).json({ message: "role_id is required" });
        }

        const privileges = await RolePrivilege.findAll({
            where: { role_id: role_id },
            include: [
                {
                    model: Privilege,
                    attributes: ["name", "description"]
                }
            ]
        });

        const formattedLogs = privileges.map((priv) => ({
            name: priv.privilege?.name,
            description: priv.privilege?.description,
            id: priv.id
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error("Gagal mengambil role privileges:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil role privileges",
            error: error.message
        });
    }
};

export const getAllRolePrivileges = async (req, res) => {
    try {
        const roleprivs = await RolePrivilege.findAll({
            include: [
                {
                    model: Role,
                    attributes: ['name']
                },
                {
                    model: Privilege,
                    attributes: ['name', 'description']
                }
            ]
        });

        res.json(roleprivs);
    } catch (error) {
        console.error("Gagal mengambil role privileges:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil role privileges",
            error: error.message
        });
    }
};
export const deleteRolePrivilege = async (req, res) => {
    try {
        const rolepriv = await RolePrivilege.findByPk(req.params.id);
        if (!rolepriv) return res.status(404).json({ message: "Hak Akses tidak ditemukan" });

        await rolepriv.destroy();
        res.json({ message: "Hak Akses berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

export const createRolePrivilege = async (req, res) => {
    const createTransaction = await sequelize.transaction();

    try {
        const createdBy = req.session.userId;
        if (!createdBy) {
            return res.status(401).json({ message: "Unauthorized: No user session" });
        }

        const { role_id, name, description } = req.body;
        const clientIp = requestIp.getClientIp(req);

        // 1. Simpan privilege baru
        const newPrivilege = await Privilege.create({
            name,
            description,
            createdby: createdBy
        }, { transaction: createTransaction });

        // 2. Simpan log privilege
        await PrivilegeLog.create({
            privilege_id: newPrivilege.id,
            changes: JSON.stringify({
                action: "Privilege Created",
                fields: ["name", "description"],
                values: { name, description }
            }),
            createdby: createdBy,
            ip: clientIp
        }, { transaction: createTransaction });

        // 3. Simpan ke role_privilege
        const newRolePrivilege = await RolePrivilege.create({
            role_id,
            privilege_id: newPrivilege.id,
            createdby: createdBy
        }, { transaction: createTransaction });

        await createTransaction.commit();

        res.status(201).json({
            message: "Privilege, log, and role_privilege created successfully",
            rolePrivilege: newRolePrivilege
        });
    } catch (error) {
        await createTransaction.rollback();
        console.error("Create Role Privilege Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
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


