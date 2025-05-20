import {Sequelize} from "sequelize";
import db from "../config/Database.js";
import Client from "./ClientModel.js";
import { defaultValueSchemable } from "sequelize/lib/utils";
import User from "./UserModel.js";

const {DataTypes} = Sequelize;

const ClientLog = db.define('client_log',{
    id:{
        type: DataTypes.INTEGER, // Tipe data integer
        autoIncrement: true, // Auto-increment otomatis
        primaryKey: true, // Dijadikan primary key
    },
    client_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    changes:{
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    createdby:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: true  // Bisa null kalau belum login
    }
},{
    freezeTableName:true,
    timestamps: true, // Masih mencatat timestamps
    updatedAt: false, // Hanya menyimpan createdAt
});

User.hasMany(ClientLog, { foreignKey: 'createdby' });
ClientLog.belongsTo(User, { foreignKey: 'createdby' });

Client.hasMany(ClientLog, {foreignKey: 'client_id'});
ClientLog.belongsTo(Client,{foreignKey: 'client_id'});

export default ClientLog;
