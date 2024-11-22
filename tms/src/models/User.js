const db = require('../../db');

module.exports =  db.define('user',{
    id:{
        type:db.Sequelize.INTEGER(11),
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    email:{
        type:db.Sequelize.STRING(320),
        allowNull:false
    },
    fullname:{
        type:db.Sequelize.STRING(200),
        allowNull:false
    },
    password:{
        type:db.Sequelize.STRING(255),
        allowNull:false
    }
 },
 {
    freezeTableName: true,
}
);

 