import sequelize from "../config/Database.js";
import { Op } from "sequelize";
import requestIp from "request-ip";
import User from "../models/UserModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import TalentCategoryLog from "../models/TalentCategoryLogModel.js";

export const getTalentCategory = async (req, res) => {
    try {
        const categories = await TalentCategory.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTalentCategoryById = async (req, res) => {
    try {
        const category = await TalentCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Posisi tidak ditemukan" });

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTalentCategory = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const category = await TalentCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: "Posisi tidak ditemukan" });
        const createdby = req.session.userId;
        const updatedFields = {};
        const oldValues = {};

        Object.keys(req.body).forEach((key) => {
            if (category[key] !== req.body[key]) {
                oldValues[key] = category[key];           // nilai sebelum diupdate
                updatedFields[key] = req.body[key];   // nilai sesudah diupdate
            }
        });

        await category.update(updatedFields, { transaction });

        if (Object.keys(updatedFields).length > 0) {
            await TalentCategoryLog.create(
                {
                    talent_category_id: category.id,
                    changes: JSON.stringify({
                        action: "Posisi Pekerja Kreatif Updated",
                        fields: Object.keys(updatedFields),
                        oldValues,           // ✅ nilai lama
                        newValues: updatedFields, // ✅ nilai baru
                    }),
                    createdby,
                    ip: requestIp.getClientIp(req),
                },
                { transaction }
            );
        }

        await transaction.commit();

        res.json({ message: "Posisi Pekerja Kreatiff berhasil diperbarui", data: updatedFields });
    } catch (error) {
        await transaction.rollback();
        console.error("Error saat updateTalentCategory:", error);
        console.log("Session userId:", req.session.userId);
        res.status(500).json({ message: error.message });
    }
};

export const getTalentCategoryLog = async (req, res) => {
    try {
        const { talent_category_id } = req.query;

        if (!talent_category_id) {
            return res.status(400).json({ message: "category_id is required" });
        }

        const logs = await TalentCategoryLog.findAll({
            where: { talent_category_id },
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

export const createTalentCategory = async (req, res) => {

    const createTalentCategoryTransaction = await sequelize.transaction();
    try {
        const createdby = req.session.userId;
        if (!createdby) {
            return res.status(401).json({ message: "Unauthorized: No user session" });
        }

        const talentCategoryData = { ...req.body, createdby };
        const newTalentCategory = await TalentCategory.create(talentCategoryData, { transaction: createTalentCategoryTransaction });

        await TalentCategoryLog.create({
            talent_category_id: newTalentCategory.id,
            changes: JSON.stringify({
                action: "Posisi Pekerja Kreatif Created",
                fields: Object.keys(req.body),
                values: req.body,
            }),
            createdby,
            ip: requestIp.getClientIp(req)
        }, { transaction: createTalentCategoryTransaction });

        await createTalentCategoryTransaction.commit();
        res.status(201).json({ message: "Talent Category & Log created", category: newTalentCategory });
    } catch (error) {
        await createTalentCategoryTransaction.rollback();
        console.error("Create Talent Category Error:", error); // Tambahkan ini
        res.status(500).json({ message: error.message });
    }
};