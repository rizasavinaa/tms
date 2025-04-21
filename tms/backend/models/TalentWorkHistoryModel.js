import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import Talent from "./TalentModel.js";

const TalentWorkHistory = sequelize.define('talent_work_history', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    talent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_link: {
      type: DataTypes.STRING(320),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  Talent.hasMany(TalentWorkHistory, {foreignKey: 'talent_id'});
  TalentWorkHistory.belongsTo(Talent,{foreignKey: 'talent_id'});
  
  export default TalentWorkHistory;