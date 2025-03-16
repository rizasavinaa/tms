import {Sequelize} from "sequelize";

const db = new Sequelize('tms','root','',{
    host: 'localhost',
    dialect: 'mysql',   
    timezone: "+07:00", // WIB (GMT+7)
    dialectOptions: {
        timezone: "Asia/Jakarta",
    },
});

export default db;