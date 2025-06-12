import TalentWorkProof from "../models/TalentWorkProofModel.js";
import TalentWorkProofLog from "../models/TalentWorkProofLogModel.js";
import cloudinary from "../utils/cloudinary.js";
import requestIp from "request-ip";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../config/Database.js";
import User from "../models/UserModel.js";
import fs from "fs";
import Talent from "../models/TalentModel.js";
import Client from "../models/ClientModel.js";
import TalentWorkHistory from "../models/TalentWorkHistoryModel.js";
import { promisify } from "util";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Op } from "sequelize";
import xlsx from "xlsx";

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

const getResourceType = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype === "application/pdf") return "raw";
    return "auto";
};

export const getAllTalentWorkProof = async (req, res) => {
    try {
        const { search = "", filter = "id", startDate, endDate } = req.query;
        const where = {};

        if (startDate || endDate) {
            where.start_date = {};
            if (startDate) where.start_date[Op.gte] = new Date(startDate);
            if (endDate) where.start_date[Op.lte] = new Date(endDate);
        }

        if (filter === "id" && search.trim() !== "") {
            where.id = { [Op.like]: `%${search}%` };
        }

        const include = [
            {
                model: Talent,
                attributes: ["name"],
                required: filter === "talent_name" && search.trim() !== "",
                where:
                    filter === "talent_name" && search.trim() !== ""
                        ? { name: { [Op.like]: `%${search}%` } }
                        : undefined,
            },
            {
                model: Client,
                attributes: ["name"],
                required: filter === "client_name" && search.trim() !== "",
                where:
                    filter === "client_name" && search.trim() !== ""
                        ? { name: { [Op.like]: `%${search}%` } }
                        : undefined,
            },
            {
                model: TalentWorkHistory,
                attributes: ["category"],
                required: filter === "category" && search.trim() !== "",
                where:
                    filter === "category" && search.trim() !== ""
                        ? { category: { [Op.like]: `%${search}%` } }
                        : undefined,
            },
        ];

        console.log("WHERE:", where);
        console.log("FILTER:", filter);
        console.log("SEARCH:", search);

        const data = await TalentWorkProof.findAll({
            where,
            include,
            order: [["id", "DESC"]],
            logging: console.log,
        });

        res.status(200).json({ data: data.map((item) => item.toJSON()) });
    } catch (error) {
        console.error("Error getAllTalentWorkProof:", error);
        res.status(500).json({ message: "Gagal mengambil data" });
    }
};

