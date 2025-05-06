import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js"; 
import Talent from "./TalentModel.js";

const TalentPortofolio = sequelize.define('talent_portofolio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_link: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    talent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true, 
    timestamps: true, // Sequelize will handle createdAt & updatedAt
  });

  Talent.hasMany(TalentPortofolio, {foreignKey: 'talent_id'});
  TalentPortofolio.belongsTo(Talent,{foreignKey: 'talent_id'});
  
  export default TalentPortofolio;