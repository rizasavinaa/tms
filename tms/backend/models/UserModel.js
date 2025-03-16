import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Role from "./RoleModel.js";

const { DataTypes } = Sequelize;

const User = db.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,  // Wajib diisi agar tidak ada error notEmpty
        validate: {
            notEmpty: true
        }
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true,  // Menghindari perubahan nama tabel oleh Sequelize
    defaultScope: {}, // Pastikan tidak ada defaultScope yang mengecualikan kolom
});

// Hubungan dengan Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Hook untuk memastikan semua kolom dipilih tanpa kecuali
User.addHook("beforeFind", (options) => {
    if (!options.attributes) {
        options.attributes = { exclude: [] };  // Pastikan semua kolom dipilih
    }
});

export default User;
