import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Role from "./RoleModel.js";

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

// RoleLog.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(RoleLog, { foreignKey: 'createdBy'});
RoleLog.belongsTo(User, { foreignKey: 'createdBy'});

Role.hasMany(RoleLog, {foreignKey: 'role_id'});
RoleLog.belongsTo(Role,{foreignKey: 'role_id'});

export default RoleLog;
