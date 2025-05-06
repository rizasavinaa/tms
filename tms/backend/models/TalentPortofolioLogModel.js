import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentPortofolio from "./TalentPortofolioModel.js";
import User from "./UserModel.js";

const TalentPortofolioLog = sequelize.define('talent_portofolio_log', {
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
  talent_portofolio_id: {
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

User.hasMany(TalentPortofolioLog, { foreignKey: 'createdby' });
TalentPortofolioLog.belongsTo(User, { foreignKey: 'createdby' });

TalentPortofolio.hasMany(TalentPortofolioLog, {foreignKey: 'talent_portofolio_id'});
TalentPortofolioLog.belongsTo(TalentPortofolio,{foreignKey: 'talent_portofolio_id'});

export default TalentPortofolioLog;
