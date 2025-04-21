import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentCategory from "./TalentCategoryModel.js";

const TalentCategoryLog = sequelize.define('talent_category_log', {
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
  talent_category_id: {
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

TalentCategory.hasMany(TalentCategoryLog, {foreignKey: 'talent_category_id'});
TalentCategoryLog.belongsTo(TalentCategory,{foreignKey: 'talent_category_id'});

export default TalentCategoryLog;
