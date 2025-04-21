import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import Privilege from "./PrivilegeModel.js";

const PrivilegeLog = sequelize.define('privilege_log', {
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
  privilege_id: {
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

Privilege.hasMany(PrivilegeLog, {foreignKey: 'privilege_id'});
PrivilegeLog.belongsTo(Privilege,{foreignKey: 'privilege_id'});

export default PrivilegeLog;
