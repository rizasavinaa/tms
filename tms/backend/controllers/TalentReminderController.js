import moment from "moment";
import Talent from "../models/TalentModel.js";
import TalentPortofolio from "../models/TalentPortofolioModel.js";
import TalentWorkProof from "../models/TalentWorkProofModel.js";
import TalentWorkHistory from "../models/TalentWorkHistoryModel.js";
import sequelize from "../config/Database.js";
import { Op } from "sequelize";

export const getTalentReminders = async (req, res) => {
    try {
        const userId = req.session.userId;
        const talent = await Talent.findOne({ where: { user_id: userId } });

        if (!talent) {
            return res.status(404).json({ message: "Talent tidak ditemukan" });
        }

        let reminderPorto = false;
        let reminderBuktiKerja = false;
        let reminderBuktiKerjaLalu = false;

        // Reminder 1: Belum punya portofolio
        const portfolioCount = await TalentPortofolio.count({
            where: { talent_id: talent.id }
        });

        if (portfolioCount === 0) {
            reminderPorto = true;
        }

        const today = moment();

        if (talent.status_id === 2) {
            console.log("weekontraaak1  ");
            const activeContract = await TalentWorkHistory.findOne({
                where: {
                    talent_id: talent.id,
                    client_id: talent.client_id,
                    start_date: {
                        [Op.lte]: today.toDate(),
                    },
                    end_date: {
                        [Op.gte]: today.toDate(),
                    }
                },
            });

            if (activeContract) {
                console.log("weekontraaak2");
                const startContractMonth = moment(activeContract.start_date).startOf("month");
                const endContractMonth = moment(activeContract.end_date).endOf("month");
                const now = moment();

                const workProofs = await TalentWorkProof.findAll({
                    where: {
                        talent_id: talent.id
                    },
                });

                const monthsWithProof = new Set(
                    workProofs.map(item =>
                        moment(item.start_date).format("YYYY-MM")
                    )
                );

                const monthCursor = startContractMonth.clone();

                while (monthCursor.isSameOrBefore(endContractMonth, 'month')) {
                    const currentMonthString = monthCursor.format("YYYY-MM");

                    const isCurrentMonth = monthCursor.isSame(now, 'month');
                    const isPastMonth = monthCursor.isBefore(now, 'month');

                    // Jika bulan ini, cek apakah hari > 23 dan belum submit
                    if (isCurrentMonth && now.date() > 23 && !monthsWithProof.has(currentMonthString)) {
                        reminderBuktiKerja = true;
                        break;
                    }

                    // Jika bulan yang sudah lewat, tapi belum submit
                    if (isPastMonth && !monthsWithProof.has(currentMonthString)) {
                        reminderBuktiKerjaLalu = true;
                        break;
                    }

                    monthCursor.add(1, "month");
                }
            }
        }



        return res.json({
            reminderPorto,
            reminderBuktiKerja,
            reminderBuktiKerjaLalu
        });

    } catch (error) {
        console.error("Gagal mengambil reminder:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil reminder." });
    }
};
