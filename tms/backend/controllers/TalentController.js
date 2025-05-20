import Talent from "../models/TalentModel.js";
import TalentLog from "../models/TalentLogModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import TalentStatus from "../models/TalentStatusModel.js";
import requestIp from "request-ip";
import sequelize from "../config/Database.js";
import User from "../models/UserModel.js";
import UserLog from "../models/UserLogModel.js";
import { createUserInternal } from "./UserController.js";
import { now } from "sequelize/lib/utils";

export const createTalent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const createdby = req.session.userId;
        if (!createdby) return res.status(401).json({ message: "Unauthorized: No user session" });

        const ip = requestIp.getClientIp(req);
        const { name, email } = req.body;

        console.log("CreateUserInternal Params:", { email, fullname: name, createdby: createdby });

        // 1. Buat User dulu
        const newUser = await createUserInternal({
            email,
            fullname: name,
            role_id: 3,
            createdby: createdby,
            ip,
            transaction,
        });

        // 2. Simpan Talent dengan user_id dari User baru
        const talentData = {
            ...req.body,
            user_id: newUser.id,
            createdby: createdby,
            status_id: 1
        };
        const newTalent = await Talent.create(talentData, { transaction });

        // 3. Simpan log Talent
        await TalentLog.create({
            talent_id: newTalent.id,
            changes: JSON.stringify({
                action: "Talent Created",
                fields: Object.keys(req.body),
                values: req.body,
            }),
            createdby: createdby,
            ip,
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: "Talent & User created", talent: newTalent });
    } catch (error) {
        await transaction.rollback();
        console.error("Create Talent Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Get All Talents
export const getTalents = async (req, res) => {
    try {
        const talents = await Talent.findAll({
            include: [
                { model: TalentCategory, attributes: ['name'] },
                { model: TalentStatus, attributes: ['name'] },
            ],
        });
        res.json(talents);
    } catch (error) {
        console.error("Get talents error:", error); // log ke server
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Get Talent by ID
export const getTalentById = async (req, res) => {
    try {
        const talent = await Talent.findByPk(req.params.id, {
            include: [
                { model: TalentCategory, attributes: ['name'] },
                { model: TalentStatus, attributes: ['name'] },
            ],
        });
        if (!talent) return res.status(404).json({ message: "Talent tidak ditemukan" });
        res.json(talent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Update Talent + Log + Sync to User table
export const updateTalent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const talent = await Talent.findByPk(req.params.id);
        if (!talent) return res.status(404).json({ message: "Talent tidak ditemukan" });

        const createdby = req.session.userId;
        const updatedFields = {};
        const oldValues = {};

        Object.keys(req.body).forEach((key) => {
            if (talent[key] !== req.body[key]) {
                oldValues[key] = talent[key];
                updatedFields[key] = req.body[key];
            }
        });

        // Update Talent data
        await talent.update(updatedFields, { transaction });

        // Jika ada perubahan dan Talent punya user_id
        if (Object.keys(updatedFields).length > 0 && talent.user_id) {
            const user = await User.findByPk(talent.user_id, { transaction });
            const userUpdates = {};
            if (updatedFields.name) userUpdates.fullname = updatedFields.name;
            if (updatedFields.email) userUpdates.email = updatedFields.email;

            if (Object.keys(userUpdates).length > 0 && user) {
                await user.update(userUpdates, { transaction });
            }

            // Simpan log perubahan
            await TalentLog.create({
                talent_id: talent.id,
                changes: JSON.stringify({
                    action: "Talent Updated",
                    fields: Object.keys(updatedFields),
                    oldValues,
                    newValues: updatedFields,
                }),
                createdby: createdby,
                ip: requestIp.getClientIp(req),
            }, { transaction });

            if (userUpdates) {
                await UserLog.create({
                    user_id: user.id,
                    changes: JSON.stringify({
                        action: "User Updated via menu Pekerja Kreatif di modul Karyawan",
                        fields: Object.keys(updatedFields),
                        oldValues,
                        newValues: updatedFields,
                    }),
                    createdby: createdby,
                    ip: requestIp.getClientIp(req),
                }, { transaction });
            }
        }

        await transaction.commit();
        res.json({ message: "Talent berhasil diperbarui", data: updatedFields });
    } catch (error) {
        await transaction.rollback();
        console.error("❌ Error updateTalent:", error);
        res.status(500).json({ message: error.message });
    }
};


export const getTalentLog = async (req, res) => {
    try {
        const { talent_id } = req.query;

        if (!talent_id) {
            return res.status(400).json({ message: "talent_id is required" });
        }

        const logs = await TalentLog.findAll({
            where: { talent_id },
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

export const getActiveTalentsByClient = async (req, res) => {
  try {
    const client_id = req.params.id;

    const talents = await Talent.findAll({
      where: {
        client_id: client_id,
        status_id: 2, // status aktif
      },
      include: [
        {
          model: TalentStatus,
          attributes: ['name'],
        },
        {
          model: TalentCategory,
          attributes: ['name'],
        },
      ],
      order: [['id', 'ASC']],
    });

    const formatted = talents.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      position: t.TalentCategory?.name || "-",
      status: t.TalentStatus?.name || "-",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching talents by client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
