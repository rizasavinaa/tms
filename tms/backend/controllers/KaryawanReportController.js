import xlsx from "xlsx";
import { Op } from "sequelize";
import Talent from "../models/TalentModel.js";
import TalentCategory from "../models/TalentCategoryModel.js";
import TalentStatus from "../models/TalentStatusModel.js";
import TalentWorkHistory from "../models/TalentWorkHistoryModel.js";
import TalentWorkProof from "../models/TalentWorkProofModel.js";
import dayjs from "dayjs";
import Client from "../models/ClientModel.js";

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

export const getKaryawanDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 31);

    // 1. Follow Up Retensi: Kontrak yang akan habis dalam ≤ 30 hari
    const followUpRetensi = await TalentWorkHistory.count({
      where: {
        end_date: {
          [Op.gte]: today,
          [Op.lte]: nextMonth,
        }
      }
    });

    // 2. Pekerja Kreatif Available: status = 0 (belum dikontrak)
    const availableTalents = await Talent.count({
      where: {
        status_id: 1
      }
    });

    // 3. Kontrak Aktif: sekarang sedang berjalan
    const activeContracts = await TalentWorkHistory.count({
      where: {
        start_date: {
          [Op.lte]: today,
        },
        end_date: {
          [Op.gte]: today,
        }
      }
    });

    return res.json({
      retensi: followUpRetensi,
      available: availableTalents,
      aktif: activeContracts
    });

  } catch (error) {
    console.error("Error in getKaryawanDashboardStats:", error);
    return res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};

export const getClientHomepageStats = async (req, res) => {
  try {
    const { client_id } = req.query;

    if (!client_id) {
      return res.status(400).json({ message: "client_id wajib diisi di query" });
    }

    // Hitung talent dengan status aktif dan milik client ini
    const recruited = await Talent.count({
      where: {
        client_id: client_id,
        status_id: 2,
      },
    });

    // Hitung bukti kerja baru (status 0) milik client
    const newworkproof = await TalentWorkProof.count({
      where: {
        client_id: client_id,
        validation_status: 0,
      },
    });

    return res.json({
      recruited,
      newworkproof,
    });
  } catch (error) {
    console.error("Error fetching client homepage stats:", error);
    return res.status(500).json({ message: "Gagal mengambil data dashboard client" });
  }
};

function datenum(v) {
  if (!(v instanceof Date)) v = new Date(v);
  return (v - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d) ? "" : d.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return "";
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? "" : diffDays;
};

export const getRetentionReport = async (req, res) => {
  try {
    const { client_id } = req.query; //opsional
    const today = dayjs().format("YYYY-MM-DD");
    const nextMonth = dayjs().add(31, "day").format("YYYY-MM-DD");

    console.log(client_id + "kli");
    const {
      page = 1,
      limit = 10,
      sortKey = "id",
      sortOrder = "desc",
      filterKey = "client_name",
      search = "",
      export: isExport = "0",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Base where clause (range tanggal)
    const whereContract = {
      end_date: {
        [Op.gte]: today,
        [Op.lte]: nextMonth,
      },
    };

    // Tambahkan filter berdasarkan id
    if (filterKey === "id" && search) {
      whereContract.id =
        parseInt(search) || 0 // LIKE karena MariaDB
        ;
    }

    // Tambahkan filter untuk kategori (field langsung)
    if (filterKey === "category" && search) {
      whereContract.category = {
        [Op.like]: `%${search}%`,
      };
    }

    // Include dengan filter dan required dinamis
    const include = [
      {
        model: Talent,
        as: "talent",
        attributes: ["id", "name"],
        where:
          filterKey === "talent_name" && search
            ? { name: { [Op.like]: `%${search}%` } }
            : undefined,
        required: filterKey === "talent_name" && !!search,
      },
      {
        model: Client,
        as: "client",
        attributes: ["id", "name"],
        where: {
          ...(filterKey === "client_name" && search
            ? { name: { [Op.like]: `%${search}%` } }
            : {}),
          ...(client_id ? { id: client_id } : {}),
        },
        required:
          (filterKey === "client_name" && !!search) || !!client_id,
      },
    ];

    // Sorting
    let order = [];
    if (filterKey === "client_name") {
      order = [[{ model: Client, as: "client" }, "name", sortOrder]];
    } else if (filterKey === "talent_name") {
      order = [[{ model: Talent, as: "talent" }, "name", sortOrder]];
    } else {
      order = [[sortKey, sortOrder]];
    }

    const result = await TalentWorkHistory.findAndCountAll({
      where: whereContract,
      include,
      order,
      offset: isExport === "1" ? undefined : offset,
      limit: isExport === "1" ? undefined : parseInt(limit),
    });

    // EXPORT ke Excel

    if (isExport === "1") {
      const dataExport = result.rows.map((item) => ({
        "ID Kontrak": item.id,
        "Nama Perusahaan": item.client?.name || "-",
        "Nama Pekerja Kreatif": item.talent?.name || "-",
        "Posisi": item.category || "-",
        // pastikan input adalah Date, jangan pakai dayjs.format ke string
        "Tanggal Mulai Kontrak": item.start_date ? formatDate(item.start_date) : null,
        "Tanggal Berakhir Kontrak": item.end_date ? formatDate(item.end_date) : null,
        "Berakhir Dalam": calculateDaysRemaining(item.end_date) + " hari",
      }));

      const worksheet = xlsx.utils.json_to_sheet(dataExport);

      // Dapatkan range worksheet
      const range = xlsx.utils.decode_range(worksheet['!ref']);

      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Kolom tanggal mulai kontrak, kolom E index 4
        const startCellRef = xlsx.utils.encode_cell({ r: R, c: 4 });
        if (worksheet[startCellRef] && worksheet[startCellRef].v) {
          worksheet[startCellRef].t = "n"; // type number
          worksheet[startCellRef].z = xlsx.SSF.get_table()[14]; // format tanggal m/d/yy
          worksheet[startCellRef].v = datenum(worksheet[startCellRef].v);
        }

        // Kolom tanggal berakhir kontrak, kolom F index 5
        const endCellRef = xlsx.utils.encode_cell({ r: R, c: 5 });
        if (worksheet[endCellRef] && worksheet[endCellRef].v) {
          worksheet[endCellRef].t = "n";
          worksheet[endCellRef].z = xlsx.SSF.get_table()[14];
          worksheet[endCellRef].v = datenum(worksheet[endCellRef].v);
        }
      }

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Laporan Retensi");

      const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=laporan_retensi.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(buffer);
    }



    // NORMAL JSON
    const modifiedRows = result.rows.map((item) => {
      const plain = item.toJSON(); // ubah instance Sequelize jadi object biasa
      plain.days_remaining = calculateDaysRemaining(item.end_date);
      return plain;
    });
    return res.json({
      data: modifiedRows,
      total: result.count,
    });
  } catch (error) {
    console.error("Error getRetentionReport:", error);
    return res.status(500).json({ message: "Gagal mengambil data laporan retensi" });
  }
};

export const getPayrollHomepageStats = async (req, res) => {
  try {

    // Hitung bukti kerja baru (status 0) milik client
    const unpaid = await TalentWorkProof.count({
      where: {
        payment_status: 0,
        validation_status:1,
      },
    });

    return res.json({
      unpaid
    });
  } catch (error) {
    console.error("Error fetching client homepage stats:", error);
    return res.status(500).json({ message: "Gagal mengambil data dashboard client" });
  }
};