const Sequelize = require('sequelize');
const db = new Sequelize('tms','root','',{
    host:"127.0.0.1",
    dialect:"mysql",
    freezeTableName: true,
    modelName: 'singularName'
});

module.exports = db;
global.db = db