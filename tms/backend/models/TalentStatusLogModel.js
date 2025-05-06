import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentStatus from "./TalentStatusModel.js";
import User from "./UserModel.js";

const TalentStatusLog = sequelize.define('talent_status_log', {
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
  talent_status_id: {
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

User.hasMany(TalentStatusLog, { foreignKey: 'createdby' });
TalentStatusLog.belongsTo(User, { foreignKey: 'createdby' });

TalentStatus.hasMany(TalentStatusLog, {foreignKey: 'talent_status_id'});
TalentStatusLog.belongsTo(TalentStatus,{foreignKey: 'talent_status_id'});

export default TalentStatusLog;