export const exportTalentWorkProofExcel = async (req, res) => {
    try {
        const { search = "", filter = "id", startDate, endDate } = req.query;
        const where = {};

        // Filter tanggal
        if (startDate || endDate) {
            where.start_date = {};
            if (startDate) where.start_date[Op.gte] = new Date(startDate);
            if (endDate) where.start_date[Op.lte] = new Date(endDate);
        }

        // Filter berdasarkan kolom utama
        if (filter === "id" && search) {
            where.id = { [Op.like]: `%${search}%` };
        }

        // Setup include dan filter relasi
        const include = [
            {
                model: Talent,
                attributes: ["name"],
                required: filter === "talent_name",
                where: filter === "talent_name" ? { name: { [Op.like]: `%${search}%` } } : undefined,
            },
            {
                model: Client,
                attributes: ["name"],
                required: filter === "client_name",
                where: filter === "client_name" ? { name: { [Op.like]: `%${search}%` } } : undefined,
            },
            {
                model: TalentWorkHistory,
                attributes: ["category"],
                required: filter === "category",
                where: filter === "category" ? { category: { [Op.like]: `%${search}%` } } : undefined,
            },
        ];

        // Ambil data dari DB
        const data = await TalentWorkProof.findAll({
            where,
            include,
            order: [["id", "DESC"]],
        });

        // Format data jadi array objek biasa untuk Excel
        const exportData = data.map((item) => {
            const json = item.toJSON();
            return {
                ID: json.id,
                "Nama Perusahaan": json.client?.name || "",
                "Nama Pekerja Kreatif": json.talent?.name || "",
                Posisi: json.talent_work_history?.category || "",
                "Periode Mulai": new Date(json.start_date).toLocaleDateString("id-ID"),
                "Periode Berakhir": new Date(json.end_date).toLocaleDateString("id-ID"),
                "Status Penilaian": json.validation_status,
                "Status Pembayaran": json.payment_status,
            };
        });

        // Buat worksheet dari data JSON
        const worksheet = xlsx.utils.json_to_sheet(exportData);

        // Buat workbook dan masukkan worksheet
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Bukti Kerja");

        // Buat buffer excel dari workbook
        const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Set header supaya file terdownload
        res.setHeader("Content-Disposition", "attachment; filename=laporan_bukti_kerja.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        // Kirim file excel sebagai response
        res.send(excelBuffer);

    } catch (error) {
        console.error("Error exportTalentWorkProofExcel:", error);
        res.status(500).json({ message: "Gagal mengekspor data" });
    }
};

export const getTalentWorkProofById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await TalentWorkProof.findByPk(id, {
            include: [
                { model: Talent, attributes: ["name"] },
                { model: Client, attributes: ["name"] },
                { model: TalentWorkHistory, attributes: ["category"] }
            ]
        });

        if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
        res.status(200).json(data);
    } catch (error) {
        console.error("Error getTalentWorkProofById:", error);
        res.status(500).json({ message: "Gagal mengambil detail data" });
    }
};

