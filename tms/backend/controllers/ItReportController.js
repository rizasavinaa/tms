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
import xlsx from "xlsx";
import dayjs from "dayjs";

dotenv.config();

// Fungsi untuk mencari aktivitas user dengan filter
export const ReportUserActivity = async (req, res) => {
    try {
        const {
            startDate, endDate, searchType, keyword,
            page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
            user_id
        } = req.query;

        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const offset = (parsedPage - 1) * parsedLimit;

        if (isNaN(parsedLimit) || isNaN(parsedPage)) {
            return res.status(400).json({ message: "Invalid pagination parameters" });
        }

        // Build reusable filters
        const dateFilter = startDate && endDate
            ?

            {
                createdAt: {
                    [Op.between]: [
                        dayjs(startDate).startOf("day").toDate(),
                        dayjs(endDate).endOf("day").toDate()
                    ]
                }
            }

            : {};

        const keywordFilter = keyword
            ? { changes: { [Op.like]: `%${keyword}%` } }
            : {};

        const createdbyFilter = user_id
            ? { createdby: user_id }
            : {};

        // === USER LOG ===
        const userLogWhere = { [Op.and]: [] };

        if (startDate && endDate) {
            userLogWhere[Op.and].push(dateFilter);
        }

        if (searchType && keyword) {
            if (searchType === "email") {
                userLogWhere[Op.and].push({
                    "$user.email$": { [Op.like]: `%${keyword}%` },
                });
            } else if (searchType === "fullname") {
                userLogWhere[Op.and].push({
                    "$user.fullname$": { [Op.like]: `%${keyword}%` },
                });
            }
        }

        if (keyword) {
            userLogWhere[Op.and].push({
                [Op.or]: [
                    { changes: { [Op.like]: `%${keyword}%` } },
                    Sequelize.where(
                        Sequelize.fn('JSON_UNQUOTE', Sequelize.fn('JSON_EXTRACT', Sequelize.col('user_log.changes'), '$.action')),
                        { [Op.like]: `%${keyword}%` }
                    )
                ]
            });
        }

        const userLogs = await UserLog.findAll({
            where: userLogWhere,
            include: [{ model: User, attributes: ['email', 'fullname'] }],
        });

        const formattedUserLogs = userLogs.map(log => ({
            id: log.id,
            email: log.user?.email || "-",
            fullname: log.user?.fullname || "-",
            createdAt: log.createdAt,
            ip: log.ip || "-",
            changes: log.changes,
            type: "user",
        }));

        // === LOG MODELS WITH USER RELATION ===
        const logConfigs = [
            { model: ClientLog, type: 'client' },
            { model: PrivilegeLog, type: 'privilege' },
            { model: RoleLog, type: 'role' },
            { model: TalentLog, type: 'talent' },
            { model: TalentCategoryLog, type: 'talent_category' },
            { model: TalentStatusLog, type: 'talent_status' },
            { model: TalentPortofolioLog, type: 'talent_portofolio' },
            { model: TalentWorkHistoryLog, type: 'talent_work_history' },
            { model: TalentWorkProofLog, type: 'talent_work_proof' },
        ];

        const otherLogPromises = logConfigs.map(({ model, type }) =>
            model.findAll({
                where: {
                    ...dateFilter,
                    ...keywordFilter,
                    ...createdbyFilter
                },
                include: [{ model: User, attributes: ['email', 'fullname'] }],
            }).then(results =>
                results.map(log => ({
                    id: log.id,
                    email: log.user?.email || "-",
                    fullname: log.user?.fullname || "-",
                    createdAt: log.createdAt,
                    ip: log.ip || "-",
                    changes: log.changes,
                    type: type,
                }))
            )
        );

        const otherLogsNested = await Promise.all(otherLogPromises);
        const allLogs = [...formattedUserLogs, ...otherLogsNested.flat()];

        // === SORTING AND PAGINATION ===
        const sortedLogs = allLogs.sort((a, b) => {
            const aValue = a[sortBy] ?? '';
            const bValue = b[sortBy] ?? '';

            if (sortBy === 'createdAt') {
                return sortOrder.toUpperCase() === 'ASC'
                    ? new Date(aValue) - new Date(bValue)
                    : new Date(bValue) - new Date(aValue);
            } else {
                return sortOrder.toUpperCase() === 'ASC'
                    ? aValue.toString().localeCompare(bValue.toString())
                    : bValue.toString().localeCompare(aValue.toString());
            }
        });


        const paginatedLogs = sortedLogs.slice(offset, offset + parsedLimit);
        const totalRecords = allLogs.length;
        const totalPages = Math.ceil(totalRecords / parsedLimit);

        res.json({
            data: paginatedLogs,
            currentPage: parsedPage,
            totalPages,
            totalRecords
        });
    } catch (error) {
        console.error("Error fetching combined logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const ExportUserActivity = async (req, res) => {
    try {
        const {
            startDate, endDate, searchType, keyword,
            sortBy = 'createdAt', sortOrder = 'DESC', user_id
        } = req.query;

        const dateFilter = startDate && endDate
            ?

            {
                createdAt: {
                    [Op.between]: [
                        dayjs(startDate).startOf("day").toDate(),
                        dayjs(endDate).endOf("day").toDate()
                    ]
                }
            }

            : {};

        const keywordFilter = keyword
            ? { changes: { [Op.like]: `%${keyword}%` } }
            : {};

        const createdbyFilter = user_id
            ? { createdby: user_id }
            : {};

        // === USER LOG ===
        const userLogWhere = { [Op.and]: [] };

        if (startDate && endDate) {
            userLogWhere[Op.and].push(dateFilter);
        }

        if (searchType && keyword) {
            if (searchType === "email") {
                userLogWhere[Op.and].push({
                    "$user.email$": { [Op.like]: `%${keyword}%` },
                });
            } else if (searchType === "fullname") {
                userLogWhere[Op.and].push({
                    "$user.fullname$": { [Op.like]: `%${keyword}%` },
                });
            }
        }

        if (keyword) {
            userLogWhere[Op.and].push({
                [Op.or]: [
                    { changes: { [Op.like]: `%${keyword}%` } },
                    Sequelize.where(
                        Sequelize.fn('JSON_UNQUOTE', Sequelize.fn('JSON_EXTRACT', Sequelize.col('user_log.changes'), '$.action')),
                        { [Op.like]: `%${keyword}%` }
                    )
                ]
            });
        }

        const userLogs = await UserLog.findAll({
            where: userLogWhere,
            include: [{ model: User, attributes: ['email', 'fullname'] }],
        });

        const formattedUserLogs = userLogs.map(log => ({
            email: log.user?.email || "-",
            fullname: log.user?.fullname || "-",
            createdAt: log.createdAt,
            ip: log.ip || "-",
            changes: log.changes,
            type: "user",
        }));

        const logConfigs = [
            { model: ClientLog, type: 'client' },
            { model: PrivilegeLog, type: 'privilege' },
            { model: RoleLog, type: 'role' },
            { model: TalentLog, type: 'talent' },
            { model: TalentCategoryLog, type: 'talent_category' },
            { model: TalentStatusLog, type: 'talent_status' },
            { model: TalentPortofolioLog, type: 'talent_portofolio' },
            { model: TalentWorkHistoryLog, type: 'talent_work_history' },
            { model: TalentWorkProofLog, type: 'talent_work_proof' },
        ];

        const otherLogPromises = logConfigs.map(({ model, type }) =>
            model.findAll({
                where: {
                    ...dateFilter,
                    ...keywordFilter,
                    ...createdbyFilter
                },
                include: [{ model: User, attributes: ['email', 'fullname'] }],
            }).then(results =>
                results.map(log => ({
                    email: log.user?.email || "-",
                    fullname: log.user?.fullname || "-",
                    createdAt: log.createdAt,
                    ip: log.ip || "-",
                    changes: log.changes,
                    type: type,
                }))
            )
        );

        const otherLogsNested = await Promise.all(otherLogPromises);
        const allLogs = [...formattedUserLogs, ...otherLogsNested.flat()];

        // === SORTING ===
        const sortedLogs = allLogs.sort((a, b) => {
            const aValue = a[sortBy] ?? '';
            const bValue = b[sortBy] ?? '';

            if (sortBy === 'createdAt') {
                return sortOrder.toUpperCase() === 'ASC'
                    ? new Date(aValue) - new Date(bValue)
                    : new Date(bValue) - new Date(aValue);
            } else {
                return sortOrder.toUpperCase() === 'ASC'
                    ? aValue.toString().localeCompare(bValue.toString())
                    : bValue.toString().localeCompare(aValue.toString());
            }
        });



        const data = sortedLogs.map((log) => {
            const changesDetail = processChanges(log.changes);
            const aksi = renderChangesAksi(log.changes);
            const formattedDate = new Date(log.createdAt).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false,
            });

            return {
                Email: log.email,
                "Nama Panjang": log.fullname,
                "Tanggal dan Waktu": formattedDate,
                IP: log.ip,
                "Hak Akses": aksi,
                Perubahan: changesDetail,
            };
        });

        const excelData = [
            ["Email", "Nama Panjang", "Tanggal dan Waktu", "IP", "Hak Akses", "Perubahan"],
            ...data.map(item => [
                item.Email,
                item["Nama Panjang"],
                item["Tanggal dan Waktu"],
                item.IP,
                item["Hak Akses"],
                item.Perubahan,
            ]),
        ];

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(excelData);
        xlsx.utils.book_append_sheet(wb, ws, "Laporan Aktivitas User");

        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=laporan_aktivitas_user.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);

    } catch (error) {
        console.error("Error exporting user activity to Excel:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// export const ReportUserActivity = async (req, res) => {
//     try {
//         const { startDate, endDate, searchType, keyword, page = 1, limit = 10, sortBy, sortOrder } = req.query;

//         // Pastikan limit dan page adalah angka
//         const parsedLimit = parseInt(limit, 10);
//         const parsedPage = parseInt(page, 10);

//         if (isNaN(parsedLimit) || isNaN(parsedPage)) {
//             return res.status(400).json({ message: "Invalid pagination parameters" });
//         }

//         const offset = (parsedPage - 1) * parsedLimit;
//         const whereConditions = { [Op.and]: [] };

//         // Filter berdasarkan date range
//         if (startDate && endDate) {
//             whereConditions[Op.and].push({
//                 createdAt: {
//                     [Op.between]: [new Date(startDate), new Date(endDate)],
//                 },
//             });
//         }

//         // Filter berdasarkan keyword dan searchType (email atau fullname)
//         if (searchType && keyword) {
//             if (searchType === "email") {
//                 whereConditions[Op.and].push({
//                     "$user.email$": {
//                         [Op.like]: `%${keyword}%`,
//                     },
//                 });
//             } else if (searchType === "fullname") {
//                 whereConditions[Op.and].push({
//                     "$user.fullname$": {
//                         [Op.like]: `%${keyword}%`,
//                     },
//                 });
//             }
//         }

//         // Filter berdasarkan keyword untuk "changes" (baik teks biasa maupun JSON)
//         if (keyword) {
//             whereConditions[Op.and].push(
//                 // Kondisi untuk mencari teks biasa dalam changes
//                 {
//                     [Op.or]: [
//                         {
//                             "$user_log.changes$": {
//                                 [Op.like]: `%${keyword}%`
//                             }
//                         },
//                         // Kondisi untuk mencari JSON dalam changes, misalnya mencari key 'action'
//                         Sequelize.where(
//                             Sequelize.fn('JSON_UNQUOTE', Sequelize.fn('JSON_EXTRACT', Sequelize.col('user_log.changes'), '$.action')),
//                             {
//                                 [Op.like]: `%${keyword}%`
//                             }
//                         )
//                     ]
//                 }
//             );
//         }

//         // Tentukan kolom yang valid untuk sort
//         const validSortColumns = ['createdAt', 'id', 'ip', 'changes', 'type', 'user.fullname', 'user.email'];
//         const orderByColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';  // Default ke createdAt jika invalid
//         const orderDirection = sortOrder || 'DESC';   // Default DESC

//         // Ambil log aktivitas user sesuai filter dan dengan pagination
//         const { count, rows } = await UserLog.findAndCountAll({
//             where: whereConditions,
//             include: [{
//                 model: User,
//                 attributes: ['email', 'fullname'],
//             }],
//             order: [
//                 [Sequelize.literal(`\`${orderByColumn}\``), orderDirection]  // Urutkan berdasarkan kolom yang valid
//             ],
//             limit: parsedLimit,
//             offset: offset,
//         });

//         // Menghitung total halaman
//         const totalPages = Math.ceil(count / parsedLimit);

//         // Format data logs untuk dikirim ke frontend
//         const formattedLogs = rows.map((log) => ({
//             id: log.id,
//             email: log.user.email,
//             fullname: log.user.fullname,
//             createdAt: log.createdAt,
//             ip: log.ip || "-",
//             changes: log.changes,
//             type: log.type || "-",
//         }));

//         res.json({
//             data: formattedLogs,
//             currentPage: parsedPage,
//             totalPages: totalPages,
//             totalRecords: count,
//         });
//     } catch (error) {
//         console.error("Error fetching user activity:", error.message, error.stack);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };


// Fungsi untuk export ke excel
// export const ExportUserActivity = async (req, res) => {
//     try {
//         const { startDate, endDate, searchType, keyword } = req.query;

//         let whereConditions = {
//             [Op.and]: [],
//         };

//         if (startDate && endDate) {
//             whereConditions[Op.and].push({
//                 createdAt: {
//                     [Op.between]: [new Date(startDate), new Date(endDate)],
//                 },
//             });
//         }

//         if (searchType && keyword) {
//             if (searchType === "email") {
//                 whereConditions[Op.and].push({
//                     "$user.email$": {
//                         [Op.like]: `%${keyword}%`,
//                     },
//                 });
//             } else if (searchType === "fullname") {
//                 whereConditions[Op.and].push({
//                     "$user.fullname$": {
//                         [Op.like]: `%${keyword}%`,
//                     },
//                 });
//             }
//         }

//         const logs = await UserLog.findAll({
//             where: whereConditions,
//             include: [
//                 {
//                     model: User,
//                     attributes: ["email", "fullname"],
//                 },
//             ],
//             order: [["createdAt", "DESC"]],
//         });

//         const data = logs.map((log) => {
//             const changesDetail = processChanges(log.changes); // Gunakan fungsi terpisah
//             const aksi = renderChangesAksi(log.changes);
//             const formattedDate = new Date(log.createdAt).toLocaleString("id-ID", {
//                 timeZone: "Asia/Jakarta",
//                 year: "numeric",
//                 month: "2-digit",
//                 day: "2-digit",
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 second: "2-digit",
//                 hour12: false,
//             });

//             return {
//                 Email: log.user.email,
//                 "Nama Panjang": log.user.fullname,
//                 "Tanggal dan Waktu": formattedDate,
//                 IP: log.ip || "-",
//                 "Hak Akses": aksi, // Tampilkan detail changes
//                 Perubahan: changesDetail, // Sama seperti di atas, ditambahkan ke Excel
//             };
//         });
//         const excelData = [
//             ["Email", "Nama Panjang", "Tanggal dan Waktu", "IP", "Hak Akses", "Perubahan"],
//             ...data.map(item => [
//                 item.Email,
//                 item["Nama Panjang"],
//                 item["Tanggal dan Waktu"],
//                 item.IP,
//                 item["Hak Akses"],
//                 item.Perubahan,
//             ]),
//         ];

//         const wb = xlsx.utils.book_new();
//         const ws = xlsx.utils.aoa_to_sheet(excelData);
//         xlsx.utils.book_append_sheet(wb, ws, "Laporan Aktivitas User");

//         const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

//         res.setHeader("Content-Disposition", "attachment; filename=laporan_aktivitas_user.xlsx");
//         res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//         res.send(buffer);

//     } catch (error) {
//         console.error("Error exporting user activity to Excel:", error.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

const renderChangesAksi = (changes) => {
    try {
        const parsed = JSON.parse(changes);

        if (typeof parsed === "string") {
            return parsed; // langsung return kalau string
        }

        if (parsed.action) {
            return parsed.action;
        }

        return ""; // fallback kalau tidak ada action
    } catch (e) {
        return changes; // langsung return string original jika gagal parse
    }
}


const processChanges = (changes) => {
    let changesDetail = "";

    try {
        const parsed = JSON.parse(changes);

        if (typeof parsed === "string") {
            changesDetail = parsed;
        } else {
            if (parsed.action) {
                changesDetail += `Aksi: ${parsed.action}\n`;
            }

            if (parsed.fields && parsed.values) {
                changesDetail += `Field: ${parsed.fields.join(", ")}\n`;
                changesDetail += "Nilai Baru:\n";
                for (const [key, value] of Object.entries(parsed.values)) {
                    changesDetail += `- ${key}: ${value}\n`;
                }
            }

            if (parsed.oldValues && parsed.newValues) {
                changesDetail += "Perubahan:\n";
                for (const key of Object.keys(parsed.newValues)) {
                    const oldVal = parsed.oldValues[key];
                    const newVal = parsed.newValues[key];
                    changesDetail += `- ${key}: ${oldVal ?? "-"} → ${newVal ?? "-"}\n`;
                }
            }
        }
    } catch (e) {
        changesDetail = changes; // Jika parsing gagal, tampilkan changes mentah
    }

    return changesDetail;
};