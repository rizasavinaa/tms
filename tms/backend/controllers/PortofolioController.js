import TalentPortofolio from "../models/TalentPortofolioModel.js";
import TalentPortofolioLog from "../models/TalentPortofolioLogModel.js";
import cloudinary from "../utils/cloudinary.js";
import requestIp from "request-ip";
import { v4 as uuidv4 } from "uuid";
import { Sequelize } from "sequelize";
import sequelize from "../config/Database.js";
import User from "../models/UserModel.js";
import fs from "fs";

const getResourceType = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype === "application/pdf") return "raw";
    return "auto";
};

export const createTalentPortofolio = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, description, talent_id } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File tidak ditemukan." });
        }

        // Buat public_id unik
        const generatedPublicId = `portofolio_${uuidv4()}`;
        const resourceType = getResourceType(file.mimetype);
        

        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "portofolio",
            public_id: generatedPublicId,
            resource_type: resourceType,
        });

        const createdBy = req.session.userId;

        // Simpan ke tabel portofolio termasuk public_id
        const portofolio = await TalentPortofolio.create({
            name,
            description,
            file_link: result.secure_url,
            public_id: result.public_id, // ← disimpan di DB
            resource_type: result.resource_type,
            talent_id,
            createdby: createdBy,
        }, { transaction });

        // Simpan log
        await TalentPortofolioLog.create({
            talent_portofolio_id: portofolio.id,
            createdby: createdBy,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Portofolio Created",
                fields: ["name", "description", "file_link", "public_id", "talent_id"],
                values: {
                    name,
                    description,
                    file_link: result.secure_url,
                    public_id: result.public_id,
                    talent_id,
                }
            }),
        }, { transaction });

        // Menghapus file sementara setelah upload berhasil
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("Error while deleting temporary file:", err);
            } else {
                console.log("Temporary file deleted successfully.");
            }
        });

        await transaction.commit();
        return res.status(201).json({ message: "Portofolio berhasil disimpan" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error createPortofolio:", error);

        // Menghapus file sementara jika terjadi error
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("Error while deleting temporary file on error:", err);
            }
        });

        return res.status(500).json({ message: "Gagal menyimpan portofolio" });
    }
};


export const getTalentPortofolio = async (req, res) => {
    try {
        const portofolios = await TalentPortofolio.findAll({
            order: [['id', 'DESC']],
            attributes: ['id', 'name', 'description', 'file_link', 'createdAt']
        });
        res.status(200).json(portofolios);
    } catch (error) {
        console.error("Error getAllTalentPortofolio:", error);
        res.status(500).json({ message: "Gagal mengambil data portofolio" });
    }
};

export const getTalentPortofolioById = async (req, res) => {
    try {
        const portofolio = await TalentPortofolio.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description', 'file_link', 'createdAt', 'talent_id']
        });

        if (!portofolio) {
            return res.status(404).json({ message: "Portofolio tidak ditemukan" });
        }

        res.status(200).json(portofolio);
    } catch (error) {
        console.error("Error getTalentPortofolioById:", error);
        res.status(500).json({ message: "Gagal mengambil detail portofolio" });
    }
};

export const updateTalentPortofolioDescription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { description } = req.body;
        const { id } = req.params;

        const portofolio = await TalentPortofolio.findByPk(id);
        if (!portofolio) {
            return res.status(404).json({ message: "Portofolio tidak ditemukan" });
        }

        const oldDescription = portofolio.description;
        const updatedBy = req.session.userId;

        await portofolio.update({ description }, { transaction });

        await TalentPortofolioLog.create({
            talent_portofolio_id: id,
            createdby: updatedBy,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Description Updated",
                fields: ["description"],
                values: {
                    old: oldDescription,
                    new: description
                }
            }),
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: "Deskripsi berhasil diperbarui" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error updateDescription:", error);
        res.status(500).json({ message: "Gagal memperbarui deskripsi" });
    }
};

export const deleteTalentPortofolio = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const portofolio = await TalentPortofolio.findByPk(id);

        if (!portofolio) {
            return res.status(404).json({ message: "Portofolio tidak ditemukan" });
        }

        // Hapus dari Cloudinary jika ada public_id
        if (portofolio.public_id) {
            await cloudinary.uploader.destroy(portofolio.public_id, {
                resource_type: portofolio.resource_type || "raw", // default fallback
            });
        }

        // Simpan log sebelum hapus
        await TalentPortofolioLog.create({
            talent_portofolio_id: id,
            createdby: req.session.userId,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Portofolio Deleted",
                fields: ["name", "description", "file_link", "public_id", "resource_type"],
                values: {
                    name: portofolio.name,
                    description: portofolio.description,
                    file_link: portofolio.file_link,
                    public_id: portofolio.public_id,
                    resource_type: portofolio.resource_type
                }
            }),
        }, { transaction });

        // Hapus dari DB
        await portofolio.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({ message: "Portofolio berhasil dihapus" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleteTalentPortofolio:", error);
        res.status(500).json({ message: "Gagal menghapus portofolio" });
    }
};

export const getTalentPortofolioLog = async (req, res) => {
    try {
        const { talent_portofolio_id } = req.query;

        if (!talent_portofolio_id) {
            return res.status(400).json({ message: "porto_id is required" });
        }

        const logs = await TalentPortofolioLog.findAll({
            where: { talent_portofolio_id },
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
        console.error("Error fetching logs:", error.message, error.stack);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