export const getTalentWorkProofByTalentId = async (req, res) => {
    try {
        const { talent_id } = req.params;

        const {
            search = "",
            filter = "id",
            filterStartDate,
            filterEndDate,
            sortColumn = "id",
            sortOrder = "asc",
            page = 1,
            limit = 10,
            validation_status, // ⬅️ Tambahan di sini
        } = req.query;

        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 10;
        const offset = (pageInt - 1) * limitInt;

        const where = { talent_id };

        // Filter search
        if (search) {
            if (filter === "client_name") {
                // nanti difilter via include Client
            } else {
                where[filter] = { [Op.like]: `%${search}%` };
            }
        }

        // Filter tanggal mulai dan akhir
        if (filterStartDate) {
            where.start_date = { ...(where.start_date || {}), [Op.gte]: filterStartDate };
        }
        if (filterEndDate) {
            where.end_date = { ...(where.end_date || {}), [Op.lte]: filterEndDate };
        }

        // ⬅️ Filter opsional validation_status
        if (validation_status !== undefined) {
            where.validation_status = validation_status;
        }

        const include = [];
        if (filter === "client_name") {
            include.push({
                model: Client,
                as: "client",
                where: {
                    name: { [Op.like]: `%${search}%` },
                },
                attributes: ["id", "name"],
                required: true,
            });
        } else {
            include.push({
                model: Client,
                as: "client",
                attributes: ["id", "name"],
            });
        }

        const sortableColumns = [
            "id",
            "start_date",
            "end_date",
            "validation_status",
            "payment_status",
        ];
        let order = [["id", "DESC"]];
        if (sortableColumns.includes(sortColumn)) {
            order = [[sortColumn, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
        }

        const { rows, count } = await TalentWorkProof.findAndCountAll({
            where,
            include,
            order,
            limit: limitInt,
            offset,
        });

        const data = rows.map((row) => ({
            id: row.id,
            talent_id: row.talent_id,
            description: row.description,
            start_date: row.start_date,
            end_date: row.end_date,
            validation_status: row.validation_status,
            payment_status: row.payment_status,
            client_id: row.client_id,
            client_name: row.client?.name || null,
            file_link: row.file_link,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            talent_name: row.talent?.name || null,
        }));

        res.status(200).json({
            total: count,
            page: pageInt,
            perPage: limitInt,
            data,
        });
    } catch (error) {
        console.error("Error getTalentWorkProofByTalentId:", error);
        res.status(500).json({ message: "Gagal mengambil data berdasarkan talent_id" });
    }
};

export const getTalentWorkProofLog = async (req, res) => {
    try {
        const { talent_work_proof_id } = req.query;
        if (!talent_work_proof_id) {
            return res.status(400).json({ message: "ID log tidak ditemukan" });
        }

        const logs = await TalentWorkProofLog.findAll({
            where: { talent_work_proof_id },
            include: { model: User, attributes: ["fullname"] },
            order: [["createdAt", "DESC"]]
        });

        const formattedLogs = logs.map(log => ({
            created_at: log.createdAt,
            user: log.user ? log.user.fullname : "Unknown",
            ip: log.ip,
            changes: log.changes,
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error("Error getTalentWorkProofLog:", error);
        res.status(500).json({ message: "Gagal mengambil log" });
    }
};

export const deleteTalentWorkProof = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const proof = await TalentWorkProof.findByPk(id);
        if (!proof) {
            return res.status(404).json({ message: "Data bukti kerja tidak ditemukan" });
        }

        // Hapus file dari Cloudinary jika public_id ada
        if (proof.public_id) {
            try {
                await cloudinary.uploader.destroy(proof.public_id, {
                    resource_type: proof.resource_type || "raw",
                    invalidate: true,
                });
            } catch (err) {
                console.error("Gagal hapus file di Cloudinary:", err);
            }
        }

        // Simpan log penghapusan
        await TalentWorkProofLog.create({
            talent_work_proof_id: id,
            createdby: req.session.userId,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Delete TalentWorkProof",
                fields: [
                    "description", "file_link", "public_id", "resource_type",
                    "validation_status", "validation_message",
                    "salary", "payment_status", "start_date", "end_date",
                    "talent_id", "client_id"
                ],
                values: {
                    description: proof.description,
                    file_link: proof.file_link,
                    public_id: proof.public_id,
                    resource_type: proof.resource_type,
                    validation_status: proof.validation_status,
                    validation_message: proof.validation_message,
                    salary: proof.salary,
                    payment_status: proof.payment_status,
                    start_date: proof.start_date,
                    end_date: proof.end_date,
                    talent_id: proof.talent_id,
                    client_id: proof.client_id
                }
            })
        }, { transaction });

        // Hapus data dari DB
        await proof.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: "Data bukti kerja berhasil dihapus" });
    } catch (error) {
        await transaction.rollback();
        console.error("Gagal menghapus TalentWorkProof:", error);
        res.status(500).json({ message: "Gagal menghapus data bukti kerja" });
    }
};

