import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cloudinary from "../config/Cloudinary.js";
import sequelize from "../config/Database.js";
import TalentWorkHistory from "../models/TalentWorkHistoryModel.js";
import TalentWorkHistoryLog from "../models/TalentWorkHistoryLogModel.js";
import Talent from "../models/TalentModel.js";
import TalentLog from "../models/TalentLogModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import requestIp from "request-ip";
import Client from "../models/ClientModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "raw";
  return "auto";
};

export const createTalentWorkHistory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      salary,
      start_date,
      end_date,
      description
    } = req.body;
    const file = req.file;
    const talent_id = req.params.id;

    let { client_id } = req.body;
    const parsedClientId = client_id === "other" ? 0 : parseInt(client_id, 10);

    if (!file) {
      return res.status(400).json({ message: "File tidak ditemukan." });
    }

    const generatedPublicId = `kontrak_${uuidv4()}`;
    const resourceType = getResourceType(file.mimetype);

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "kontrak",
      public_id: generatedPublicId,
      resource_type: resourceType,
    });

    const createdby = req.session.userId;

    // Ambil talent dan kategori-nya
    const talent = await Talent.findByPk(talent_id, {
      include: [
        {
          model: TalentCategory,
          attributes: ['name'],
        }
      ]
    });

    if (!talent) {
      return res.status(404).json({ message: "Talent tidak ditemukan." });
    }

    // Ambil nama kategorinya dari relasi
    const category = talent.talent_category?.name || "Tidak diketahui";

    const workHistory = await TalentWorkHistory.create(
      {
        salary,
        start_date,
        end_date,
        talent_id,
        client_id: parsedClientId,
        description,
        file_link: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        category, // string kategori saat itu
        createdby,
        status: 0, // diset tetap 0 sesuai permintaan
      },
      { transaction }
    );

    await TalentWorkHistoryLog.create(
      {
        talent_work_history_id: workHistory.id,
        createdby,
        ip: requestIp.getClientIp(req),
        changes: JSON.stringify({
          action: "Kontrak Dibuat",
          fields: [
            "salary", "start_date", "end_date", "talent_id", "client_id",
            "description", "file_link", "public_id", "resource_type",
            "category", "status",
          ],
          values: {
            salary,
            start_date,
            end_date,
            talent_id,
            client_id: parsedClientId,
            description,
            file_link: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            category,
            status: 0,
          },
        }),
      },
      { transaction }
    );

    if (parsedClientId !== 0) {
      await Talent.update({
        status_id: 2,
        client_id: parsedClientId
      }, { where: { id: talent_id }, transaction });

      await TalentLog.create(
        {
          talent_id,
          createdby,
          ip: requestIp.getClientIp(req),
          changes: JSON.stringify({
            action: "Status Talent Diupdate",
            fields: ["status_id", "client_id"],
            values: {
              status_id: 2,
              client_id: parsedClientId
            },
          }),
        },
        { transaction }
      );
    }


    fs.unlink(file.path, (err) => {
      if (err) console.error("Error menghapus file sementara:", err);
    });

    await transaction.commit();
    return res.status(201).json({ message: "Kontrak berhasil diregistrasi dan status talent diupdate." });

  } catch (error) {
    await transaction.rollback();
    console.error("Error createTalentWorkHistory:", error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error menghapus file sementara saat error:", err);
      });
    }
    return res.status(500).json({ message: "Gagal registrasi kontrak." });
  }
};

