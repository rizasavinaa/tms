import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; // Sesuaikan path ini dengan konfigurasi DB kamu
import User from "./UserModel.js"; // Import relasi ke model User

const Client = sequelize.define("Client", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(320),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    supervisor_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
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
    joined_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    freezeTableName: true,  // Menghindari perubahan nama tabel oleh Sequelize
    defaultScope: {}, // Pastikan tidak ada defaultScope yang mengecualikan kolom
});


export default Client;
