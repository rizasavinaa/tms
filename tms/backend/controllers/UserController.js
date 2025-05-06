import User from "../models/UserModel.js";
import UserLog from "../models/UserLogModel.js";
import ClientLog from "../models/ClientLogModel.js";
import PrivilegeLog from "../models/PrivilegeLogModel.js";
import RoleLog from "../models/RoleLogModel.js";
import TalentLog from "../models/TalentLogModel.js";
import TalentCategoryLog from "../models/TalentCategoryLogModel.js";
import TalentStatusLog from "../models/TalentStatusLogModel.js";
import TalentPortofolioLog from "../models/TalentPortofolioLogModel.js";
import TalentWorkHistoryLog from "../models/TalentWorkHistoryLogModel.js";
import TalentWorkProofLog from "../models/TalentWorkProofLogModel.js";
import Role from "../models/RoleModel.js";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize";
import sequelize from "../config/Database.js";
import PasswordReset from "../models/PasswordResetModel.js";
import requestIp from "request-ip";

dotenv.config();

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      include: [{
        model: Role, // Pastikan model Role sudah di-import
        as: "role", // Alias untuk role
        attributes: ["name"], // Ambil hanya field 'name'
      }],
    });
    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const response = await User.findOne({
      where: {
        id: req.params.id,
      },
      include: [{
        model: Role,
        as: "role",
        attributes: ["name"],
      }],
    });
    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data user" });
  }
};

