import { DataTypes } from "sequelize";
import db from "../config/Database.js"; // Import konfigurasi database
import User from "./UserModel.js"; // Import model User untuk createdby

const Privilege = db.define("privileges", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
        allowNull: true,
    }
}, {
    freezeTableName: true
});


export default Privilege;
