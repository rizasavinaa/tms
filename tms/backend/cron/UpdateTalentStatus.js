import cron from "node-cron";
import sequelize from "../config/Database.js";

cron.schedule("0 2 * * *", async () => { //setiap jam 2
// cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Cron dimulai: Optimasi update status talent");

    const query = `
      UPDATE talent t
      SET status_id = 1
      WHERE t.id IN (
        SELECT t.id FROM talent t
        LEFT JOIN (
          SELECT talent_id, MAX(end_date) as max_end
          FROM talent_work_history
          GROUP BY talent_id
        ) tw ON tw.talent_id = t.id
        WHERE tw.max_end < CURRENT_DATE
      )
      AND NOT EXISTS (
        SELECT 1 FROM talent_work_history
        WHERE talent_id = t.id
        AND end_date >= CURRENT_DATE
      );
    `;

    await sequelize.query(query);
    console.log("✅ Talent yang semua kontraknya berakhir sudah di-set statusnya ke 1 (Available)");
  } catch (error) {
    console.error("❌ Error pada cron update status talent:", error);
  }
});