export const createTalentWorkProof = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            talent_id,
            description,
            start_date,
            end_date,
        } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "File tidak ditemukan." });
        }

        // Ambil talent dan kontrak aktif
        const talent = await Talent.findByPk(talent_id);
        if (!talent) {
            return res.status(404).json({ message: "Talent tidak ditemukan." });
        }

        const activeContract = await TalentWorkHistory.findOne({
            where: {
                talent_id: talent_id,
                client_id: talent.client_id,
                start_date: { [Op.lte]: end_date },
                end_date: { [Op.gte]: start_date }
            },
        });


        if (!activeContract) {
            return res.status(400).json({ message: "Talent tidak memiliki kontrak aktif untuk periode tersebut." });
        }

        const salaryFromContract = activeContract.salary || 0;
        const generatedPublicId = `talent_work_proof_${uuidv4()}`;
        const resourceType = getResourceType(file.mimetype);

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "bukti-kerja",
            public_id: generatedPublicId,
            resource_type: resourceType,
        });

        const createdby = req.session.userId;

        const proof = await TalentWorkProof.create({
            talent_id,
            description,
            file_link: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            start_date,
            end_date,
            client_id: activeContract.client_id,
            salary: salaryFromContract,
            talent_work_history_id: activeContract.id,
            createdby,
        }, { transaction });

        await TalentWorkProofLog.create({
            talent_work_proof_id: proof.id,
            createdby,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Create Bukti Kerja",
                fields: [
                    "talent_id", "description", "file_link", "public_id", "resource_type",
                    "start_date", "end_date", "client_id", "talent_work_history_id"
                ],
                values: {
                    talent_id,
                    description,
                    file_link: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type,
                    start_date,
                    end_date,
                    client_id: activeContract.client_id,
                    talent_work_history_id: activeContract.talent_work_history_id
                }
            }),
        }, { transaction });

        await unlinkAsync(file.path);

        await transaction.commit();
        await sendWorkProofNotificationEmail(
            proof.talent_id,
            proof.start_date,
            proof.end_date,
            proof.file_link,
            proof.id
        );

        res.status(201).json({ message: "Data bukti kerja berhasil disimpan" });
    } catch (error) {
        await transaction.rollback();
        console.error("Gagal menyimpan TalentWorkProof:", error);

        if (req.file) {
            await unlinkAsync(req.file.path).catch(() => { });
        }

        res.status(500).json({ message: "Gagal menyimpan data bukti kerja" });
    }
};

export const sendWorkProofNotificationEmail = async (talentId, startDate, endDate, fileLink, workProofId) => {
    try {
        // Ambil data talent dulu
        const talent = await Talent.findByPk(talentId);
        if (!talent) {
            console.error("Talent tidak ditemukan.");
            return;
        }

        // Ambil client_id dari talent
        const clientId = talent.client_id;
        if (!clientId) {
            console.error("Talent belum memiliki client_id.");
            return;
        }

        // Ambil data client berdasarkan client_id
        const client = await Client.findByPk(clientId);
        if (!client || !client.email) {
            console.error("Email client tidak ditemukan.");
            return;
        }

        const email = client.email;
        const talentName = talent.name;
        const periode = `${startDate} s.d ${endDate}`;
        const detailLink = `${process.env.FRONTEND_URL}/client/bukti-kerja/${workProofId}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Notifikasi Bukti Kerja Talent",
            html: `
        <p>Halo,</p>
        <p>Talent <strong>${talentName}</strong> telah meregistrasi bukti kerja untuk periode:</p>
        <p><strong>${periode}</strong></p>
        <p>Silakan periksa detailnya melalui link berikut:</p>
        <p><a href="${detailLink}">${detailLink}</a></p>
        <p>Atau akses file langsung:</p>
        <p><a href="${fileLink}">${fileLink}</a></p>
        <p>Terima kasih.</p>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email notifikasi berhasil dikirim ke client:", info.response);
    } catch (error) {
        console.error("🔥 Gagal mengirim email notifikasi client:", error);
    }
};

