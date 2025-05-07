import Talent from "../models/TalentModel.js";
import TalentLog from "../models/TalentLogModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import TalentStatus from "../models/TalentStatusModel.js";
import requestIp from "request-ip";
import sequelize from "../config/Database.js";

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

// 🔹 Create Talent + Log
export const createTalent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const createdBy = req.session.userId;
        if (!createdBy) {
            return res.status(401).json({ message: "Unauthorized: No user session" });
        }

        const talentData = { ...req.body, createdby: createdBy };
        const newTalent = await Talent.create(talentData, { transaction });

        await TalentLog.create({
            talent_id: newTalent.id,
            changes: JSON.stringify({
                action: "Talent Created",
                fields: Object.keys(req.body),
                values: req.body,
            }),
            createdby: createdBy,
            ip: requestIp.getClientIp(req),
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: "Talent & Log created", talent: newTalent });
    } catch (error) {
        await transaction.rollback();
        console.error("Create Talent Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🔹 Update Talent + Log
export const updateTalent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const talent = await Talent.findByPk(req.params.id);
        if (!talent) return res.status(404).json({ message: "Talent tidak ditemukan" });

        const createdBy = req.session.userId;
        const updatedFields = {};
        const oldValues = {};

        Object.keys(req.body).forEach((key) => {
            if (talent[key] !== req.body[key]) {
                oldValues[key] = talent[key];
                updatedFields[key] = req.body[key];
            }
        });

        await talent.update(updatedFields, { transaction });

        if (Object.keys(updatedFields).length > 0) {
            await TalentLog.create({
                talent_id: talent.id,
                changes: JSON.stringify({
                    action: "Talent Updated",
                    fields: Object.keys(updatedFields),
                    oldValues,
                    newValues: updatedFields,
                }),
                createdby: createdBy,
                ip: requestIp.getClientIp(req),
            }, { transaction });
        }

        await transaction.commit();
        res.json({ message: "Talent berhasil diperbarui", data: updatedFields });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};
