import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentWorkProof from "./TalentWorkProofModel.js";

const TalentWorkProofLog = sequelize.define('talent_work_proof_log', {
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
  talent_work_proof_id: {
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

TalentWorkProof.hasMany(TalentWorkProofLog, {foreignKey: 'talent_work_proof_id'});
TalentWorkProofLog.belongsTo(TalentWorkProof,{foreignKey: 'talent_work_proof_id'});

export default TalentWorkProofLog;