export const updateTalentWorkProof = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            description,
            start_date,
            end_date,
        } = req.body;

        const proof = await TalentWorkProof.findByPk(id);
        if (!proof) {
            return res.status(404).json({ message: "Data bukti kerja tidak ditemukan" });
        }

        const updatedFields = {};
        const oldValues = {};
        const updatedBy = req.session.userId;

        // Cek perubahan field yang bisa diubah
        if (description !== undefined && description !== proof.description) {
            updatedFields.description = description;
            oldValues.description = proof.description;
        }
        if (start_date !== undefined && new Date(start_date).toISOString() !== proof.start_date.toISOString()) {
            updatedFields.start_date = start_date;
            oldValues.start_date = proof.start_date;
        }
        if (end_date !== undefined && new Date(end_date).toISOString() !== proof.end_date.toISOString()) {
            updatedFields.end_date = end_date;
            oldValues.end_date = proof.end_date;
        }

        // Update file jika ada file baru
        if (req.file) {
            if (proof.public_id) {
                try {
                    await cloudinary.uploader.destroy(proof.public_id, {
                        resource_type: proof.resource_type || "raw",
                        invalidate: true,
                    });
                } catch (err) {
                    console.error("Gagal hapus file lama di Cloudinary:", err);
                }
            }

            const generatedPublicId = `talent_work_proof_${uuidv4()}`;
            const resourceType = getResourceType(req.file.mimetype);

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "talent_work_proof",
                public_id: generatedPublicId,
                resource_type: resourceType,
            });

            updatedFields.file_link = result.secure_url;
            updatedFields.public_id = result.public_id;
            updatedFields.resource_type = result.resource_type;

            oldValues.file_link = proof.file_link;
            oldValues.public_id = proof.public_id;
            oldValues.resource_type = proof.resource_type;

            await unlinkAsync(req.file.path);
        }

        if (Object.keys(updatedFields).length === 0) {
            await transaction.rollback();
            return res.status(200).json({ message: "Tidak ada perubahan yang ditemukan" });
        }

        await proof.update(updatedFields, { transaction });

        await TalentWorkProofLog.create({
            talent_work_proof_id: id,
            createdby: updatedBy,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: "Update TalentWorkProof",
                fields: Object.keys(updatedFields),
                oldValues,
                newValues: updatedFields,
            }),
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: "Data bukti kerja berhasil diperbarui" });
    } catch (error) {
        await transaction.rollback();
        console.error("Gagal memperbarui TalentWorkProof:", error);

        if (req.file) {
            await unlinkAsync(req.file.path).catch(() => { });
        }

        res.status(500).json({ message: "Gagal memperbarui data bukti kerja" });
    }
};

export const checkOverlapWorkProof = async (req, res) => {
    try {
        const { talent_id, start_date, end_date, excludeId } = req.body;

        const whereCondition = {
            talent_id,
            [Op.or]: [
                {
                    start_date: { [Op.lte]: end_date },
                    end_date: { [Op.gte]: start_date },
                },
            ],
        };

        if (excludeId) {
            whereCondition.id = { [Op.ne]: excludeId };
        }

        const overlap = await TalentWorkProof.findOne({ where: whereCondition });

        if (overlap) {
            return res.json({ overlap: true, message: "Periode bukti kerja bertabrakan dengan data lain." });
        }


        // Cek apakah periode bukti kerja 100% berada di dalam periode kontrak aktif talent
        const talent = await Talent.findByPk(talent_id);
        if (!talent) {
            return res.status(404).json({ message: "Talent tidak ditemukan." });
        }

        const { fn, col, where } = sequelize;

        const activeContract = await TalentWorkHistory.findOne({
            where: {
                talent_id,
                client_id: talent.client_id,
                [Op.and]: [
                    where(fn('DATE', col('start_date')), '<=', fn('DATE', start_date)),
                    where(fn('DATE', col('end_date')), '>=', fn('DATE', end_date)),
                ],
            },
        });

        if (!activeContract) {
            return res.json({ overlap: false, contractValid: false, message: "Periode bukti kerja harus berada di dalam periode kontrak aktif." });
        }

        // Jika lolos semua cek
        return res.json({ overlap: false, contractValid: true, message: "Periode bukti kerja valid dan tidak overlap." });

    } catch (error) {
        console.error("Gagal cek periode bukti kerja:", error);
        return res.status(500).json({ message: "Gagal memeriksa periode bukti kerja." });
    }
};