export const getTalentWorkHistoryByTalentId = async (req, res) => {
  try {
    const { talent_id } = req.params;

    const workHistories = await TalentWorkHistory.findAll({
      where: { talent_id },
      order: [['end_date', 'DESC']],
      attributes: ['id', 'category', 'salary', 'start_date', 'end_date', 'file_link', 'description'],
      include: [
        {
          model: Client,
          attributes: ['name'], // hanya ambil nama perusahaan
        }
      ]
    });

    // Format response supaya client_name jadi properti langsung
    const formatted = workHistories.map(wh => ({
      id: wh.id,
      client_name: wh.Client?.name || wh.description,
      category: wh.category,
      salary: wh.salary,
      start_date: wh.start_date,
      end_date: wh.end_date,
      file_link: wh.file_link,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error getTalentWorkHistoryByTalentId:", error);
    res.status(500).json({ message: "Gagal mengambil kontrak berdasarkan talent_id" });
  }
};

export const getTalentWorkHistoryByClientId = async (req, res) => {
  try {
    const { client_id } = req.params;
    const today = new Date();

    const workHistories = await TalentWorkHistory.findAll({
      where: {
        client_id,
        end_date: { [Op.gt]: today }, // hanya ambil yang end_date > hari ini
      },
      order: [['id', 'DESC']],
      attributes: ['id', 'start_date', 'end_date', 'salary', 'category', 'file_link'],
      include: [
        {
          model: Talent,
          attributes: ['name'], // ambil nama talent
        }
      ]
    });
    workHistories.forEach((wh) => {
      console.log(wh.toJSON());
    });

    // Format response
    const formatted = workHistories.map(wh => ({
      id: wh.id,
      start_date: wh.start_date,
      name: wh.talent.name || '',
      category: wh.category,
      salary: wh.salary,
      end_date: wh.end_date,
      file_link: wh.file_link
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error getTalentWorkHistoryByClientId:", error);
    res.status(500).json({ message: "Gagal mengambil kontrak berdasarkan client_id" });
  }
};

export const getTalentWorkHistoryById = async (req, res) => {
  try {
    const talentwh = await TalentWorkHistory.findByPk(req.params.id, {
      include: [
        { model: Talent, attributes: ['name'] },
        { model: Client, attributes: ['name'] },
      ],
    });
    if (!talentwh) return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    res.json(talentwh);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTalentWorkHistoryLog = async (req, res) => {
  try {
    const { talent_work_history_id } = req.query;

    if (!talent_work_history_id) {
      return res.status(400).json({ message: "talent_work_history_id is required" });
    }

    const logs = await TalentWorkHistoryLog.findAll({
      where: { talent_work_history_id },
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

export const updateTalentContract = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const contractId = req.params.id;
    const { client_id, salary, start_date, end_date, note } = req.body;
    const updatedby = req.session.userId;

    // Ambil kontrak lama
    const oldContract = await TalentWorkHistory.findByPk(contractId, { transaction });
    if (!oldContract) {
      return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    }

    // Update kontrak
    await TalentWorkHistory.update({
      client_id,
      salary,
      start_date,
      end_date,
      note,
      updatedby,
    }, {
      where: { id: contractId },
      transaction,
    });

    const talentId = oldContract.talent_id;
    const today = new Date().toISOString().slice(0, 10);

    // Cek kontrak aktif terbaru (end_date >= hari ini)
    const latestActive = await TalentWorkHistory.findOne({
      where: {
        talent_id: talentId,
        end_date: { [Op.gte]: today },
      },
      order: [['end_date', 'DESC']],
      transaction,
    });

    if (latestActive) {
      await Talent.update({
        client_id: latestActive.client_id,
        status: 2,
        updatedby,
      }, {
        where: { id: talentId },
        transaction,
      });
    } else {
      await Talent.update({
        client_id: 0,
        status: 1,
        updatedby,
      }, {
        where: { id: talentId },
        transaction,
      });
    }

    await transaction.commit();
    return res.json({ message: "Kontrak berhasil diperbarui." });

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating contract:", error);
    return res.status(500).json({ message: "Gagal memperbarui kontrak" });
  }
};

export const checkActiveContract = async (req, res) => {
  try {
    const { t: talentId, exclude } = req.query;

    if (!talentId) {
      return res.status(400).json({ message: "Parameter 't' (talentId) wajib diisi." });
    }

    // Ambil waktu awal hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 00:00:00

    const whereClause = {
      talent_id: talentId,
      end_date: { [Op.gte]: today },
    };

    if (exclude) {
      whereClause.id = { [Op.ne]: Number(exclude) };
    }

    const activeContract = await TalentWorkHistory.findOne({
      where: whereClause,
      order: [["end_date", "DESC"]],
    });

    return res.json({
      isActive: !!activeContract,
      contract: activeContract || null,
    });
  } catch (error) {
    console.error("Error checking active contract:", error);
    return res.status(500).json({ message: "Gagal memeriksa kontrak aktif" });
  }
};



