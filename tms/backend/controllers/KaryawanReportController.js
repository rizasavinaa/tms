import xlsx from "xlsx";
import { Op } from "sequelize";
import Talent from "../models/TalentModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import TalentStatus from "../models/TalentStatusModel.js";

export const exportTalents = async (req, res) => {
    try {
        const { search = "", filter = "name", sortColumn = "id", sortOrder = "asc" } = req.query;

        const whereCondition = {};
        const include = [];

        // Pencarian
        if (search && (filter === "name" || filter === "email")) {
            whereCondition[filter] = { [Op.like]: `%${search}%` };
        } else if (search === "") {
            // nothing, biarkan kosong
        } else if (filter === "category") {
            include.push({
                model: TalentCategory,
                attributes: ['name'],
                where: { name: { [Op.like]: `%${search}%` } }
            });
        } else if (filter === "status") {
            include.push({
                model: TalentStatus,
                attributes: ['name'],
                where: { name: { [Op.like]: `%${search}%` } }
            });
        }

        // Tambahkan relasi jika belum dimasukkan
        if (!include.find(i => i.model === TalentCategory)) {
            include.push({ model: TalentCategory, attributes: ['name'] });
        }
        if (!include.find(i => i.model === TalentStatus)) {
            include.push({ model: TalentStatus, attributes: ['name'] });
        }

        const talents = await Talent.findAll({
            where: whereCondition,
            include
        });

        // Sorting manual
        const sortedTalents = talents.sort((a, b) => {
            let aValue = sortColumn === "category" ? a.talent_category?.name :
                         sortColumn === "status" ? a.talent_status?.name :
                         a[sortColumn];
            let bValue = sortColumn === "category" ? b.talent_category?.name :
                         sortColumn === "status" ? b.talent_status?.name :
                         b[sortColumn];

            if (typeof aValue === "string") aValue = aValue.toLowerCase();
            if (typeof bValue === "string") bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        const data = sortedTalents.map(t => ({
            ID: t.id,
            Email: t.email,
            Nama: t.name,
            Posisi: t.talent_category?.name || "-",
            Status: t.talent_status?.name || "-",
            "Gaji Terakhir": t.last_salary,
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Talents");
        const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=data_talent.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    } catch (error) {
        console.error("Export talents error:", error);
        res.status(500).json({ message: "Gagal mengekspor data talent." });
    }
};
