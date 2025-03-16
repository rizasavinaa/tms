import { DataTypes } from "sequelize";
import db from "../config/Database.js"; // Import konfigurasi database
import Role from "./RoleModel.js"; // Import model Role (jika ada)
import Privilege from "./PrivilegeModel.js"; // Import model Privilege (jika ada)
import User from "./UserModel.js"; // Import model User (jika ada, untuk createdby)

const RolePrivilege = db.define("role_privilege", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role, // Hubungkan ke tabel roles
            key: "id"
        }
    },
    privilege_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Privilege, // Hubungkan ke tabel privileges
            key: "id"
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    createdby: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true
});

// Hubungan antar tabel (Opsional)
Role.hasMany(RolePrivilege, { foreignKey: "role_id" });
Privilege.hasMany(RolePrivilege, { foreignKey: "privilege_id" });

RolePrivilege.belongsTo(Role, { foreignKey: "role_id" });
RolePrivilege.belongsTo(Privilege, { foreignKey: "privilege_id" });

export default RolePrivilege;
