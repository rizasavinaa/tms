import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import Talent from "./TalentModel.js";
import User from "./UserModel.js";

const TalentLog = sequelize.define('talent_log', {
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
  talent_id: {
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

User.hasMany(TalentLog, { foreignKey: 'createdby' });
TalentLog.belongsTo(User, { foreignKey: 'createdby' });

Talent.hasMany(TalentLog, {foreignKey: 'talent_id'});
TalentLog.belongsTo(Talent,{foreignKey: 'talent_id'});

export default TalentLog;
