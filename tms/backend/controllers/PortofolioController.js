import TalentPortofolio from "../models/TalentPortofolioModel.js";
import TalentPortofolioLog from "../models/TalentPortofolioLogModel.js";
import cloudinary from "../utils/cloudinary.js";
import requestIp from "request-ip";
import { v4 as uuidv4 } from "uuid";
import { Sequelize } from "sequelize";
import sequelize from "../config/Database.js";

export const createTalentPortofolio = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, description, talent_id } = req.body; // Ambil talent_id dari body
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File tidak ditemukan." });
        }

        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "portofolio",
            public_id: `portofolio_${uuidv4()}`,
            resource_type: "auto",
        });

        const createdBy = req.session.userId; // Biasanya masih tetap ambil userId dari session

        // Simpan ke tabel portofolio
        const portofolio = await TalentPortofolio.create({
            name,
            description,
            file_link: result.secure_url,
            talent_id, // Gunakan talent_id yang ada di body request
            createdby: createdBy,
        }, { transaction });

        // Simpan log
        await TalentPortofolioLog.create({
            talent_portofolio_id: portofolio.id,
            createdby: createdBy,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Portofolio Created",
                fields: ["name", "description", "file_link", "talent_id"],
                values: {
                    name,
                    description,
                    file_link: result.secure_url,
                    talent_id,
                }
            }),
        }, { transaction });

        await transaction.commit();
        return res.status(201).json({ message: "Portofolio berhasil disimpan" });
    } catch (error) {
        await transaction.rollback();
        console.error("Error createPortofolio:", error);
        return res.status(500).json({ message: "Gagal menyimpan portofolio" });
    }
};
