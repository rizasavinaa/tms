import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Role = db.define("role", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
    },
    createdby: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
}, {
    freezeTableName: true,
    timestamps: true,  // Menambahkan createdAt & updatedAt otomatis
});

export default Role;