export const exportReportPembayaran = async (req, res) => {
    try {
        const {
            talent_id,
            startDate,
            endDate,
            search = "",
            filter = "id",
            sortColumn = "id",
            sortOrder = "asc",
        } = req.query;

        if (!talent_id) {
            return res.status(400).json({ message: "Talent ID wajib diisi" });
        }

        // Build where clause
        const whereClause = {
            talent_id,
            validation_status: 1, // hanya yang sudah divalidasi
        };

        if (startDate && endDate) {
            whereClause.start_date = { [Op.gte]: new Date(startDate) };
            whereClause.end_date = { [Op.lte]: new Date(endDate) };
        }

        if (search) {
            if (filter !== "client_name") {
                // Filter by other columns in TalentWorkProof (misal id)
                whereClause[filter] = { [Op.like]: `%${search}%` };
            }
            // kalau filter = client_name, nanti filter di array hasil fetch
        }

        // Ambil data dengan relasi Client dan alias 'client' (harus sesuai definisi relasi di model)
        const proofs = await TalentWorkProof.findAll({
            where: whereClause,
            include: [
                {
                    model: Client,
                    as: "client",  // PENTING: sesuaikan dengan alias relasi di model TalentWorkProof
                    attributes: ["name"],
                    required: filter === "client_name" && search ? true : false, // kalau filter client_name dan ada search, wajib join yg matching
                    where:
                        filter === "client_name" && search
                            ? { name: { [Op.like]: `%${search}%` } }
                            : undefined,
                },
            ],
            order: [[sortColumn, sortOrder.toUpperCase()]],
        });

        // Jika filter client_name tapi tidak pakai where di include, filter manual di array
        let filteredProofs = proofs;
        if (filter === "client_name" && search && !(filter === "client_name" && search)) {
            filteredProofs = proofs.filter((proof) =>
                proof.client?.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Prepare data excel
        const data = filteredProofs.map((proof) => ({
            ID: proof.id,
            "Nama Perusahaan": proof.client?.name || "-",
            "Periode Mulai": proof.start_date
                ? new Date(proof.start_date).toLocaleDateString("id-ID")
                : "-",
            "Periode Berakhir": proof.end_date
                ? new Date(proof.end_date).toLocaleDateString("id-ID")
                : "-",
            "Status Pembayaran": proof.payment_status === 1 ? "Paid" : "Unpaid",
        }));

        // Header kolom
        const excelData = [
            ["ID", "Nama Perusahaan", "Periode Mulai", "Periode Berakhir", "Status Pembayaran"],
            ...data.map((row) => Object.values(row)),
        ];

        // Buat workbook dan sheet
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(excelData);
        xlsx.utils.book_append_sheet(wb, ws, "Laporan Pembayaran");

        // Generate buffer Excel
        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

        // Kirim file sebagai attachment
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=laporan_pembayaran_${Date.now()}.xlsx`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.send(buffer);
    } catch (error) {
        console.error("Error export laporan pembayaran:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTalentWorkProofByClientId = async (req, res) => {
    try {
        const { client_id } = req.params;

        const {
            search = "",
            filter = "id",
            filterStartDate,
            filterEndDate,
            sortColumn = "id",
            sortOrder = "asc",
            page = 1,
            limit = 10,
            validation_status, // ⬅️ Tambahan di sini
        } = req.query;

        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 10;
        const offset = (pageInt - 1) * limitInt;

        const where = { client_id };

        // Filter search
        if (search) {
            if (filter === "talent_name") {
                // nanti difilter via include Client
            } else {
                where[filter] = { [Op.like]: `%${search}%` };
            }
        }

        // Filter tanggal mulai dan akhir
        if (filterStartDate) {
            where.start_date = { ...(where.start_date || {}), [Op.gte]: filterStartDate };
        }
        if (filterEndDate) {
            where.end_date = { ...(where.end_date || {}), [Op.lte]: filterEndDate };
        }

        // ⬅️ Filter opsional validation_status
        if (validation_status !== undefined) {
            where.validation_status = validation_status;
        }

        const include = [];

        // Client include
        if (filter === "client_name") {
            include.push({
                model: Client,
                as: "client",
                where: {
                    name: { [Op.like]: `%${search}%` },
                },
                attributes: ["id", "name"],
                required: true,
            });
        } else {
            include.push({
                model: Client,
                as: "client",
                attributes: ["id", "name"],
            });
        }

        // Talent include
        if (filter === "talent_name") {
            include.push({
                model: Talent,
                as: "talent",
                where: {
                    name: { [Op.like]: `%${search}%` },
                },
                attributes: ["id", "name"],
                required: true,
            });
        } else {
            include.push({
                model: Talent,
                as: "talent",
                attributes: ["id", "name"],
            });
        }


        const sortableColumns = [
            "id",
            "start_date",
            "end_date",
            "validation_status",
            "payment_status",
        ];
        let order = [["id", "DESC"]];
        if (sortableColumns.includes(sortColumn)) {
            order = [[sortColumn, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]];
        }

        const { rows, count } = await TalentWorkProof.findAndCountAll({
            where,
            include,
            order,
            limit: limitInt,
            offset,
        });

        const data = rows.map((row) => ({
            id: row.id,
            talent_id: row.talent_id,
            description: row.description,
            start_date: row.start_date,
            end_date: row.end_date,
            validation_status: row.validation_status,
            payment_status: row.payment_status,
            client_id: row.client_id,
            client_name: row.client?.name || null,
            file_link: row.file_link,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            talent_name: row.talent?.name || null,
        }));

        res.status(200).json({
            total: count,
            page: pageInt,
            perPage: limitInt,
            data,
        });
    } catch (error) {
        console.error("Error getTalentWorkProofByClientId:", error);
        res.status(500).json({ message: "Gagal mengambil data berdasarkan client_id" });
    }
};

export const validateTalentWorkProof = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { validation_status, validation_message } = req.body;
        const updatedby = req.session.userId;

        const proof = await TalentWorkProof.findByPk(id);
        if (!proof) {
            return res.status(404).json({ message: "Bukti kerja tidak ditemukan." });
        }

        // Update validasi
        await proof.update({
            validation_status,
            validation_message,
            updatedby,
        }, { transaction });

        // Simpan log
        await TalentWorkProofLog.create({
            talent_work_proof_id: proof.id,
            createdby: updatedby,
            ip: requestIp.getClientIp(req),
            changes: JSON.stringify({
                action: validation_status === 1 ? "Validasi Diterima" : "Validasi Ditolak",
                fields: ["validation_status", "validation_message"],
                values: { validation_status, validation_message },
            }),
        }, { transaction });

        // Kirim email ke talent
        await sendValidationResultEmail(
            proof.talent_id,
            validation_status,
            validation_message,
            `${process.env.FRONTEND_URL}/pekerjakreatif/bukti-kerja/${proof.id}`
        );

        await transaction.commit();
        return res.status(200).json({ message: "Validasi berhasil disimpan." });
    } catch (error) {
        await transaction.rollback();
        console.error("Gagal menyimpan validasi bukti kerja:", error);
        return res.status(500).json({ message: "Gagal menyimpan validasi." });
    }
};

export const sendValidationResultEmail = async (talentId, status, message, detailLink) => {
    try {
        const talent = await Talent.findByPk(talentId);
        if (!talent || !talent.email) {
            console.error("Email talent tidak ditemukan.");
            return;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const statusText = status === 1 ? "DITERIMA ✅" : "DITOLAK ❌";

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: talent.email,
            subject: `Status Validasi Bukti Kerja: ${statusText}`,
            html: `
                <p>Halo <strong>${talent.name}</strong>,</p>
                <p>Bukti kerja Anda telah <strong>${status === 1 ? "DITERIMA" : "DITOLAK"}</strong> oleh supervisor perusahaan klien.</p>
                <p><strong>Pesan Validasi:</strong></p>
                <p>${message || "(Tidak ada pesan)"}</p>
                <p>Silakan lihat detailnya di link berikut:</p>
                <p><a href="${detailLink}">${detailLink}</a></p>
                <p>Terima kasih.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email validasi berhasil dikirim ke talent:", info.response);
    } catch (error) {
        console.error("🔥 Gagal mengirim email validasi ke talent:", error);
    }
};

