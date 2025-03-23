import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const RoleLog = db.define("role_log", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    changes: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,  // createdAt & updatedAt otomatis
});

export default RoleLog;
