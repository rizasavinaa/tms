import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import TalentCategory from "./TalentCategoryModel.js";
import TalentStatus from "./TalentStatusModel.js";
import User from "./UserModel.js";

const Talent = sequelize.define("talent", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      bank_account: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_salary: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
      },
      joined_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdby: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
        freezeTableName: true,  // Menghindari perubahan nama tabel oleh Sequelize
    });
  
    TalentCategory.hasMany(Talent, {foreignKey: 'category_id'});
    Talent.belongsTo(TalentCategory,{foreignKey: 'category_id'});

    TalentStatus.hasMany(Talent, {foreignKey: 'status_id'});
    Talent.belongsTo(TalentStatus,{foreignKey: 'status_id'});

    Talent.belongsTo(User, { foreignKey: 'user_id'});
    User.hasOne(Talent, { foreignKey: 'user_id'});

    // Talent.associate = (models) => {
    //   Talent.belongsTo(models.TalentCategory, {
    //     foreignKey: "category_id",
    //     as: "category",
    //   });
  
    //   Talent.belongsTo(models.TalentStatus, {
    //     foreignKey: "status_id",
    //     as: "status",
    //   });
  
    //   Talent.belongsTo(models.User, {
    //     foreignKey: "user_id",
    //     as: "user",
    //   });
  
    //   // Jika kamu punya model Client dan Creator, kamu bisa tambahkan relasi juga
    //   // Talent.belongsTo(models.Client, { foreignKey: "client_id", as: "client" });
    //   // Talent.belongsTo(models.User, { foreignKey: "createdby", as: "creator" });
    // };
  
export default Talent;