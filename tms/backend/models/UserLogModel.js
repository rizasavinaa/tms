import {Sequelize} from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import { defaultValueSchemable } from "sequelize/lib/utils";

const {DataTypes} = Sequelize;

const UserLog = db.define('user_log',{
    id:{
        type: DataTypes.INTEGER, // Tipe data integer
        autoIncrement: true, // Auto-increment otomatis
        primaryKey: true, // Dijadikan primary key
    },
    user_id:{
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
    createdBy:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    }
},{
    freezeTableName:true,
    timestamps: true, // Masih mencatat timestamps
    updatedAt: false, // Hanya menyimpan createdAt
});

User.hasMany(UserLog, {foreignKey: 'user_id'});
UserLog.belongsTo(User,{foreignKey: 'user_id'});

export default UserLog;