export const createUser = async (req, res) => {
  console.log("🚀 Request body yang diterima:", req.body); // ✅ Cek apakah emailPassword "ya"

  const createUserTransaction = await sequelize.transaction();
  const resetPasswordTransaction = await sequelize.transaction();
  try {
    const createdBy = req.session.userId;
    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }

    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    console.log("📩 Membuat user baru...");
    const userData = { ...req.body, createdBy };
    const newUser = await User.create(userData, { transaction: createUserTransaction });

    console.log("📝 Menyimpan log...");
    await UserLog.create({
      user_id: newUser.id,
      changes: JSON.stringify({
        action: "User Created",
        fields: Object.keys(req.body),
        values: req.body,
      }),
      createdBy,
      ip: requestIp.getClientIp(req)
    }, { transaction: createUserTransaction });

    await createUserTransaction.commit();

    // ✅ Cek apakah emailPassword bernilai "ya"
    console.log("📨 emailPassword:", req.body.emailPassword);
    if (req.body.emailPassword === "ya") {
      console.log("🔑 Membuat token reset password...");
      const resetToken = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      try {
        // Menggunakan transaksi terpisah untuk PasswordReset
        await PasswordReset.destroy({ where: { user_id: newUser.id }, transaction: resetPasswordTransaction });

        const resetEntry = await PasswordReset.create({
          user_id: newUser.id,
          token: resetToken,
          expires_at: expiresAt
        }, { transaction: resetPasswordTransaction });

        console.log("✅ Token berhasil disimpan di DB:", resetEntry);
      } catch (dbError) {
        await resetPasswordTransaction.rollback();
        console.error("🔥 ERROR saat menyimpan token reset password:", dbError);
        return res.status(500).json({ message: "Gagal menyimpan token reset password", error: dbError.message });
      }

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      console.log("📧 Mengirim email ke:", newUser.email, "Dengan link:", resetLink);

      await sendWelcomeEmail(newUser.email, resetLink);
      await resetPasswordTransaction.commit();
    }

    console.log("✅ User berhasil dibuat dan email terkirim!");
    res.status(201).json({ message: "User & Log created, email sent", user: newUser });
  } catch (error) {
    // Pastikan rollback transaksi jika ada kesalahan
    if (createUserTransaction) await createUserTransaction.rollback();
    if (resetPasswordTransaction) await resetPasswordTransaction.rollback();
    console.error("🔥 ERROR di createUser:", error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

const sendWelcomeEmail = async (email, resetLink) => {
  try {
    console.log("📤 Mempersiapkan email...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("✅ Transporter berhasil dibuat.");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Setel Kata Sandi Anda",
      html: `
        <p>Selamat, Anda telah didaftarkan di Sistem Manajemen Talenta.</p>
        <p>Silakan klik link di bawah ini untuk mengatur kata sandi Anda:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Link ini hanya berlaku selama 1 jam.</p>
      `,
    };

    console.log("📨 Mengirim email ke:", email);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email berhasil dikirim:", info.response);

  } catch (emailError) {
    console.error("🔥 ERROR saat mengirim email:", emailError);
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token tidak valid" });

    const resetRecord = await PasswordReset.findOne({ where: { token } });
    if (!resetRecord) return res.status(400).json({ message: "Token tidak ditemukan" });

    // Cek apakah token sudah kedaluwarsa
    if (new Date() > resetRecord.expires_at) {
      return res.status(400).json({ message: "Token kedaluwarsa" });
    }

    res.status(200).json({ message: "Token valid", userId: resetRecord.user_id });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.id;
    const createdBy = req.session.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = {};
    const oldValues = {};

    Object.keys(req.body).forEach((key) => {
      if (user[key] !== req.body[key]) {
        oldValues[key] = user[key];           // nilai sebelum diupdate
        updatedFields[key] = req.body[key];   // nilai sesudah diupdate
      }
    });

    await user.update(updatedFields, { transaction });

    if (Object.keys(updatedFields).length > 0) {
      await UserLog.create(
        {
          user_id: userId,
          changes: JSON.stringify({
            action: "User Updated",
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
    res.status(200).json({ message: "User & Log updated", user });

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};


export const deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.id;
    const createdBy = req.session.userId;
    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserLog.create({
      userId,
      changes: {
        action: "User Deleted",
        values: user.toJSON(), // Simpan semua data sebelum dihapus
      },
      createdBy,
      ip: requestIp.getClientIp(req)
    }, { transaction });

    await user.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "User & Log deleted" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const updatePassUser = async (req, res) => {
  const { token, password, confPassword } = req.body;

  // 🛡 1️⃣ Pastikan token ada
  if (!token) {
    return res.status(400).json({ msg: "Token tidak ditemukan" });
  }

  try {
    // 🔍 2️⃣ Decode token untuk mendapatkan userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Ambil userId dari token

    console.log("User ID dari token:", userId); // ✅ Debugging

    // 🛡 3️⃣ Validasi password
    if (password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password minimal 6 karakter" });
    }

    // 🔍 4️⃣ Cari user berdasarkan ID dari token
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // 🔐 5️⃣ Hash password baru
    const hashedPassword = await argon2.hash(password);

    // 🔄 6️⃣ Update password user
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password berhasil direset" });
  } catch (error) {
    console.error("🔥 Error decoding token:", error.message);
    return res.status(400).json({ msg: "Token tidak valid atau kedaluwarsa" });
  }
};

export const resetPassword = async (req, res) => {
  const userId = req.params.id;

  try {
    // Cari user langsung
    const user = await User.findOne({
      where: { id: userId },
      include: [{
        model: Role,
        as: "role",
        attributes: ["name"],
      }]
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const transaction = await sequelize.transaction();

    await PasswordReset.destroy({
      where: { user_id: user.id },
      transaction
    });

    await PasswordReset.create({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt
    }, { transaction });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail(user.email, resetLink);
    await transaction.commit();

    return res.status(200).json({ message: "Link reset password telah dikirim ke email user." });

  } catch (error) {
    console.error("🔥 ERROR:", error.message);
    return res.status(500).json({ message: "Gagal mengirim reset password", error: error.message });
  }
};

const sendResetEmail = async (email, resetLink) => {
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
    subject: "Setel Kata Sandi Anda",
    html: `
      <p>Silakan klik link di bawah ini untuk mengatur ulang kata sandi Anda:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link ini berlaku selama 1 jam.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const getUserLog = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const logs = await UserLog.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          attributes: ["fullname"],
        },
      ],
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

export const getUserLogDataChanges = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const logs = await UserLog.findAll({
      where: {
        user_id,
        changes: {
          [Op.notLike]: '%Log%', // changes TIDAK mengandung kata "Log"
        },
      },
      include: [
        {
          model: User,
          
          attributes: ["fullname"],
        },
      ],
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

export const getUserLogActivity = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    //aktivitas di user log
    const logs = await UserLog.findAll({
      where: {
        user_id,
        changes: {
          [Op.like]: '%Log%', // changes mengandung kata "Log"
        },
      },
      include: [
        {
          model: User,
          attributes: ["fullname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di client log
    const clientLogs = await ClientLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di privilege log
    const privilegeLogs = await PrivilegeLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di  rolelog
    const roleLogs = await RoleLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di  talentlog
    const talentLogs = await TalentLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di  talent category log
    const talentcategoryLogs = await TalentCategoryLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di  talent status log
    const talentstatusLogs = await TalentStatusLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

    //aktivitas di  talent porto log
    const talentportofolioLogs = await TalentPortofolioLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

     //aktivitas di  talent work history
     const talentworkhistoryLogs = await TalentWorkHistoryLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });

     //aktivitas di  talent work proof
     const talentworkproofLogs = await TalentWorkProofLog.findAll({
      where: { createdby: user_id },
      order: [["createdAt", "DESC"]],
    });


    const formattedUserLogs = logs.map((log) => ({
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
    }));

    const formattedClientLogs = clientLogs.map((log) => ({
      type: "client", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.client_id
    }));

    const formattedPrivilegeLogs = privilegeLogs.map((log) => ({
      type: "privilege", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.privilege_id
    }));

    const formattedRoleLogs = roleLogs.map((log) => ({
      type: "role", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.role_id
    }));

    const formattedTalentLogs = talentLogs.map((log) => ({
      type: "talent", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_id
    }));

    const formattedTalentCategoryLogs = talentcategoryLogs.map((log) => ({
      type: "talent category", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_category_id
    }));

    const formattedTalentStatusLogs = talentstatusLogs.map((log) => ({
      type: "talent status", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_status_id
    }));

    const formattedTalentPortofolioLogs = talentportofolioLogs.map((log) => ({
      type: "talent portofolio", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_portofolio_id
    }));

    const formattedTalentWorkHistoryLogs = talentworkhistoryLogs.map((log) => ({
      type: "talent status", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_work_history_id
    }));

    const formattedTalentWorkProofLogs = talentworkproofLogs.map((log) => ({
      type: "talent status", // buat pembeda
      created_at: log.createdAt,
      // user: log.user ? log.user.fullname : "Unknown",
      ip: log.ip || "-",
      changes: log.changes,
      pk: log.talent_work_proof_id
    }));


    const combinedLogs = [...formattedUserLogs, ...formattedClientLogs, ...formattedPrivilegeLogs, ...formattedRoleLogs, ...formattedTalentLogs, ...formattedTalentCategoryLogs, ...formattedTalentStatusLogs, ...formattedTalentPortofolioLogs, ...formattedTalentWorkHistoryLogs, ...formattedTalentWorkProofLogs].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(combinedLogs);
  } catch (error) {
    console.error("Error fetching user logs:", error.message, error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
