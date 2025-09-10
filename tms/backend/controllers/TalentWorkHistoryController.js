import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cloudinary from "../config/Cloudinary.js";
import nodemailer from "nodemailer";
import sequelize from "../config/Database.js";
import TalentWorkHistory from "../models/TalentWorkHistoryModel.js";
import TalentWorkHistoryLog from "../models/TalentWorkHistoryLogModel.js";
import TalentWorkProof from "../models/TalentWorkProofModel.js";
import Talent from "../models/TalentModel.js";
import TalentLog from "../models/TalentLogModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import requestIp from "request-ip";
import Client from "../models/ClientModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import path from "path";
import { promisify } from "util";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
dayjs.extend(isSameOrAfter);
const unlinkAsync = promisify(fs.unlink);

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
        status: 0,
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

    if (parsedClientId !== 0 && end_date && dayjs(end_date).isSameOrAfter(dayjs(), "day")) {
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

      // 💌 Kirim email ke client
      const ContractFile = workHistory.file_link;
      const talentDetailLink = `${process.env.FRONTEND_URL}/client/pk/${talent_id}`;
      const client = await Client.findByPk(parsedClientId);
      const clientName = client?.name || "perusahaan terkait";
      await sendContractNotificationToClient(parsedClientId, talent.name, ContractFile, talentDetailLink);

      // 💌 Kirim email ke talent
      await sendContractNotificationToTalent(talent.email, clientName || "perusahaan terkait", ContractFile, talent.name);
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

export const sendContractNotificationToClient = async (clientId, talentName, contractLink, talentDetailLink) => {
  try {
    const client = await Client.findByPk(clientId);
    if (!client || !client.email) {
      console.error("Email client tidak ditemukan.");
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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `Kontrak Pekerja Kreatif Telah Terbit`,
      html: `
        <p>Halo <strong>${client.name}</strong>,</p>
        <p>Kontrak pekerja kreatif dengan nama <strong>${talentName}</strong> telah terbit untuk perusahaan Anda.</p>
        <p>🔗 <a href="${contractLink}">Lihat File Kontrak</a></p>
        <p>👤 <a href="${talentDetailLink}">Lihat Profil Pekerja Kreatif</a></p>
        <p>Terima kasih.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email kontrak berhasil dikirim ke client.");
  } catch (error) {
    console.error("🔥 Gagal mengirim email kontrak ke client:", error);
  }
};

export const sendContractNotificationToTalent = async (talentEmail, companyName, contractLink, talentName) => {
  try {
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
      to: talentEmail,
      subject: `Kontrak Anda dengan ${companyName} Telah Terbit`,
      html: `
        <p>Halo <strong>${talentName}</strong>,</p>
        <p>Kontrak kerja Anda dengan perusahaan <strong>${companyName}</strong> telah terbit.</p>
        <p>🔗 <a href="${contractLink}">Lihat File Kontrak</a></p>
        <p>Terima kasih.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email kontrak berhasil dikirim ke talent.");
  } catch (error) {
    console.error("🔥 Gagal mengirim email kontrak ke talent:", error);
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
      client_name: wh.client?.name || wh.description,
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

// export const updateTalentContract = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const contractId = req.params.id;
//     const { client_id, salary, start_date, end_date, note } = req.body;
//     const updatedby = req.session.userId;

//     // Ambil kontrak lama
//     const oldContract = await TalentWorkHistory.findByPk(contractId, { transaction });
//     if (!oldContract) {
//       return res.status(404).json({ message: "Kontrak tidak ditemukan" });
//     }

//     // Update kontrak
//     await TalentWorkHistory.update({
//       client_id,
//       salary,
//       start_date,
//       end_date,
//       note,
//       updatedby,
//     }, {
//       where: { id: contractId },
//       transaction,
//     });

//     const talentId = oldContract.talent_id;
//     const today = new Date().toISOString().slice(0, 10);

//     // Cek kontrak aktif terbaru (end_date >= hari ini)
//     const latestActive = await TalentWorkHistory.findOne({
//       where: {
//         talent_id: talentId,
//         end_date: { [Op.gte]: today },
//       },
//       order: [['end_date', 'DESC']],
//       transaction,
//     });

//     if (latestActive) {
//       await Talent.update({
//         client_id: latestActive.client_id,
//         status: 2,
//         updatedby,
//       }, {
//         where: { id: talentId },
//         transaction,
//       });
//     } else {
//       await Talent.update({
//         client_id: 0,
//         status: 1,
//         updatedby,
//       }, {
//         where: { id: talentId },
//         transaction,
//       });
//     }

//     await transaction.commit();
//     return res.json({ message: "Kontrak berhasil diperbarui." });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error updating contract:", error);
//     return res.status(500).json({ message: "Gagal memperbarui kontrak" });
//   }
// };

const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === "string" && date.length >= 10) return date.slice(0, 10);
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return null;
};

export const updateTalentContract = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const contractId = req.params.id;
    const updatedby = req.session.userId;

    // Ambil kontrak lama
    const oldContract = await TalentWorkHistory.findByPk(contractId, { transaction });
    if (!oldContract) {
      return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    }

    // Data update dari req.body
    const { client_id, salary, start_date, end_date, note, description } = req.body;

    // Simpan perubahan yang ada
    const updatedFields = {};
    const oldValues = {};

    // Format tanggal ke YYYY-MM-DD (misal function formatDate)
    const oldStartDate = formatDate(oldContract.start_date);
    const oldEndDate = formatDate(oldContract.end_date);

    if (client_id !== undefined && client_id != oldContract.client_id) {
      updatedFields.client_id = client_id;
      oldValues.client_id = oldContract.client_id;
    }
    if (salary !== undefined && salary != oldContract.salary) {
      updatedFields.salary = salary;
      oldValues.salary = oldContract.salary;
    }
    if (start_date !== undefined && start_date != oldStartDate) {
      updatedFields.start_date = start_date;
      oldValues.start_date = oldStartDate;
    }
    if (end_date !== undefined && end_date != oldEndDate) {
      updatedFields.end_date = end_date;
      oldValues.end_date = oldEndDate;
    }
    if (description !== undefined && description != oldContract.description) {
      updatedFields.description = description;
      oldValues.description = oldContract.description;
    }

    // Handle upload file ke Cloudinary jika ada file baru
    if (req.file) {
      // Hapus file lama di Cloudinary jika ada dan bukan null/empty
      if (oldContract.public_id) {
        try {
          await cloudinary.uploader.destroy(oldContract.public_id, {
            resource_type: oldContract.resource_type || "raw", // default fallback
            invalidate: true,
          });
        } catch (err) {
          console.error("Gagal hapus file lama di Cloudinary:", err);
        }
      }

      const generatedPublicId = `kontrak_${uuidv4()}`;
      const resourceType = getResourceType(req.file.mimetype);
      // Upload file baru
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "kontrak",
        public_id: generatedPublicId,
        resource_type: resourceType,
      });

      updatedFields.file_link = result.secure_url;
      updatedFields.resource_type = result.resource_type;
      updatedFields.public_id = result.public_id;
      oldValues.file_link = oldContract.file_link;
      oldValues.resource_type = oldContract.resource_type;
      oldValues.public_id = oldContract.public_id;

      // Hapus file lokal setelah upload
      await unlinkAsync(req.file.path);
    }

    // Update kontrak
    await TalentWorkHistory.update(updatedFields, {
      where: { id: contractId },
      transaction,
    });

    // Simpan log perubahan kontrak jika ada perubahan selain updatedby
    const changedFields = Object.keys(updatedFields);
    if (changedFields.length > 0) {
      await TalentWorkHistoryLog.create({
        talent_work_history_id: contractId,
        changes: JSON.stringify({
          action: "Update Contract",
          fields: changedFields,
          oldValues,
          newValues: updatedFields,
        }),
        createdby: updatedby,
        ip: requestIp.getClientIp(req),
      }, { transaction });
    }

    // Update Talent berdasarkan kontrak aktif terbaru
    const talentId = oldContract.talent_id;
    const today = new Date().toISOString().slice(0, 10);

    const latestActive = await TalentWorkHistory.findOne({
      where: {
        talent_id: talentId,
        end_date: { [Op.gte]: today },
      },
      order: [["end_date", "DESC"]],
      transaction,
    });

    let talentOldValues = {};
    let talentUpdatedFields = {};

    if (latestActive) {
      const talent = await Talent.findByPk(talentId, { transaction });
      if (!talent) throw new Error("Talent tidak ditemukan");

      if (talent.client_id !== latestActive.client_id) {
        talentUpdatedFields.client_id = latestActive.client_id;
        talentOldValues.client_id = talent.client_id;
      }
      if (talent.status !== 2) {
        talentUpdatedFields.status = 2;
        talentOldValues.status = talent.status;
      }

      if (Object.keys(talentUpdatedFields).length > 0) {
        await Talent.update(talentUpdatedFields, { where: { id: talentId }, transaction });

        await TalentLog.create({
          talent_id: talentId,
          changes: JSON.stringify({
            action: "Update Talent via Contract Update",
            fields: Object.keys(talentUpdatedFields).filter(f => f !== "updatedby"),
            oldValues: talentOldValues,
            newValues: talentUpdatedFields,
          }),
          createdby: updatedby,
          ip: requestIp.getClientIp(req),
        }, { transaction });
      }
    } else {
      const talent = await Talent.findByPk(talentId, { transaction });
      if (!talent) throw new Error("Talent tidak ditemukan");

      if (talent.client_id !== 0 || talent.status !== 1) {
        talentOldValues.client_id = talent.client_id;
        talentOldValues.status = talent.status;
        talentUpdatedFields.client_id = 0;
        talentUpdatedFields.status_id = 1;

        await Talent.update(talentUpdatedFields, { where: { id: talentId }, transaction });

        await TalentLog.create({
          talent_id: talentId,
          changes: JSON.stringify({
            action: "Update Talent via Contract Update",
            fields: Object.keys(talentUpdatedFields).filter(f => f !== "updatedby"),
            oldValues: talentOldValues,
            newValues: talentUpdatedFields,
          }),
          createdby: updatedby,
          ip: requestIp.getClientIp(req),
        }, { transaction });
      }
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

export const getContracts = async (req, res) => {
  try {
    const { search = "", sortColumn = "id", sortOrder = "asc" } = req.query;

    const whereClient = search
      ? {
        name: { [Op.iLike]: `%${search}%` },
      }
      : {};

    const whereTalent = search
      ? {
        name: { [Op.iLike]: `%${search}%` },
      }
      : {};

    // Kalau search di id atau posisi, bisa dibuat OR
    const whereContract = search
      ? {
        [Op.or]: [
          { id: { [Op.like]: `%${search}%` } },
          { position: { [Op.iLike]: `%${search}%` } }, // kalau field position ada di sini
        ],
      }
      : {};

    const contracts = await TalentWorkHistory.findAll({
      where: whereContract,
      include: [
        {
          model: Client,
          where: whereClient,
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: Talent,
          where: whereTalent,
          required: true,
          attributes: ["id", "name"],
        }
      ],
      order: [[sortColumn, sortOrder]],
    });

    res.json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data kontrak" });
  }
};

// Cek apakah kontrak bisa diedit
export const checkContractEditable = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari bukti kerja berdasarkan talent_work_history_id
    const existingProof = await TalentWorkProof.findOne({
      where: { talent_work_history_id: id }
    });

    if (existingProof) {
      return res.status(200).json({
        editable: false,
        hasProof: true,
        message: "Kontrak tidak dapat diedit karena sudah memiliki bukti kerja."
      });
    }

    // Cari kontrak untuk cek end_date
    const contract = await TalentWorkHistory.findByPk(id);
    if (contract && contract.end_date && new Date() > contract.end_date) {
      return res.status(200).json({
        editable: false,
        expired: true,
        message: "Kontrak tidak dapat diedit karena sudah melewati tanggal berakhir."
      });
    }

    return res.status(200).json({
      editable: true,
      message: "Kontrak masih dapat diedit."
    });
  } catch (error) {
    console.error("Gagal cek kontrak:", error);
    return res.status(500).json({
      editable: false,
      message: "Terjadi kesalahan pada server."
    });
  }
};
