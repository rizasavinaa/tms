import {Sequelize} from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import { defaultValueSchemable } from "sequelize/lib/utils";

const {DataTypes} = Sequelize;

const Role = db.define('role',{
    id:{
        type: DataTypes.INTEGER, // Tipe data integer
        autoIncrement: true, // Auto-increment otomatis
        primaryKey: true, // Dijadikan primary key
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [1, 100]
    },
    description:{
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
    }
},{
    freezeTableName:true
});

export default Role;
