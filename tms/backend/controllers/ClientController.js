import Client from "../models/ClientModel.js";
import ClientLog from "../models/ClientLogModel.js";
import User from "../models/UserModel.js";
import sequelize from "../config/Database.js";
import requestIp from "request-ip";
import { createUserInternal } from "./UserController.js";
// 🔹 Get All Clients
export const getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Get Client by ID
export const getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: "Client tidak ditemukan" });

        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Create Client + Log
export const createClient = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const createdby = req.session.userId;
        if (!createdby) return res.status(401).json({ message: "Unauthorized: No user session" });

        const ip = requestIp.getClientIp(req);
        const { email, name } = req.body;

        console.log("CreateUserInternal Params:", { email, fullname: name, createdby });

        // 1. Buat User dengan role Client (misal role_id: 4)
        const newUser = await createUserInternal({
            email,
            fullname: name,
            role_id: 4, // Ganti sesuai role klien di sistem Anda
            createdby,
            ip,
            transaction,
        });

        // 2. Simpan Client dengan user_id dari User baru
        const clientData = {
            ...req.body,
            user_id: newUser.id,
            createdby,
        };
        const newClient = await Client.create(clientData, { transaction });

        // 3. Simpan log Client
        await ClientLog.create({
            client_id: newClient.id,
            changes: JSON.stringify({
                action: "Client Created",
                fields: Object.keys(req.body),
                values: req.body,
            }),
            createdby,
            ip,
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: "Client & User created", client: newClient });
    } catch (error) {
        await transaction.rollback();
        console.error("Create Client Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Update Client + Log
export const updateClient = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: "Client tidak ditemukan" });

        const createdby = req.session.userId;
        const updatedFields = {};
        const oldValues = {};

        const isSameDate = (a, b) => {
            if (!a || !b) return a === b;
            return new Date(a).toISOString().split("T")[0] === new Date(b).toISOString().split("T")[0];
        };

        Object.keys(req.body).forEach((key) => {
            if (key === "joined_date") {
                if (!isSameDate(client[key], req.body[key])) {
                    oldValues[key] = client[key];
                    updatedFields[key] = req.body[key];
                }
            } else if (client[key] !== req.body[key]) {
                oldValues[key] = client[key];
                updatedFields[key] = req.body[key];
            }
        });

        await client.update(updatedFields, { transaction });

        if (Object.keys(updatedFields).length > 0) {
            await ClientLog.create({
                client_id: client.id,
                changes: JSON.stringify({
                    action: "Client Updated",
                    fields: Object.keys(updatedFields),
                    oldValues,
                    newValues: updatedFields
                }),
                createdby,
                ip: requestIp.getClientIp(req)
            }, { transaction });
        }

        await transaction.commit();
        res.json({ message: "Client berhasil diperbarui", data: updatedFields });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Delete Client + Log
export const deleteClient = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: "Client tidak ditemukan" });

        await client.destroy({ transaction });

        await ClientLog.create({
            client_id: client.id,
            changes: "Client dihapus",
            createdby: req.session.userId || client.createdby,
            ip: requestIp.getClientIp(req)
        }, { transaction });

        await transaction.commit();
        res.json({ message: "Client berhasil dihapus" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Get Client Logs
export const getClientLog = async (req, res) => {
    try {
        const { client_id } = req.query;
        if (!client_id) return res.status(400).json({ message: "client_id is required" });

        const logs = await ClientLog.findAll({
            where: { client_id },
            include: {
                model: User,
                attributes: ["fullname"],
            },
            order: [["createdAt", "DESC"]],
        });

        const formattedLogs = logs.map((log) => ({
            created_at: log.createdAt,
            user: log.user?.fullname || "Unknown",
            ip: log.ip,
            changes: log.changes,
        }));

        res.json(formattedLogs);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
