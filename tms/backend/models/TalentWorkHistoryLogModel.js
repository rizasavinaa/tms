import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentWorkHistory from "./TalentWorkHistoryModel.js";

const TalentWorkHistoryLog = sequelize.define('talent_work_history_log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  changes: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdby: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  talent_work_history_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
    freezeTableName: true,  // Menghindari perubahan nama tabel oleh Sequelize
    timestamps: true, // Masih mencatat timestamps
    updatedAt: false // Hanya menyimpan createdAt
});

TalentWorkHistory.hasMany(TalentWorkHistoryLog, {foreignKey: 'talent_work_history_id'});
TalentWorkHistoryLog.belongsTo(TalentWorkHistory,{foreignKey: 'talent_work_history_id'});

export default TalentWorkHistoryLog;
