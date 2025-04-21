import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 

const TalentCategory = sequelize.define('talent_category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true,  // Menghindari perubahan nama tabel oleh Sequelize
    timestamps: true, // Masih mencatat timestamps
  });

export default TalentCategory;